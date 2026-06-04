import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * QuizNavigator - Sidebar navigation panel showing all quiz questions
 * Allows jumping to specific questions
 * Shows answered/unanswered status
 * Can be collapsed on mobile
 */
export function QuizNavigator({
  totalQuestions = 0,
  currentQuestion = 0,
  answeredQuestions = [],
  flaggedQuestions = [],
  onSelectQuestion = null,
  isOpen = true,
  onToggle = null,
}) {
  const isAnswered = (index) => answeredQuestions.includes(index)
  const isFlagged = (index) => flaggedQuestions.includes(index)
  const buttonRefs = useRef([])

  const container = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: { staggerChildren: 0.02 },
    },
  }

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  }

  useEffect(() => {
    if (!isOpen) return
    buttonRefs.current[currentQuestion]?.focus?.()
  }, [currentQuestion, isOpen])

  const moveFocus = (index) => {
    if (index < 0 || index >= totalQuestions) return
    onSelectQuestion?.(index)
    buttonRefs.current[index]?.focus?.()
  }

  const handleKeyDown = (event, index) => {
    let nextIndex = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = Math.min(totalQuestions - 1, index + 1)
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = Math.max(0, index - 1)
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = totalQuestions - 1
    if (nextIndex === null) return

    event.preventDefault()
    moveFocus(nextIndex)
  }

  return (
    <div
      role="navigation"
      aria-label="Quiz navigator"
      className={`flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        {isOpen && (
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900">Questions</h3>
            <p className="text-xs text-slate-500 mt-1">
              {answeredQuestions.length} of {totalQuestions} answered
            </p>
          </div>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label={isOpen ? 'Close navigator' : 'Open navigator'}
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-600" />
            )}
          </button>
        )}
      </div>

      {/* Questions list */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={`grid gap-1 ${isOpen ? 'grid-cols-4' : 'grid-cols-2'}`}
          >
            {Array.from({ length: totalQuestions }).map((_, index) => {
              const answered = isAnswered(index)
              const flagged = isFlagged(index)
              const isCurrent = index === currentQuestion

              return (
                <motion.button
                  key={index}
                  variants={item}
                  ref={(node) => {
                    buttonRefs.current[index] = node
                  }}
                  onClick={() => moveFocus(index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Question ${index + 1}${answered ? ', answered' : ', unanswered'}${flagged ? ', flagged' : ''}${isCurrent ? ', current question' : ''}`}
                  data-speech-label={`Question ${index + 1}${answered ? ', answered' : ', unanswered'}`}
                  className={`relative aspect-square rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center ${
                    isCurrent
                      ? 'bg-blue-500 text-white ring-2 ring-blue-400 ring-offset-1'
                      : answered
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  } ${flagged ? 'ring-2 ring-orange-400 ring-offset-1' : ''}`}
                  title={`Question ${index + 1}${answered ? ' - Answered' : ''}${flagged ? ' - Flagged' : ''}`}
                >
                  {isOpen && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span>{index + 1}</span>
                    </div>
                  )}
                  {!isOpen && (
                    <div className="text-xs font-bold">{index + 1}</div>
                  )}

                  {/* Status indicator dot (small, top-right) */}
                  {!isOpen && answered && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Legend (only show when open) */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-slate-100 p-4 space-y-2 text-xs"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-slate-600">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
            <span className="text-slate-600">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-100 border border-slate-300" />
            <span className="text-slate-600">Unanswered</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
