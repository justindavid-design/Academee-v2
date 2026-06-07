/**
 * AdaptiveFeedbackRenderer
 * Flexible component for rendering different feedback layouts and modes
 */

import React, { useMemo } from 'react'
import { QuizFeedbackPanel } from './QuizFeedbackPanel'
import { buildDetailedFeedback } from '../../lib/quizFeedbackUtils'

export const FeedbackLayout = {
  PANEL: 'panel',
  CARD: 'card',
  INLINE: 'inline',
  MINIMAL: 'minimal',
}

export const QuizMode = {
  PRACTICE: 'practice',
  STUDY: 'study',
  EXAM: 'exam',
  REVIEW: 'review',
}

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

  const shouldShow = useMemo(() => {
    switch (mode) {
      case QuizMode.PRACTICE:
      case QuizMode.STUDY:
        return showAutomatically || !!feedback
      case QuizMode.EXAM:
        return false
      case QuizMode.REVIEW:
        return !!feedback
      default:
        return showAutomatically
    }
  }, [mode, feedback, showAutomatically])

  if (!shouldShow || !feedback) {
    return null
  }

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

function CompactFeedbackCard({ feedback, onContinue }) {
  return (
    <div
      className={`rounded-lg border-2 p-4 ${
        feedback.isCorrect
          ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900'
          : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="mb-1 font-semibold">{feedback.status}</h3>
          <p className="mb-2 text-sm">{feedback.explanation}</p>
          {feedback.learningTip && (
            <p className="text-sm italic opacity-75">Tip: {feedback.learningTip}</p>
          )}
        </div>
        {onContinue && (
          <button
            onClick={onContinue}
            className="mt-1 flex-shrink-0 rounded bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}

function InlineFeedback({ feedback }) {
  return (
    <div
      className={`rounded px-3 py-2 text-sm ${
        feedback.isCorrect
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      }`}
    >
      <strong>{feedback.status}</strong> {feedback.explanation}
    </div>
  )
}

function MinimalFeedback({ feedback }) {
  return (
    <div className="mb-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 text-sm dark:bg-blue-900 dark:text-blue-100">
      <p>{feedback.explanation}</p>
    </div>
  )
}

export default AdaptiveFeedbackRenderer
