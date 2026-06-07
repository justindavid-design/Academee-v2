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
  const dialogRef = useRef(null)
  const cancelButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

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
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const unanswered = totalQuestions - answeredQuestions

  const backdropVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 20 },
    show: { scale: 1, opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
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
        className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-xl"
      >
        {unanswered > 0 ? (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-lg bg-orange-100 p-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 id="quiz-submit-title" className="font-bold text-slate-900">Unanswered Questions</h2>
              <p className="mt-1 text-sm text-slate-600">
                You have {unanswered} question{unanswered !== 1 ? 's' : ''} that {unanswered === 1 ? 'is' : 'are'} not answered.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-lg bg-blue-100 p-2">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 id="quiz-submit-title" className="font-bold text-slate-900">Ready to Submit?</h2>
              <p className="mt-1 text-sm text-slate-600">
                All {totalQuestions} questions answered. Submit your quiz now.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
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

        <p className="text-sm text-slate-600">
          {unanswered > 0
            ? 'Do you want to continue reviewing or submit anyway?'
            : 'You cannot change your answers after submitting.'}
        </p>

        <div className="flex gap-3 pt-2">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {unanswered > 0 ? 'Keep Reviewing' : 'Continue'}
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Quiz</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default QuizSubmitModal
