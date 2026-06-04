const path = require('path')
const { ensureCourseAccess, getSupabase, requireUserId, respondWithError } = require('./_lms')
const { buildMasteryProfile } = require(path.resolve(__dirname, '..', 'adaptive', 'masteryEngine'))
const { buildLearningPath } = require(path.resolve(__dirname, '..', 'adaptive', 'recommendationEngine'))
const { buildDifficultyPlan } = require(path.resolve(__dirname, '..', 'adaptive', 'difficultyEngine'))
const { buildPredictiveInsights } = require(path.resolve(__dirname, '..', 'adaptive', 'predictiveAnalytics'))
const { buildRemediationPlan } = require(path.resolve(__dirname, '..', 'adaptive', 'remediationEngine'))
const { answerCourseQuestion } = require(path.resolve(__dirname, '..', 'ai', 'tutor', 'tutorEngine'))

async function loadCourseContext(courseId, userId, access) {
  const db = getSupabase()
  const [
    { data: modules, error: modulesError },
    { data: assignmentRows, error: assignmentsError },
    { data: quizzes, error: quizzesError },
    { data: announcements, error: announcementsError },
  ] = await Promise.all([
    db.from('course_modules').select('*').eq('course_id', courseId).order('position', { ascending: true }),
    db.from('assignments').select('*').eq('course_id', courseId).order('created_at', { ascending: false }),
    db.from('quizzes').select('*').eq('course_id', courseId).order('created_at', { ascending: false }),
    db.from('notifications').select('*').eq('course_id', courseId).order('created_at', { ascending: false }).limit(25),
  ])

  if (modulesError) throw modulesError
  if (assignmentsError) throw assignmentsError
  if (quizzesError) throw quizzesError
  if (announcementsError) throw announcementsError

  const assignmentIds = (assignmentRows || []).map((item) => item.id)
  const { data: submissions, error: submissionsError } = assignmentIds.length
    ? access.isTeacher
      ? await db.from('submissions').select('*').in('assignment_id', assignmentIds)
      : await db.from('submissions').select('*').eq('student_id', userId).in('assignment_id', assignmentIds)
    : { data: [], error: null }

  if (submissionsError) throw submissionsError

  const visibleAssignments = (assignmentRows || []).filter((item) => item.kind === 'assignment' && (access.isTeacher || item.status === 'published'))
  const quizAssignments = (assignmentRows || []).filter((item) => item.kind === 'quiz' && (access.isTeacher || item.status === 'published'))
  const submissionsForCourse = submissions || []

  return {
    course: access.course,
    modules: modules || [],
    assignments: visibleAssignments,
    quizAssignments,
    quizzes: (quizzes || []).map((quiz) => {
      const assignment = quizAssignments.find((item) => String(item.quiz_id) === String(quiz.id))
      return {
        ...quiz,
        assignment_id: assignment?.id,
        due_at: assignment?.due_at,
        status: assignment?.status,
        instructions: assignment?.instructions || quiz.description,
      }
    }).filter((quiz) => access.isTeacher || quiz.status === 'published'),
    announcements: (announcements || []).filter((item) => item.type === 'announcement'),
    submissions: submissionsForCourse,
  }
}

function buildProgressSummary({ assignments = [], quizzes = [], submissions = [] }) {
  const submissionMap = new Map(submissions.map((submission) => [String(submission.assignment_id), submission]))
  const completedAssignments = assignments.filter((item) => {
    const submission = submissionMap.get(String(item.id))
    return submission?.submitted_at || ['submitted', 'graded', 'late'].includes(String(submission?.status))
  }).length
  const completedQuizzes = quizzes.filter((item) => {
    const submission = submissionMap.get(String(item.assignment_id || item.id))
    return submission?.submitted_at || ['submitted', 'graded', 'late'].includes(String(submission?.status))
  }).length
  const overdueAssignments = assignments.filter((item) => item.due_at && new Date(item.due_at) < new Date() && !submissionMap.get(String(item.id))?.submitted_at).length
  const total = assignments.length + quizzes.length

  return {
    completed_assignments: completedAssignments,
    total_assignments: assignments.length,
    completed_quizzes: completedQuizzes,
    total_quizzes: quizzes.length,
    overdue_assignments: overdueAssignments,
    course_completion_percentage: total ? Math.round(((completedAssignments + completedQuizzes) / total) * 100) : 0,
  }
}

module.exports = async (req, res) => {
  try {
    const userId = requireUserId(req)
    const courseId = req.params?.courseId || req.query?.course_id || req.body?.course_id
    if (!courseId) return res.status(400).json({ error: 'course id required' })

    const access = await ensureCourseAccess(courseId, userId)
    const context = await loadCourseContext(courseId, userId, access)

    if (req.url?.includes('/tutor') && req.method === 'POST') {
      const question = req.body?.question || ''
      if (!question.trim()) return res.status(400).json({ error: 'question required' })
      return res.status(200).json(answerCourseQuestion({ question, ...context }))
    }

    if (req.method === 'GET') {
      const progress = buildProgressSummary(context)
      const mastery = buildMasteryProfile(context)
      const recommendations = buildLearningPath({ ...context, masteryProfile: mastery })
      const difficulty = buildDifficultyPlan(mastery)
      const insights = buildPredictiveInsights({ masteryProfile: mastery, progress, submissions: context.submissions })
      const remediation = buildRemediationPlan(mastery)

      return res.status(200).json({
        course_id: courseId,
        role: access.isTeacher ? 'teacher' : 'student',
        generated_at: new Date().toISOString(),
        progress,
        mastery,
        recommendations,
        difficulty,
        insights,
        remediation,
      })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'method not allowed' })
  } catch (err) {
    return respondWithError(res, err)
  }
}
