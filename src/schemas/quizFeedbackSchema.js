import { normalizeDifficultyLevel, normalizeQuizQuestion } from '../lib/adaptiveQuizEngine'

/**
 * Quiz Feedback Schema
 * Extended question schema with educational feedback fields
 * All fields are optional for backward compatibility
 */

export const quizFeedbackSchema = {
  // Standard question fields
  id: 'string (optional)',
  text: 'string (required)',
  options: 'string[] (required)',
  correct: 'number (required)',

  // NEW: Feedback fields (all optional)
  explanation: 'string - Why is this answer correct/incorrect',
  trivia: 'string - Fun fact related to the concept',
  learningTip: 'string - Helpful learning guidance',
  difficulty: 'string - "easy" | "medium" | "hard"',
  conceptTags: 'string[] - Related concepts for learning',

  // Future: AI feedback
  feedbackSource: 'string - "manual" | "generated" | "ai"',
  aiConfidence: 'number - 0-1 confidence score for AI feedback',
}

/**
 * Validate and normalize question with feedback fields
 * Ensures backward compatibility
 */
export function normalizeQuestionWithFeedback(question, index = 0) {
  if (!question) return null

  const normalized = normalizeQuizQuestion(question, index)
  if (!normalized) return null

  return {
    ...normalized,
    difficulty: normalized.difficulty || normalizeDifficultyLevel(question.difficulty),
    explanation: String(normalized.explanation || question.explanation || '').trim() || null,
    trivia: String(normalized.trivia || question.trivia || '').trim() || null,
    learningTip: String(normalized.learningTip || question.learningTip || '').trim() || null,
    feedbackSource: question.feedbackSource || 'manual',
    aiConfidence: question.aiConfidence || null,
  }
}

/**
 * Check if question has custom feedback
 */
export function hasCustomFeedback(question) {
  if (!question) return false
  return Boolean(
    question.explanation ||
      question.trivia ||
      question.learningTip ||
      (Array.isArray(question.conceptTags) && question.conceptTags.length > 0)
  )
}

/**
 * Extract feedback for a specific answer
 */
export function extractFeedback(question, selectedAnswerIndex) {
  if (!question) return null

  const isCorrect = selectedAnswerIndex === question.correct
  const selectedOption = question.options?.[selectedAnswerIndex]
  const correctOption = question.options?.[question.correct]
  const answerAnalysis = isCorrect
    ? `You selected ${selectedOption || 'the correct answer'}. That matches the expected response.`
    : `You selected ${selectedOption || 'an answer'}, but the correct answer is ${correctOption || 'the expected response'}.`

  return {
    isCorrect,
    selectedOption,
    correctOption,
    answerAnalysis,
    explanation: question.explanation || null,
    trivia: question.trivia || null,
    learningTip: question.learningTip || null,
    difficulty: normalizeDifficultyLevel(question.difficulty),
    conceptTags: question.conceptTags || [],
    feedbackSource: question.feedbackSource || 'manual',
  }
}

/**
 * Check if feedback is complete (all fields present)
 */
export function isFeedbackComplete(question) {
  if (!question) return false
  return Boolean(
    question.explanation &&
      question.trivia &&
      question.learningTip &&
      Array.isArray(question.conceptTags) &&
      question.conceptTags.length > 0
  )
}

/**
 * Get feedback completion percentage
 */
export function getFeedbackCompleteness(question) {
  if (!question) return 0

  let completed = 0
  const total = 5 // explanation, trivia, learningTip, conceptTags, difficulty

  if (question.explanation) completed++
  if (question.trivia) completed++
  if (question.learningTip) completed++
  if (Array.isArray(question.conceptTags) && question.conceptTags.length > 0) completed++
  if (question.difficulty) completed++

  return Math.round((completed / total) * 100)
}
