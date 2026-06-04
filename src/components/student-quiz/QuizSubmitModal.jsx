import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Send } from 'lucide-react'

/**
 * QuizSubmitModal - Confirmation dialog before submitting quiz
 * Shows unanswered questions warning
 * Prevents accidental submission
 */
export function QuizSubmitModal({
  isOpen = false,
  totalQuestions = 0,
  answeredQuestions = 0,
  onConfirm = null,
  onCancel = null,
  isSubmitting = false,
}) {
  if (!isOpen) return null

  const unanswered = totalQuestions - answeredQuestions
  const dialogRef = useRef(null)
  const cancelButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  const backdropVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 20 },
    show: { scale: 1, opacity: 1, y: 0 },
  }

  useEffect(() => {
    previousFocusRef.current = document.activeElement

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel?.()
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      const focusableElements = Array.from(focusable).filter((element) => !element.hasAttribute('disabled'))
      if (!focusableElements.length) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus?.()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus?.()
      }
    }

    const timer = window.setTimeout(() => {
      cancelButtonRef.current?.focus?.()
    }, 0)

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus?.()
    }
  }, [onCancel])

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="show"
        exit="hidden"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-submit-title"
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4"
      >
        {/* Icon and title */}
        {unanswered > 0 ? (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 id="quiz-submit-title" className="font-bold text-slate-900">Unanswered Questions</h2>
              <p className="text-sm text-slate-600 mt-1">
                You have {unanswered} question{unanswered !== 1 ? 's' : ''} that {unanswered === 1 ? 'is' : 'are'} not answered.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 id="quiz-submit-title" className="font-bold text-slate-900">Ready to Submit?</h2>
              <p className="text-sm text-slate-600 mt-1">
                All {totalQuestions} questions answered. Submit your quiz now.
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1 border border-slate-100">
          <div className="flex justify-between text-slate-600">
            <span>Total Questions:</span>
            <span className="font-semibold">{totalQuestions}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Answered:</span>
            <span className="font-semibold text-green-600">{answeredQuestions}</span>
          </div>
          {unanswered > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Unanswered:</span>
              <span className="font-semibold text-orange-600">{unanswered}</span>
            </div>
          )}
        </div>

        {/* Message */}
        <p className="text-sm text-slate-600">
          {unanswered > 0
            ? 'Do you want to continue reviewing or submit anyway?'
            : 'You cannot change your answers after submitting.'}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {unanswered > 0 ? 'Keep Reviewing' : 'Continue'}
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Quiz</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
