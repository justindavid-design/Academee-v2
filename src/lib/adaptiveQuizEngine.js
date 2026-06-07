const DIFFICULTY_ORDER = ['easy', 'medium', 'hard']

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'what', 'when', 'where', 'which',
  'into', 'your', 'their', 'there', 'have', 'will', 'would', 'could', 'should', 'about',
  'after', 'before', 'using', 'use', 'used', 'quiz', 'question', 'answer', 'correct',
  'incorrect', 'true', 'false', 'option', 'options', 'student', 'teacher', 'learn',
  'learning', 'review', 'module', 'assignment', 'announcement', 'content', 'lesson', 'topic',
  'item', 'items', 'best', 'choose', 'select', 'describe', 'identify', 'explain',
])

function clamp(value, min = 0, max = 100) {
  const number = Number(value)
  if (!Number.isFinite(number)) return min
  return Math.max(min, Math.min(max, number))
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function toTitleCase(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function normalizeDifficultyLevel(value) {
  const raw = normalizeText(value).toLowerCase()
  if (raw === 'easy' || raw === 'beginner') return 'easy'
  if (raw === 'hard' || raw === 'advanced') return 'hard'
  return 'medium'
}

export function formatDifficultyLevel(value) {
  const normalized = normalizeDifficultyLevel(value)
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function normalizeConceptTag(tag) {
  return normalizeText(tag)
}

function unique(values = []) {
  return Array.from(new Set(values.map(normalizeText).filter(Boolean)))
}

function extractConceptTagsFromText(questionText) {
  const words = normalizeText(questionText)
    .toLowerCase()
    .match(/[a-z][a-z0-9-]{3,}/g) || []

  return unique(
    words
      .filter((word) => !STOP_WORDS.has(word))
      .slice(0, 6)
  )
}

function normalizeChoices(question) {
  const rawChoices = Array.isArray(question?.choices)
    ? question.choices
    : Array.isArray(question?.options)
      ? question.options
      : []

  return rawChoices
    .map((choice) => {
      if (choice && typeof choice === 'object') {
        return normalizeText(choice.text ?? choice.label ?? choice.value ?? choice.choice ?? '')
      }

      return normalizeText(choice)
    })
    .filter(Boolean)
}

function inferCorrectIndex(question, choices) {
  if (Number.isInteger(question?.correct)) {
    return question.correct
  }

  if (Number.isInteger(question?.correctIndex)) {
    return question.correctIndex
  }

  if (Array.isArray(question?.choices)) {
    const objectCorrectIndex = question.choices.findIndex((choice) => Boolean(choice && typeof choice === 'object' && choice.is_correct))
    if (objectCorrectIndex >= 0) return objectCorrectIndex
  }

  const correctAnswer = normalizeText(question?.correctAnswer || question?.answer || question?.correctOption)
  if (!correctAnswer) return 0

  const matchIndex = choices.findIndex((choice) => normalizeText(choice).toLowerCase() === correctAnswer.toLowerCase())
  return matchIndex >= 0 ? matchIndex : 0
}

function getQuestionText(question) {
  return normalizeText(question?.question || question?.text || question?.prompt || question?.title)
}

export function normalizeQuizQuestion(question, index = 0) {
  if (!question) return null

  const text = getQuestionText(question)
  const choices = normalizeChoices(question)
  const correct = inferCorrectIndex(question, choices)
  const correctAnswer = normalizeText(
    question?.correctAnswer ||
      question?.answer ||
      question?.correctOption ||
      choices[correct] ||
      choices[0] ||
      ''
  )
  const conceptTags = unique([
    ...(Array.isArray(question?.conceptTags) ? question.conceptTags.map(normalizeConceptTag) : []),
    ...(Array.isArray(question?.tags) ? question.tags.map(normalizeConceptTag) : []),
  ])
  const normalizedConceptTags = conceptTags.length ? conceptTags : extractConceptTagsFromText(text || correctAnswer)

  return {
    ...question,
    id: question.id || `question-${index + 1}`,
    question: text,
    text,
    prompt: text,
    title: question.title || text,
    choices,
    options: choices,
    correct,
    correctIndex: correct,
    correctAnswer,
    difficulty: formatDifficultyLevel(question.difficulty),
    conceptTags: normalizedConceptTags,
    explanation: normalizeText(question.explanation) || '',
    trivia: normalizeText(question.trivia) || '',
    learningTip: normalizeText(question.learningTip) || '',
  }
}

export function normalizeQuizQuestions(questions = []) {
  return Array.isArray(questions)
    ? questions
        .map((question, index) => normalizeQuizQuestion(question, index))
        .filter((question) => question && question.question)
    : []
}

function getPrimaryConcept(question) {
  return normalizeText(question?.conceptTags?.[0] || extractConceptTagsFromText(getQuestionText(question))[0] || 'general')
}

function getDifficultyIndex(difficulty) {
  return Math.max(0, DIFFICULTY_ORDER.indexOf(normalizeDifficultyLevel(difficulty)))
}

function targetDifficultyFromOutcome(question, outcome, masteryByConcept) {
  const currentDifficulty = normalizeDifficultyLevel(question?.difficulty)
  const currentConcept = getPrimaryConcept(question)
  const currentMastery = Number(masteryByConcept?.[currentConcept]?.score ?? masteryByConcept?.[currentConcept] ?? 50)
  const wasCorrect = Boolean(outcome?.isCorrect)
  const speedRatio = Number.isFinite(outcome?.responseTimeSeconds) && Number.isFinite(question?.timer)
    ? outcome.responseTimeSeconds / Math.max(10, Number(question.timer))
    : null

  if (!wasCorrect) {
    if (currentDifficulty === 'hard') return 'medium'
    return 'easy'
  }

  if (currentMastery >= 80 && (speedRatio === null || speedRatio < 0.7)) {
    return 'hard'
  }

  if (currentDifficulty === 'easy') return 'medium'
  if (currentDifficulty === 'medium' && currentMastery >= 65) return 'hard'
  return currentDifficulty
}

function scoreCandidate(question, context) {
  const {
    targetDifficulty,
    masteryByConcept,
    weakConcepts,
    currentQuestion,
    currentOutcome,
    repeatedMissConcepts,
  } = context

  const difficultyIndex = getDifficultyIndex(question?.difficulty)
  const targetDifficultyIndex = getDifficultyIndex(targetDifficulty)
  let score = 0

  score -= Math.abs(difficultyIndex - targetDifficultyIndex) * 12

  const concepts = Array.isArray(question?.conceptTags) && question.conceptTags.length
    ? question.conceptTags
    : [getPrimaryConcept(question)]

  concepts.forEach((concept) => {
    const mastery = Number(masteryByConcept?.[concept]?.score ?? masteryByConcept?.[concept] ?? 50)
    if (mastery < 40) score += 18
    else if (mastery < 60) score += 12
    else if (mastery < 75) score += 4
    else score -= 2

    if (weakConcepts.includes(concept)) score += 16
    if (repeatedMissConcepts.includes(concept)) score += 22
  })

  if (currentOutcome?.isCorrect) {
    const currentDifficultyIndex = getDifficultyIndex(currentQuestion?.difficulty)
    if (difficultyIndex > currentDifficultyIndex) score += 10
    if (difficultyIndex === currentDifficultyIndex) score += 4
  } else {
    const currentDifficultyIndex = getDifficultyIndex(currentQuestion?.difficulty)
    if (difficultyIndex <= currentDifficultyIndex) score += 14
  }

  if (question?.id === currentQuestion?.id) score -= 100
  return score
}

function getWeakConcepts(masteryByConcept = {}) {
  return Object.entries(masteryByConcept)
    .map(([concept, value]) => ({
      concept,
      mastery: Number(value?.score ?? value ?? 50),
    }))
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3)
    .map((item) => item.concept)
}

function getRepeatedMissConcepts(questionHistory = [], questionAnalytics = []) {
  const missesByConcept = new Map()

  questionAnalytics.forEach((entry) => {
    if (!entry || entry.correct) return
    const concept = normalizeText(entry.concept || entry.conceptTags?.[0] || '')
    if (!concept) return
    missesByConcept.set(concept, (missesByConcept.get(concept) || 0) + 1)
  })

  return Array.from(missesByConcept.entries())
    .filter(([, count]) => count >= 2)
    .map(([concept]) => concept)
}

export function createEmptyMasteryProfile(questions = []) {
  const mastery = {}
  normalizeQuizQuestions(questions).forEach((question) => {
    const concepts = question.conceptTags.length ? question.conceptTags : [getPrimaryConcept(question)]
    concepts.forEach((concept) => {
      if (!(concept in mastery)) {
        mastery[concept] = { score: 50, attempts: 0, correct: 0, recent: [] }
      }
    })
  })
  return mastery
}

export function updateMasteryProfile({
  masteryByConcept = {},
  question,
  isCorrect,
  responseTimeSeconds = null,
  questionAnalytics = [],
}) {
  const next = { ...masteryByConcept }
  const concepts = question?.conceptTags?.length ? question.conceptTags : [getPrimaryConcept(question)]
  const normalizedDifficulty = normalizeDifficultyLevel(question?.difficulty)
  const difficultyWeight = normalizedDifficulty === 'easy' ? 0.75 : normalizedDifficulty === 'hard' ? 1.25 : 1
  const speedRatio = Number.isFinite(responseTimeSeconds) && Number.isFinite(question?.timer)
    ? responseTimeSeconds / Math.max(10, Number(question.timer))
    : null

  concepts.forEach((concept) => {
    const current = next[concept] || { score: 50, attempts: 0, correct: 0, recent: [] }
    const recentSignals = questionAnalytics
      .filter((entry) => normalizeText(entry.concept) === normalizeText(concept))
      .slice(-3)
      .map((entry) => (entry.correct ? 1 : -1))
    const confidenceTrend = recentSignals.length
      ? recentSignals.reduce((sum, value) => sum + value, 0) / recentSignals.length
      : 0

    const responseSpeedBonus = !Number.isFinite(speedRatio)
      ? 0
      : isCorrect
        ? speedRatio < 0.6
          ? 6
          : speedRatio < 1
            ? 4
            : 1
        : speedRatio < 0.6
          ? -5
          : -2

    const difficultyBonus = normalizedDifficulty === 'hard' ? 6 : normalizedDifficulty === 'medium' ? 4 : 2
    const correctnessDelta = isCorrect
      ? Math.round((8 + difficultyBonus + responseSpeedBonus + confidenceTrend * 2) * difficultyWeight)
      : -Math.round((10 + difficultyBonus + Math.abs(responseSpeedBonus) + Math.max(0, -confidenceTrend * 2)) * difficultyWeight)

    current.attempts += 1
    current.correct += isCorrect ? 1 : 0
    current.score = clamp(current.score + correctnessDelta, 0, 100)
    current.recent = [...current.recent, isCorrect ? 1 : 0].slice(-5)
    next[concept] = current
  })

  return next
}

export function buildAdaptiveFeedback(question, selectedAnswerIndex, context = {}) {
  const normalized = normalizeQuizQuestion(question)
  if (!normalized) return null

  const selectedIndex = Number(selectedAnswerIndex)
  const selectedOption = normalized.options?.[selectedIndex] || ''
  const correctOption = normalized.options?.[normalized.correct] || normalized.correctAnswer || ''
  const isCorrect = Number.isFinite(selectedIndex) && selectedIndex === Number(normalized.correct)
  const concept = getPrimaryConcept(normalized)
  const mastery = Number(context.masteryByConcept?.[concept]?.score ?? context.masteryByConcept?.[concept] ?? 50)

  const explanation = normalized.explanation || (isCorrect
    ? `You selected ${selectedOption || 'the correct option'}, which matches the lesson concept.`
    : `You selected ${selectedOption || 'an answer'}, but the best answer is ${correctOption || 'the lesson concept'}.`)

  const learningTip = normalized.learningTip || (isCorrect
    ? `Keep using this concept in practice so it stays strong.`
    : mastery < 60
      ? `Revisit the basic idea for ${concept} before trying a harder item.`
      : `Review the cue words in the question and compare the options one by one.`)

  const trivia = normalized.trivia || `Adaptive quizzes use confidence and mastery signals to choose the next best question.`

  const answerAnalysis = isCorrect
    ? `You selected ${selectedOption || 'the correct answer'}. That matches the expected answer and suggests you are building confidence in ${concept}.`
    : `You selected ${selectedOption || 'an answer'}. The correct answer is ${correctOption || 'the expected answer'}, so the concept still needs reinforcement.`

  return {
    isCorrect,
    status: isCorrect ? 'Correct!' : 'Incorrect',
    statusIcon: isCorrect ? '✓' : '✕',
    explanation,
    trivia,
    learningTip,
    answerAnalysis,
    conceptTags: normalized.conceptTags,
    difficulty: normalized.difficulty,
    feedbackSource: context.source || normalized.feedbackSource || 'generated',
    aiConfidence: context.aiConfidence ?? null,
    selectedOption,
    correctOption,
  }
}

export function selectAdaptiveNextQuestion({
  questions = [],
  currentIndex = 0,
  masteryByConcept = {},
  questionAnalytics = [],
  answeredIndices = [],
  currentOutcome = null,
}) {
  const normalizedQuestions = normalizeQuizQuestions(questions)
  const answeredSet = new Set(
    (answeredIndices || [])
      .map((index) => Number(index))
      .filter((index) => Number.isInteger(index) && index >= 0)
  )
  const remaining = normalizedQuestions
    .map((question, index) => ({ question, index }))
    .filter(({ index }) => !answeredSet.has(index) && index !== currentIndex)

  if (!remaining.length) {
    return null
  }

  const currentQuestion = normalizedQuestions[currentIndex] || normalizedQuestions[0] || null
  const targetDifficulty = targetDifficultyFromOutcome(currentQuestion, currentOutcome, masteryByConcept)
  const weakConcepts = getWeakConcepts(masteryByConcept)
  const repeatedMissConcepts = getRepeatedMissConcepts([], questionAnalytics)

  const scored = remaining.map(({ question, index }) => ({
    index,
    score: scoreCandidate(question, {
      targetDifficulty,
      masteryByConcept,
      weakConcepts,
      currentQuestion,
      currentOutcome,
      repeatedMissConcepts,
    }),
  }))

  scored.sort((a, b) => b.score - a.score || Math.abs(getDifficultyIndex(normalizedQuestions[a.index]?.difficulty) - getDifficultyIndex(targetDifficulty)) - Math.abs(getDifficultyIndex(normalizedQuestions[b.index]?.difficulty) - getDifficultyIndex(targetDifficulty)) || a.index - b.index)
  const selectedIndex = scored[0]?.index ?? remaining[0].index
  return selectedIndex === currentIndex ? remaining.find((item) => item.index !== currentIndex)?.index ?? null : selectedIndex
}

export function buildAdaptiveInsights({ masteryByConcept = {}, questionAnalytics = [] } = {}) {
  const concepts = Object.entries(masteryByConcept)
    .map(([concept, value]) => ({
      concept,
      mastery: Number(value?.score ?? value ?? 50),
      attempts: Number(value?.attempts ?? 0),
      correct: Number(value?.correct ?? 0),
    }))
    .sort((a, b) => b.mastery - a.mastery || b.attempts - a.attempts)

  const strengths = concepts
    .filter((item) => item.attempts > 0 && item.mastery >= 75)
    .slice(0, 4)
    .map((item) => ({
      concept: toTitleCase(item.concept),
      mastery: item.mastery,
      note: `Strong understanding of ${item.concept}.`,
    }))

  const weakAreas = concepts
    .filter((item) => item.attempts > 0 && item.mastery < 60)
    .slice(0, 4)
    .map((item) => ({
      concept: toTitleCase(item.concept),
      mastery: item.mastery,
      note: `Needs reinforcement in ${item.concept}.`,
    }))

  const recommendations = weakAreas.length
    ? weakAreas.map((item) => `Review ${item.concept}`)
    : concepts.slice(0, 3).map((item) => `Keep practicing ${toTitleCase(item.concept)}`)

  const repeatedMissConcepts = getRepeatedMissConcepts([], questionAnalytics)

  if (repeatedMissConcepts.length) {
    repeatedMissConcepts.forEach((concept) => {
      if (!recommendations.some((item) => item.toLowerCase().includes(concept.toLowerCase()))) {
        recommendations.unshift(`Reinforce ${toTitleCase(concept)}`)
      }
    })
  }

  return {
    strengths,
    weakAreas,
    recommendations: recommendations.slice(0, 5),
    masteryByConcept: concepts,
  }
}
