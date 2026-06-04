const { clamp, getKeywords, normalizeText } = require('./contentUtils')

function statusIsComplete(status) {
  return ['submitted', 'graded', 'late', 'completed'].includes(String(status || '').toLowerCase())
}

function scoreToMastery(score, fallback = 55) {
  if (score === null || score === undefined || score === '') return fallback
  return clamp(score)
}

function buildConceptSeeds({ assignments = [], quizzes = [], modules = [], announcements = [] }) {
  const seeds = new Map()
  const add = (label, sourceType, sourceId, weight = 1) => {
    if (!label) return
    const key = normalizeText(label).toLowerCase()
    if (!key) return
    const current = seeds.get(key) || { concept: key, weight: 0, sources: [] }
    current.weight += weight
    current.sources.push({ sourceType, sourceId })
    seeds.set(key, current)
  }

  modules.forEach((item) => getKeywords(`${item.title} ${item.description}`, 4).forEach((word) => add(word, 'module', item.id, 1.3)))
  assignments.forEach((item) => getKeywords(`${item.title} ${item.instructions}`, 4).forEach((word) => add(word, 'assignment', item.id, 1)))
  quizzes.forEach((item) => getKeywords(`${item.title} ${item.description}`, 5).forEach((word) => add(word, 'quiz', item.id, 1.4)))
  announcements.forEach((item) => getKeywords(`${item.title} ${item.body}`, 3).forEach((word) => add(word, 'announcement', item.id, 0.5)))

  return Array.from(seeds.values()).sort((a, b) => b.weight - a.weight).slice(0, 10)
}

function buildMasteryProfile({ assignments = [], quizzes = [], submissions = [], attempts = [], modules = [], announcements = [] }) {
  const submissionMap = new Map((submissions || []).map((submission) => [String(submission.assignment_id), submission]))
  const conceptSeeds = buildConceptSeeds({ assignments, quizzes, modules, announcements })
  const conceptScores = new Map()

  const addScore = (concept, score, evidence) => {
    const key = normalizeText(concept).toLowerCase()
    if (!key) return
    const current = conceptScores.get(key) || { concept: key, total: 0, count: 0, evidence: [] }
    current.total += clamp(score)
    current.count += 1
    current.evidence.push(evidence)
    conceptScores.set(key, current)
  }

  assignments.forEach((assignment) => {
    const submission = submissionMap.get(String(assignment.id))
    const completed = statusIsComplete(submission?.status) || Boolean(submission?.submitted_at)
    const baseScore = completed ? scoreToMastery(submission?.score, 68) : assignment.due_at && new Date(assignment.due_at) < new Date() ? 35 : 52
    getKeywords(`${assignment.title} ${assignment.instructions}`, 4).forEach((concept) => addScore(concept, baseScore, { type: 'assignment', id: assignment.id, title: assignment.title }))
  })

  quizzes.forEach((quiz) => {
    const matchingAttempt = (attempts || []).find((attempt) => String(attempt.quiz_id || attempt.quizId || attempt.assignment_id) === String(quiz.id))
    const baseScore = scoreToMastery(matchingAttempt?.score ?? matchingAttempt?.percentage, matchingAttempt ? 65 : 50)
    getKeywords(`${quiz.title} ${quiz.description}`, 4).forEach((concept) => addScore(concept, baseScore, { type: 'quiz', id: quiz.id, title: quiz.title }))
  })

  conceptSeeds.forEach((seed) => {
    if (!conceptScores.has(seed.concept)) addScore(seed.concept, 50, { type: 'content', title: seed.concept })
  })

  const concepts = Array.from(conceptScores.values()).map((item) => {
    const mastery = Math.round(item.total / Math.max(1, item.count))
    return {
      concept: item.concept,
      mastery,
      level: mastery >= 80 ? 'Strong' : mastery >= 60 ? 'Developing' : 'Needs support',
      evidence: item.evidence.slice(0, 3),
    }
  }).sort((a, b) => a.mastery - b.mastery)

  const averageMastery = concepts.length
    ? Math.round(concepts.reduce((sum, item) => sum + item.mastery, 0) / concepts.length)
    : 0

  return {
    averageMastery,
    concepts,
    weakConcepts: concepts.filter((item) => item.mastery < 60).slice(0, 5),
    strongConcepts: [...concepts].filter((item) => item.mastery >= 80).slice(0, 5),
    developingConcepts: concepts.filter((item) => item.mastery >= 60 && item.mastery < 80).slice(0, 5),
  }
}

module.exports = {
  buildMasteryProfile,
}
