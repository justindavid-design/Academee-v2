/**
 * QuizFeedbackPanel
 * Main feedback container shown after answering a question
 * Displays explanation, trivia, and learning tips
 */

import React, { useEffect, useRef } from 'react'
import { QuizExplanationCard } from './QuizExplanationCard'
import { QuizTriviaCard } from './QuizTriviaCard'
import { buildDetailedFeedback } from '../../lib/quizFeedbackUtils'

export function QuizFeedbackPanel({
  question,
  selectedAnswerIndex,
  onContinue,
  isPracticeMode = true,
  autoAdvanceDelay = null, // Auto-advance after N milliseconds (for quiz modes)
  feedbackOverride = null,
}) {
  const panelRef = useRef(null)
  const continueButtonRef = useRef(null)

  const feedback = question
    ? feedbackOverride || buildDetailedFeedback(question, selectedAnswerIndex)
    : null

  // Focus management
  useEffect(() => {
    if (panelRef.current) {
      // Announce to screen readers
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = `${feedback?.status} ${feedback?.explanation}`
      panelRef.current.appendChild(announcement)

      // Focus for keyboard navigation
      continueButtonRef.current?.focus()
    }
  }, [feedback])

  // Auto-advance if configured
  useEffect(() => {
    if (!autoAdvanceDelay || !onContinue) return

    const timer = setTimeout(() => {
      onContinue()
    }, autoAdvanceDelay)

    return () => clearTimeout(timer)
  }, [autoAdvanceDelay, onContinue])

  if (!feedback) {
    return null
  }

  return (
    <div
      ref={panelRef}
      className='animated-fade-in w-full max-w-3xl mx-auto px-4 py-6'
      role='region'
      aria-label='Quiz feedback panel'
    >
      {/* Header with score indicator */}
      <div className='mb-6'>
        <div
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold ${
            feedback.isCorrect
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
          }`}
        >
          <span className='text-xl'>{feedback.statusIcon}</span>
          <span>{feedback.status}</span>
        </div>
      </div>

      {/* Explanation Card */}
      <QuizExplanationCard
        isCorrect={feedback.isCorrect}
        explanation={feedback.explanation}
        selectedOption={feedback.selectedOption}
        correctOption={feedback.correctOption}
        answerAnalysis={feedback.answerAnalysis}
      />

      {/* Trivia and Tips */}
      <QuizTriviaCard
        trivia={feedback.trivia}
        learningTip={feedback.learningTip}
        conceptTags={feedback.conceptTags}
      />

      {/* Action Buttons */}
      <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between'>
        {/* Info text - optional */}
        {isPracticeMode && (
          <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
            <span className='text-lg mr-2'>📚</span>
            <span>Take time to review these concepts.</span>
          </div>
        )}

        {/* Continue button */}
        <button
          ref={continueButtonRef}
          onClick={onContinue}
          className='ml-auto inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
          aria-label='Continue to next question'
        >
          Continue
          <span className='text-lg'>→</span>
        </button>
      </div>

      {/* Keyboard hint for accessibility */}
      <div className='mt-4 text-center text-xs text-gray-500 dark:text-gray-400'>
        Press <kbd className='rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 dark:border-gray-600 dark:bg-gray-800'>Enter</kbd> or click Continue
      </div>
    </div>
  )
}

export default QuizFeedbackPanel
