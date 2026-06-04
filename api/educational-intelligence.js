const { adaptContentForAccessibility } = require('../accessibility/accessibilityIntelligence')
const { buildAdaptiveRecommendations } = require('../adaptive/recommendationEngine')
const { suggestShortAnswerFeedback } = require('../ai/gradingAssist')
const { createAIGovernanceRecord } = require('../ai/governance')
const { buildInstitutionAnalytics } = require('../analytics/learningAnalytics')
const { buildMasteryProfile } = require('../mastery/masteryTracker')
const { indexLearningResources } = require('../rag/semanticSearch')
const { answerWithCourseContext } = require('../rag/tutorResponder')
const {
  ensureCourseAccess,
  getQuery,
  getSupabase,
  requireUserId,
  respondWithError,
} = require('./_lms')

module.exports = async (req, res) => {
  try {
    const userId = requireUserId(req)
    const action = req.params?.action || ''

    if (req.method === 'GET' && action === 'status') {
      return res.status(200).json({
        phase: 4,
        status: 'active',
        capabilities: [
          'local-rag',
          'semantic-search',
          'teacher-reviewed-ai-grading',
          'institutional-analytics',
          'predictive-success-signals',
          'long-term-mastery',
          'accessibility-intelligence',
          'adaptive-recommendations',
          'ai-governance',
          'offline-provider-ready',
        ],
        provider: process.env.ACADEMEE_AI_PROVIDER || 'local',
      })
    }

    if (req.method === 'POST' && action === 'rag-query') {
      const body = req.body || {}
      if (!body.course_id) return res.status(400).json({ error: 'course_id required' })
      if (!body.question) return res.status(400).json({ error: 'question required' })
      await ensureCourseAccess(body.course_id, userId)
      const resources = await loadCourseResources(body.course_id)
      indexLearningResources(resources)
      const response = await answerWithCourseContext({ question: body.question, courseId: body.course_id })
      return res.status(200).json({
        ...response,
        governance: createAIGovernanceRecord({
          feature: 'rag-tutor',
          actorId: userId,
          courseId: body.course_id,
          generatedContent: response.answer,
        }),
      })
    }

    if (req.method === 'POST' && action === 'grading-suggest') {
      const body = req.body || {}
      const suggestion = suggestShortAnswerFeedback(body)
      return res.status(200).json({
        ...suggestion,
        governance: createAIGovernanceRecord({
          feature: 'grading-assist',
          actorId: userId,
          courseId: body.course_id || null,
          generatedContent: suggestion.feedbackSuggestion,
        }),
      })
    }

    if (req.method === 'POST' && action === 'accessibility-adapt') {
      const body = req.body || {}
      if (!body.text) return res.status(400).json({ error: 'text required' })
      const adapted = adaptContentForAccessibility(body.text, { mode: body.mode })
      return res.status(200).json({
        ...adapted,
        governance: createAIGovernanceRecord({
          feature: 'accessibility-adaptation',
          actorId: userId,
          courseId: body.course_id || null,
          generatedContent: adapted.adaptedText,
        }),
      })
    }

    if (req.method === 'GET' && action === 'analytics') {
      const courseId = getQuery(req, 'course_id')
      if (courseId) await ensureCourseAccess(courseId, userId, { teacherOnly: true })
      const dataset = await loadAnalyticsDataset(courseId)
      return res.status(200).json(buildInstitutionAnalytics(dataset))
    }

    if (req.method === 'GET' && action === 'mastery') {
      const courseId = getQuery(req, 'course_id')
      if (!courseId) return res.status(400).json({ error: 'course_id required' })
      await ensureCourseAccess(courseId, userId)
      const dataset = await loadAnalyticsDataset(courseId)
      return res.status(200).json({
        generatedAt: new Date().toISOString(),
        courseId,
        mastery: buildMasteryProfile(dataset),
      })
    }

    if (req.method === 'GET' && action === 'recommendations') {
      const courseId = getQuery(req, 'course_id')
      if (!courseId) return res.status(400).json({ error: 'course_id required' })
      await ensureCourseAccess(courseId, userId)
      const dataset = await loadAnalyticsDataset(courseId)
      const mastery = buildMasteryProfile(dataset)
      return res.status(200).json({
        generatedAt: new Date().toISOString(),
        courseId,
        recommendations: buildAdaptiveRecommendations({ ...dataset, mastery }),
        governance: createAIGovernanceRecord({
          feature: 'adaptive-recommendations',
          actorId: userId,
          courseId,
          requiresReview: false,
        }),
      })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(404).json({ error: 'unknown intelligence action' })
  } catch (err) {
    return respondWithError(res, err)
  }
}

async function loadCourseResources(courseId) {
  const db = getSupabase()
  const [modules, assignments, quizzes, announcements] = await Promise.all([
    db.from('course_modules').select('*').eq('course_id', courseId),
    db.from('assignments').select('*').eq('course_id', courseId),
    db.from('quizzes').select('*').eq('course_id', courseId),
    db.from('notifications').select('*').eq('course_id', courseId).eq('type', 'announcement'),
  ])

  ;[modules, assignments, quizzes, announcements].forEach((result) => {
    if (result.error) throw result.error
  })

  return [
    ...(modules.data || []).map((item) => ({ ...item, type: 'module', text: `${item.title || ''}. ${item.description || ''}` })),
    ...(assignments.data || []).map((item) => ({ ...item, type: item.kind || 'assignment', text: `${item.title || ''}. ${item.instructions || ''}` })),
    ...(quizzes.data || []).map((item) => ({ ...item, type: 'quiz', text: `${item.title || ''}. ${item.description || ''} ${JSON.stringify(item.meta || {})}` })),
    ...(announcements.data || []).map((item) => ({ ...item, type: 'announcement', text: `${item.title || ''}. ${item.body || ''}` })),
  ]
}

async function loadAnalyticsDataset(courseId = null) {
  const db = getSupabase()
  const courseQuery = db.from('courses').select('*')
  const assignmentQuery = db.from('assignments').select('*')
  const quizQuery = db.from('quizzes').select('*')

  if (courseId) {
    courseQuery.eq('id', courseId)
    assignmentQuery.eq('course_id', courseId)
    quizQuery.eq('course_id', courseId)
  }

  const [courses, assignments, quizzes] = await Promise.all([courseQuery, assignmentQuery, quizQuery])
  ;[courses, assignments, quizzes].forEach((result) => {
    if (result.error) throw result.error
  })

  const assignmentIds = (assignments.data || []).map((item) => item.id)
  let submissions = { data: [], error: null }
  if (assignmentIds.length) {
    submissions = await db.from('submissions').select('*').in('assignment_id', assignmentIds)
  }
  if (submissions.error) throw submissions.error

  return {
    courses: courses.data || [],
    assignments: assignments.data || [],
    quizzes: quizzes.data || [],
    submissions: submissions.data || [],
    accessibilityEvents: [],
  }
}
