/**
 * Quiz Feedback Utilities
 * Extended utilities for generating and formatting feedback
 */

import { extractFeedback, normalizeQuestionWithFeedback } from '../schemas/quizFeedbackSchema'

/**
 * Build detailed feedback from question
 * Combines manual feedback with generated fallbacks
 */
export function buildDetailedFeedback(question, selectedAnswerIndex) {
  const normalized = normalizeQuestionWithFeedback(question)
  if (!normalized) return null

  const feedback = extractFeedback(normalized, selectedAnswerIndex)
  const isCorrect = feedback.isCorrect

  return {
    isCorrect,
    status: isCorrect ? 'Correct!' : 'Incorrect',
    statusIcon: isCorrect ? '✓' : '✗',
    statusColor: isCorrect ? 'success' : 'error',

    // Explanation (required)
    explanation:
      feedback.explanation ||
      generateDefaultExplanation(normalized, selectedAnswerIndex, isCorrect),

    // Trivia (optional)
    trivia: feedback.trivia || null,

    // Learning tip (optional, but recommended)
    learningTip:
      feedback.learningTip ||
      generateDefaultLearningTip(normalized, isCorrect),

    // Chosen answer analysis
    answerAnalysis:
      feedback.answerAnalysis ||
      generateAnswerAnalysis(normalized, selectedAnswerIndex, isCorrect),

    // Additional context
    conceptTags: feedback.conceptTags,
    difficulty: feedback.difficulty,
    feedbackSource: feedback.feedbackSource,

    // Raw data for advanced renderers
    selectedOption: feedback.selectedOption,
    correctOption: feedback.correctOption,
  }
}

/**
 * Generate default explanation if not provided
 */
function generateDefaultExplanation(question, selectedAnswerIndex, isCorrect) {
  const correctOption = question.options[question.correct]

  if (isCorrect) {
    return `You selected "${question.options[selectedAnswerIndex]}", which is correct. The correct answer is: ${correctOption}.`
  } else {
    return `You selected "${question.options[selectedAnswerIndex]}", but the correct answer is: ${correctOption}.`
  }
}

/**
 * Generate default learning tip if not provided
 */
function generateDefaultLearningTip(question, isCorrect) {
  if (isCorrect) {
    return 'Great job! You understood this concept. Try to remember this for similar questions.'
  } else {
    return 'Take time to review this concept. Understanding the key differences will help you improve.'
  }
}

function generateAnswerAnalysis(question, selectedAnswerIndex, isCorrect) {
  const selected = question.options?.[selectedAnswerIndex] || 'your answer'
  const correct = question.options?.[question.correct] || 'the correct answer'

  if (isCorrect) {
    return `You selected "${selected}", which is the correct answer.`
  }

  return `You selected "${selected}", but the correct answer is "${correct}". Compare the wording with the concept in the explanation to see why this choice is the better fit.`
}

/**
 * Check if question has feedback ready to display
 */
export function isFeedbackReady(question) {
  if (!question || !question.text) return false
  // Has at least explanation or we can generate one
  return true
}

/**
 * Create feedback summary for quiz results
 */
export function createFeedbackSummary(questions, answers) {
  const summary = {
    totalQuestions: questions.length,
    correct: 0,
    incorrect: 0,
    feedbackAvailable: 0,
    feedbackMissing: 0,
    conceptsMastered: new Set(),
    conceptsToReview: new Set(),
    difficultyBreakdown: {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 },
    },
  }

  questions.forEach((question, index) => {
    const selectedIndex = answers[index]
    const isCorrect = selectedIndex === question.correct

    // Track correctness
    if (isCorrect) summary.correct++
    else summary.incorrect++

    // Track feedback availability
    if (question.explanation || question.trivia || question.learningTip) {
      summary.feedbackAvailable++
    } else {
      summary.feedbackMissing++
    }

    // Track concepts
    if (Array.isArray(question.conceptTags)) {
      if (isCorrect) {
        question.conceptTags.forEach((tag) => summary.conceptsMastered.add(tag))
      } else {
        question.conceptTags.forEach((tag) => summary.conceptsToReview.add(tag))
      }
    }

    // Track difficulty
    const difficulty = question.difficulty || 'medium'
    summary.difficultyBreakdown[difficulty].total++
    if (isCorrect) {
      summary.difficultyBreakdown[difficulty].correct++
    }
  })

  // Convert sets to arrays
  return {
    ...summary,
    conceptsMastered: Array.from(summary.conceptsMastered),
    conceptsToReview: Array.from(summary.conceptsToReview),
  }
}

