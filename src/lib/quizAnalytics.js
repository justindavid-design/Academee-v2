const QUIZ_ATTEMPTS_KEY = 'academee_quiz_attempts'

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'what', 'when', 'where', 'which',
  'into', 'your', 'their', 'there', 'have', 'will', 'would', 'could', 'should', 'about',
  'into', 'after', 'before', 'using', 'use', 'used', 'quiz', 'question', 'answer', 'correct',
  'incorrect', 'true', 'false', 'option', 'options', 'student', 'teacher', 'learn', 'learning',
  'review', 'module', 'assignment', 'announcement', 'content', 'lesson', 'topic',
])

function canUseDOM() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function safeParse(value, fallback) {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch (_error) {
    return fallback
  }
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function unique(values = []) {
  return Array.from(new Set(values.filter(Boolean)))
}

function getQuestionText(question) {
  return normalizeText(question?.question || question?.text || question?.prompt || question?.title)
}

function inferConceptTags(question) {
  const tags = []

  if (Array.isArray(question?.conceptTags)) {
    tags.push(...question.conceptTags.map(normalizeText))
  }

  if (Array.isArray(question?.tags)) {
    tags.push(...question.tags.map(normalizeText))
  }

  if (question?.topic) {
    tags.push(...normalizeText(question.topic).split(/[,/|]/g))
  }

  if (question?.bloom) {
    tags.push(`Bloom: ${normalizeText(question.bloom)}`)
  }

  const words = getQuestionText(question)
    .toLowerCase()
    .match(/[a-z][a-z-]{3,}/g) || []

  words
    .filter((word) => !STOP_WORDS.has(word))
    .slice(0, 5)
    .forEach((word) => tags.push(word))

  return unique(tags).slice(0, 6)
}

function getQuestionId(question, index) {
  return question?.id || `question-${index + 1}`
}

function getCorrectOption(question) {
  if (!question) return ''
  const index = Number(question.correct)
  return question?.options?.[index] ?? question?.choices?.[index] ?? question?.correctAnswer ?? question?.correctOption ?? ''
}

function getSelectedOption(question, selectedIndex) {
  if (!question) return ''
  return question?.options?.[Number(selectedIndex)] ?? question?.choices?.[Number(selectedIndex)] ?? ''
}

function aggregateCounts(map, key, isCorrect) {
  if (!key) return
  const next = map[key] || { attempts: 0, correct: 0 }
  next.attempts += 1
  if (isCorrect) next.correct += 1
  map[key] = next
}

export function buildAttemptAnalytics(questions = [], answers = [], meta = {}) {
  const questionAnalytics = (Array.isArray(questions) ? questions : []).map((question, index) => {
    const answer = answers[index] || {}
    const chosen = Number(answer.chosen ?? answer.selectedAnswer ?? answer.selected ?? answer.answer)
    const correct = Number(question.correct ?? answer.correct ?? 0)
    const isCorrect = Number.isFinite(chosen) && chosen === correct
    const conceptTags = unique([
      ...inferConceptTags(question),
      ...inferConceptTags(answer),
    ])
    const selectedAnswerText = normalizeText(
      answer.selectedAnswerText ||
        answer.selected_answer ||
        answer.selectedOption ||
        answer.selected_answer_text ||
        getSelectedOption(question, chosen)
    )
    const responseTimeMs = Number(answer.responseTimeMs ?? answer.response_time_ms ?? answer.responseTime ?? answer.response_time)
    const responseTime = Number.isFinite(responseTimeMs)
      ? (responseTimeMs > 1000 ? Math.round(responseTimeMs / 1000) : responseTimeMs)
      : null
    const masteryBefore = Number.isFinite(Number(answer.masteryBefore ?? answer.mastery_before))
      ? Number(answer.masteryBefore ?? answer.mastery_before)
      : null
    const masteryAfter = Number.isFinite(Number(answer.masteryAfter ?? answer.mastery_after))
      ? Number(answer.masteryAfter ?? answer.mastery_after)
      : null

    return {
      questionId: getQuestionId(question, index),
      question_id: getQuestionId(question, index),
      questionIndex: index,
      text: getQuestionText(question),
      difficulty: normalizeText(question?.difficulty || answer?.difficulty || 'Medium') || 'Medium',
      bloom: normalizeText(question?.bloom || answer?.bloom || ''),
      conceptTags,
      concept: conceptTags[0] || 'general',
      chosen,
      correct,
      isCorrect,
      selected_answer: selectedAnswerText,
      selected_answer_index: Number.isFinite(chosen) ? chosen : null,
      response_time: responseTime,
      response_time_ms: Number.isFinite(responseTimeMs) ? responseTimeMs : null,
      mastery_before: masteryBefore,
      mastery_after: masteryAfter,
      selectedOption: getSelectedOption(question, chosen),
      correctOption: getCorrectOption(question),
      explanation: normalizeText(answer?.explanation || question?.explanation || ''),
      learningTip: normalizeText(answer?.learningTip || question?.learningTip || ''),
      trivia: normalizeText(answer?.trivia || question?.trivia || ''),
    }
  })

  const score = questionAnalytics.filter((item) => item.isCorrect).length
  const total = questionAnalytics.length
  const percentage = total ? Math.round((score / total) * 100) : 0

  const conceptCounts = {}
  const weakConceptCounts = {}
  questionAnalytics.forEach((item) => {
    item.conceptTags.forEach((tag) => aggregateCounts(conceptCounts, tag, item.isCorrect))
    if (!item.isCorrect) {
      item.conceptTags.forEach((tag) => aggregateCounts(weakConceptCounts, tag, false))
    }
  })

  const masteryByConcept = Object.entries(conceptCounts)
    .map(([concept, stats]) => ({
      concept,
      accuracy: stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0,
      attempts: stats.attempts,
    }))
    .sort((a, b) => b.accuracy - a.accuracy || b.attempts - a.attempts)

  const strengths = masteryByConcept.filter((item) => item.attempts > 0 && item.accuracy >= 75).slice(0, 4)
  const weaknesses = masteryByConcept.filter((item) => item.attempts > 0 && item.accuracy < 60).slice(0, 4)

  const reviewQueue = questionAnalytics
    .filter((item) => !item.isCorrect)
    .slice(0, 5)
    .map((item) => ({
      questionId: item.questionId,
      question: item.text,
      conceptTags: item.conceptTags,
      tip: item.learningTip || item.explanation || 'Review the related lesson material and try again.',
    }))

  const hardQuestions = [...questionAnalytics]
    .sort((a, b) => Number(a.isCorrect) - Number(b.isCorrect))
    .slice(0, 3)

  return {
    ...meta,
    total,
    score,
    percentage,
    questionAnalytics,
    masteryByConcept,
    strengths,
    weaknesses,
    reviewQueue,
    hardQuestions,
    masteredCount: questionAnalytics.filter((item) => item.isCorrect).length,
  }
}

export function getStoredQuizAttempts() {
  if (!canUseDOM()) return []
  return safeParse(window.localStorage.getItem(QUIZ_ATTEMPTS_KEY), [])
}

export function recordQuizAttempt(attempt) {
  if (!canUseDOM() || !attempt?.quizId) return attempt || null

  const existing = getStoredQuizAttempts()
  const nextAttempt = {
    id: attempt.id || `${attempt.quizId}-${attempt.userId || 'guest'}-${Date.now()}`,
    timestamp: attempt.timestamp || new Date().toISOString(),
    ...attempt,
  }

  const next = [...existing, nextAttempt].slice(-250)
  window.localStorage.setItem(QUIZ_ATTEMPTS_KEY, JSON.stringify(next))
  return nextAttempt
}

export function getQuizAttempts({ quizId = null, userId = null } = {}) {
  const attempts = getStoredQuizAttempts()
  return attempts.filter((attempt) => {
    if (quizId && String(attempt.quizId) !== String(quizId)) return false
    if (userId && String(attempt.userId) !== String(userId)) return false
    return true
  })
}

export function buildTeacherAnalytics(questions = [], attempts = []) {
  const questionList = Array.isArray(questions) ? questions : []
  const attemptList = Array.isArray(attempts) ? attempts : []

  const normalizedAttempts = attemptList
    .map((attempt) => {
      const answers = Array.isArray(attempt.answers) ? attempt.answers : []
      const score = Number(attempt.score ?? answers.filter((item) => item?.isCorrect).length)
      const total = Number(attempt.total ?? questionList.length)
      const percentage = Number(attempt.percentage ?? (total ? Math.round((score / total) * 100) : 0))
      const answered = answers.filter((item) => item != null).length
      return {
        ...attempt,
        answers,
        score,
        total,
        percentage,
        answered,
      }
    })
    .filter((attempt) => attempt.total > 0)

  const aggregateByQuestion = questionList.map((question, index) => {
    const questionId = getQuestionId(question, index)
    const rows = normalizedAttempts
      .map((attempt) => attempt.answers.find((item) => String(item.questionId) === String(questionId) || Number(item.questionId) === index || Number(item.questionId) === index + 1))
      .filter(Boolean)

    const correctCount = rows.filter((row) => row.isCorrect).length
    const attemptsCount = rows.length
    const accuracy = attemptsCount ? Math.round((correctCount / attemptsCount) * 100) : 0

    return {
      questionId,
      text: getQuestionText(question),
      accuracy,
      attempts: attemptsCount,
      difficulty: normalizeText(question?.difficulty || 'Medium'),
    }
  })

  const averageScore = normalizedAttempts.length
    ? Math.round(normalizedAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / normalizedAttempts.length)
    : 0

  const completionRate = normalizedAttempts.length
    ? Math.round(normalizedAttempts.reduce((sum, attempt) => sum + ((attempt.answered / Math.max(1, attempt.total)) * 100), 0) / normalizedAttempts.length)
    : 0

  const rankings = [...normalizedAttempts]
    .sort((a, b) => b.percentage - a.percentage || new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5)
    .map((attempt, index) => ({
      rank: index + 1,
      name: attempt.userName || attempt.studentName || attempt.userId || `Student ${index + 1}`,
      percentage: attempt.percentage,
      score: attempt.score,
      total: attempt.total,
    }))

  const conceptCounts = {}
  normalizedAttempts.forEach((attempt) => {
    attempt.answers.forEach((answer, index) => {
      const question = questionList[index] || {}
      const conceptTags = unique([
        ...(answer?.conceptTags || []),
        ...inferConceptTags(question),
      ])
      conceptTags.forEach((tag) => aggregateCounts(conceptCounts, tag, !!answer?.isCorrect))
    })
  })

  const weakConcepts = Object.entries(conceptCounts)
    .map(([concept, stats]) => ({
      concept,
      accuracy: stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0,
      attempts: stats.attempts,
    }))
    .filter((item) => item.attempts > 0)
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
    .slice(0, 5)

  const hardestQuestion = [...aggregateByQuestion]
    .filter((item) => item.attempts > 0)
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)[0] || null

  const easiestQuestion = [...aggregateByQuestion]
    .filter((item) => item.attempts > 0)
    .sort((a, b) => b.accuracy - a.accuracy || b.attempts - a.attempts)[0] || null

  return {
    totalQuestions: questionList.length,
    attemptCount: normalizedAttempts.length,
    averageScore,
    completionRate,
    questionAccuracy: aggregateByQuestion,
    hardestQuestion,
    easiestQuestion,
    rankings,
    weakConcepts,
    attempts: normalizedAttempts,
  }
}

export function buildStudentAnalyticsFromResult(result = {}) {
  return buildAttemptAnalytics(
    result.answers?.map((answer) => ({
      id: answer.questionId,
      text: answer.text,
      options: answer.options,
      correct: answer.correct,
      conceptTags: answer.conceptTags,
      difficulty: answer.difficulty,
      explanation: answer.explanation,
      learningTip: answer.learningTip,
      trivia: answer.trivia,
    })) || [],
    result.answers || [],
    {
      quizId: result.quizId,
      quizTitle: result.quizTitle,
      timestamp: result.timestamp,
    },
  )
}

