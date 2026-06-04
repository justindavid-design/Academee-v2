/**
 * Feedback Service
 * Manages feedback generation, caching, and AI integration
 * Designed for future AI-powered feedback generation
 */

import { apiFetch } from './apiClient'
import { buildDetailedFeedback } from '../lib/quizFeedbackUtils'
import { buildAdaptiveFeedback } from '../lib/adaptiveQuizEngine'

/**
 * Feedback providers - extensible for future AI integration
 */
export const FeedbackProvider = {
  MANUAL: 'manual', // Question creator provided
  GENERATED: 'generated', // Automatically generated from question
  AI: 'ai', // AI-generated (future)
}

/**
 * Cache for generated feedback to avoid regeneration
 */
const feedbackCache = new Map()

/**
 * Generate cache key
 */
function getCacheKey(questionId, answerIndex) {
  return `${questionId}:${answerIndex}`
}

/**
 * Get or generate feedback for a question
 * Checks cache first, falls back to generation
 */
export async function getFeedback(question, selectedAnswerIndex) {
  if (!question || selectedAnswerIndex === null) return null

  const cacheKey = getCacheKey(question.id, selectedAnswerIndex)

  // Check cache
  if (feedbackCache.has(cacheKey)) {
    return feedbackCache.get(cacheKey)
  }

  // Generate feedback
  const feedback = buildDetailedFeedback(question, selectedAnswerIndex)

  // Cache result
  if (feedback) {
    feedbackCache.set(cacheKey, feedback)
  }

  return feedback
}

/**
 * Generate AI feedback for a question (FUTURE)
 * This is a placeholder for future AI integration
 */
export async function generateAIFeedback(question, selectedAnswerIndex) {
  if (!question || selectedAnswerIndex === null) return null

  const choices = Array.isArray(question.choices)
    ? question.choices
    : Array.isArray(question.options)
      ? question.options
      : []

  const choiceText = (choice) => (choice && typeof choice === 'object' ? choice.text : choice)
  const selectedAnswerText = choiceText(choices?.[selectedAnswerIndex]) || ''
  const correctAnswerText = choiceText(choices?.[question.correct]) || question.correctAnswer || ''

  try {
    const response = await apiFetch('/api/ai/quiz-feedback', {
      method: 'POST',
      body: JSON.stringify({
        question: question.question || question.text || question.prompt || '',
        correctAnswer: correctAnswerText,
        studentAnswer: selectedAnswerText,
        selectedAnswerIndex,
        conceptTags: question.conceptTags || question.tags || [],
        lessonContent: question.lessonContent || question.lessonText || question.context || question.explanation || '',
        difficulty: question.difficulty || 'Medium',
        isCorrect: Number(selectedAnswerIndex) === Number(question.correct),
        mode: question.mode || question.quizMode || 'practice',
      }),
    })

    const data = await response.json()
    const aiFeedback = data?.feedback || data

    if (!aiFeedback) {
      throw new Error('Empty AI feedback response')
    }

    return {
      ...buildAdaptiveFeedback(question, selectedAnswerIndex, {
        source: 'ai',
      }),
      ...aiFeedback,
      feedbackSource: 'ai',
      aiConfidence: Number.isFinite(Number(aiFeedback.aiConfidence)) ? Number(aiFeedback.aiConfidence) : 0.8,
    }
  } catch (error) {
    console.warn('AI feedback request failed, using adaptive fallback:', error.message)
    return buildAdaptiveFeedback(question, selectedAnswerIndex, {
      source: 'generated',
    })
  }
}

/**
 * Batch generate feedback for multiple questions
 */
export async function generateBatchFeedback(questions, answers) {
  if (!Array.isArray(questions)) return []

  const feedbackList = await Promise.all(
    questions.map(async (question, index) => {
      const answerIndex = answers[index]
      if (answerIndex === null || answerIndex === undefined) return null

      return getFeedback(question, answerIndex)
    })
  )

  return feedbackList
}

/**
 * Clear feedback cache
 */
export function clearFeedbackCache() {
  feedbackCache.clear()
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: feedbackCache.size,
    entries: Array.from(feedbackCache.keys()),
  }
}

/**
 * Determine best feedback provider for a question
 */
export function determineFeedbackProvider(question) {
  if (question.feedbackSource === FeedbackProvider.AI) {
    return FeedbackProvider.AI
  }

  if (question.feedbackSource === FeedbackProvider.GENERATED) {
    return FeedbackProvider.GENERATED
  }

  // Check if has manual feedback
  if (question.explanation || question.trivia || question.learningTip) {
    return FeedbackProvider.MANUAL
  }

  // Default to generated
  return FeedbackProvider.GENERATED
}

/**
 * Validate feedback quality
 * Returns quality score 0-100
 */
export function validateFeedbackQuality(feedback) {
  if (!feedback) return 0

  let score = 0

  // Explanation: 40 points
  if (feedback.explanation && feedback.explanation.length > 20) {
    score += 40
  } else if (feedback.explanation) {
    score += 20
  }

  // Learning tip: 20 points
  if (feedback.learningTip && feedback.learningTip.length > 15) {
    score += 20
  }

  // Trivia: 15 points
  if (feedback.trivia && feedback.trivia.length > 15) {
    score += 15
  }

  // Concept tags: 15 points
  if (Array.isArray(feedback.conceptTags) && feedback.conceptTags.length > 0) {
    score += 15
  }

  // Difficulty info: 10 points
  if (feedback.difficulty && feedback.difficulty !== 'medium') {
    score += 10
  }

  return Math.min(score, 100)
}

/**
 * Generate feedback report for quiz
 */
export function generateFeedbackReport(questions, answers) {
  const report = {
    totalQuestions: questions.length,
    questionsWithFeedback: 0,
    averageQuality: 0,
    feedbackBreakdown: {
      manual: 0,
      generated: 0,
      ai: 0,
    },
    providerDistribution: [],
  }

  let totalQuality = 0

  questions.forEach((question, index) => {
    const feedback = buildDetailedFeedback(question, answers[index])
    if (!feedback) return

    report.questionsWithFeedback++

    // Track provider
    const provider = determineFeedbackProvider(question)
    report.feedbackBreakdown[provider]++

    // Track quality
    const quality = validateFeedbackQuality(feedback)
    totalQuality += quality
  })

  // Calculate averages
  if (report.questionsWithFeedback > 0) {
    report.averageQuality = Math.round(totalQuality / report.questionsWithFeedback)
  }

  // Provider distribution
  report.providerDistribution = Object.entries(report.feedbackBreakdown)
    .filter(([, count]) => count > 0)
    .map(([provider, count]) => ({
      provider,
      count,
      percentage: Math.round((count / report.totalQuestions) * 100),
    }))

  return report
}

/**
 * Export feedback as JSON for archiving
 */
export function exportFeedbackAsJSON(questions, answers) {
  const feedbackData = {
    timestamp: new Date().toISOString(),
    questions: questions.map((question, index) => ({
      questionId: question.id,
      text: question.text,
      selectedAnswer: answers[index],
      feedback: buildDetailedFeedback(question, answers[index]),
    })),
  }

  return JSON.stringify(feedbackData, null, 2)
}

export default {
  getFeedback,
  generateAIFeedback,
  generateBatchFeedback,
  clearFeedbackCache,
  getCacheStats,
  determineFeedbackProvider,
  validateFeedbackQuality,
  generateFeedbackReport,
  exportFeedbackAsJSON,
}