/**
 * Get recommended learning resources based on missed concepts
 */
export function getRecommendedResources(conceptsToReview) {
  if (!Array.isArray(conceptsToReview) || conceptsToReview.length === 0) {
    return []
  }

  // Map concepts to resource suggestions
  const resourceMap = {
    'data-security': ['Encrypt data at rest and in transit', 'Use industry-standard encryption algorithms'],
    https: ['Enable HTTPS on your server', 'Obtain SSL/TLS certificates'],
    encryption: ['Learn about symmetric and asymmetric encryption', 'Understand key management'],
    'network-security': ['Implement firewalls', 'Use VPNs for sensitive traffic'],
    'password-security': ['Enforce strong password policies', 'Use password hashing with salts'],
  }

  const resources = []
  conceptsToReview.forEach((concept) => {
    const tips = resourceMap[concept.toLowerCase()] || [
      `Review the ${concept} concept in your course materials`,
    ]
    resources.push({
      concept,
      tips,
    })
  })

  return resources
}

/**
 * Format feedback for display
 */
export function formatFeedbackText(feedback) {
  if (!feedback) return ''

  const parts = []

  if (feedback.status) {
    parts.push(`**${feedback.status}**`)
  }

  if (feedback.explanation) {
    parts.push(feedback.explanation)
  }

  if (feedback.learningTip) {
    parts.push(`💡 ${feedback.learningTip}`)
  }

  if (feedback.trivia) {
    parts.push(`🎓 ${feedback.trivia}`)
  }

  return parts.join('\n\n')
}

/**
 * Calculate feedback metrics for quiz analytics
 */
export function calculateFeedbackMetrics(quizResults) {
  if (!quizResults || !Array.isArray(quizResults.questions)) {
    return null
  }

  const metrics = {
    totalFeedbackShown: 0,
    averageFeedbackQuality: 0,
    feedbackEngagementRate: 0,
    commonMisunderstandings: {},
    learningPathRecommendations: [],
  }

  let totalQuality = 0
  const misunderstandings = {}

  quizResults.questions.forEach((question, index) => {
    const answered = quizResults.answers[index] !== undefined
    if (!answered) return

    const isCorrect = quizResults.answers[index] === question.correct

    // Count feedback shown
    if (!isCorrect) {
      metrics.totalFeedbackShown++

      // Track misunderstandings
      const correctAnswer = question.options[question.correct]
      const key = correctAnswer
      misunderstandings[key] = (misunderstandings[key] || 0) + 1

      // Calculate quality (based on feedback completeness)
      if (question.explanation && question.learningTip) {
        totalQuality += 100
      } else if (question.explanation || question.learningTip) {
        totalQuality += 50
      } else {
        totalQuality += 25
      }
    }
  })

  if (metrics.totalFeedbackShown > 0) {
    metrics.averageFeedbackQuality = Math.round(
      totalQuality / metrics.totalFeedbackShown
    )
  }

  metrics.feedbackEngagementRate = Math.round(
    (metrics.totalFeedbackShown / quizResults.questions.length) * 100
  )

  metrics.commonMisunderstandings = Object.entries(misunderstandings)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .reduce((acc, [key, count]) => {
      acc[key] = count
      return acc
    }, {})

  return metrics
}
