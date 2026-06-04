/**
 * AdaptiveFeedbackRenderer
 * Flexible component for rendering different feedback layouts and modes
 */

import React, { useMemo } from 'react'
import { QuizFeedbackPanel } from './QuizFeedbackPanel'
import { buildDetailedFeedback } from '../../lib/quizFeedbackUtils'

/**
 * Layout modes for feedback display
 */
export const FeedbackLayout = {
  PANEL: 'panel', // Full panel with all feedback types
  CARD: 'card', // Compact card format
  INLINE: 'inline', // Inline with question
  MINIMAL: 'minimal', // Just explanation
}

/**
 * Quiz modes affect what/when feedback is shown
 */
export const QuizMode = {
  PRACTICE: 'practice', // Show feedback immediately
  STUDY: 'study', // Expanded feedback with hints and explanations
  EXAM: 'exam', // Show feedback after quiz ends
  REVIEW: 'review', // Show all feedback for review
}

/**
 * Adaptive feedback renderer
 * Intelligently displays feedback based on question data and mode
 */
export function AdaptiveFeedbackRenderer({
  question,
  selectedAnswerIndex,
  layout = FeedbackLayout.PANEL,
  mode = QuizMode.PRACTICE,
  onContinue,
  showAutomatically = false,
  autoAdvanceDelay = null,
  feedbackOverride = null,
}) {
  const feedback = useMemo(
    () =>
      feedbackOverride ||
      (question && selectedAnswerIndex !== null
        ? buildDetailedFeedback(question, selectedAnswerIndex)
        : null),
    [feedbackOverride, question, selectedAnswerIndex]
  )

  // Should we show feedback based on mode?
  const shouldShow = useMemo(() => {
    switch (mode) {
      case QuizMode.PRACTICE:
      case QuizMode.STUDY:
        return showAutomatically || !!feedback
      case QuizMode.EXAM:
        return false // Hidden until quiz ends
      case QuizMode.REVIEW:
        return !!feedback
      default:
        return showAutomatically
    }
  }, [mode, feedback, showAutomatically])

  if (!shouldShow || !feedback) {
    return null
  }

  // Render based on layout
  switch (layout) {
    case FeedbackLayout.PANEL:
      return (
        <QuizFeedbackPanel
          question={question}
          selectedAnswerIndex={selectedAnswerIndex}
          onContinue={onContinue}
          isPracticeMode={mode === QuizMode.PRACTICE}
          autoAdvanceDelay={autoAdvanceDelay}
          feedbackOverride={feedback}
        />
      )

    case FeedbackLayout.CARD:
      return <CompactFeedbackCard feedback={feedback} onContinue={onContinue} />

    case FeedbackLayout.INLINE:
      return <InlineFeedback feedback={feedback} />

    case FeedbackLayout.MINIMAL:
      return <MinimalFeedback feedback={feedback} />

    default:
      return null
  }
}

/**
 * Compact card layout
 */
function CompactFeedbackCard({ feedback, onContinue }) {
  return (
    <div
      className={`rounded-lg border-2 p-4 ${
        feedback.isCorrect
          ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900'
          : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900'
      }`}
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1'>
          <h3 className='font-semibold mb-1'>{feedback.status}</h3>
          <p className='text-sm mb-2'>{feedback.explanation}</p>
          {feedback.learningTip && (
            <p className='text-sm italic opacity-75'>💡 {feedback.learningTip}</p>
          )}
        </div>
        {onContinue && (
          <button
            onClick={onContinue}
            className='mt-1 flex-shrink-0 rounded bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700'
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Inline feedback (minimal space)
 */
function InlineFeedback({ feedback }) {
  return (
    <div
      className={`rounded px-3 py-2 text-sm ${
        feedback.isCorrect
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      }`}
    >
      <strong>{feedback.statusIcon}</strong> {feedback.explanation}
    </div>
  )
}

/**
 * Minimal feedback (just explanation)
 */
function MinimalFeedback({ feedback }) {
  return (
    <div className='mb-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 text-sm dark:bg-blue-900 dark:text-blue-100'>
      <p>{feedback.explanation}</p>
    </div>
  )
}

export default AdaptiveFeedbackRenderer
