import React from 'react'
import { motion } from 'framer-motion'

/**
 * QuizProgressBar - Visual progress indicator through quiz
 * Shows current question position and total questions
 * Animated progress bar with smooth transitions
 */
export function QuizProgressBar({ currentQuestion = 0, totalQuestions = 1, answered = 0 }) {
  const progressPercent = ((currentQuestion + 1) / totalQuestions) * 100
  const answeredPercent = (answered / totalQuestions) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium">
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        <span className="text-slate-500">
          {answered} answered
        </span>
      </div>

      <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        {/* Answered questions background */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${answeredPercent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-green-400/40 rounded-full"
        />

        {/* Current position */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-blue-400 rounded-full"
        />
      </div>

      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: Math.min(totalQuestions, 20) }).map((_, i) => {
          const qIndex = Math.floor((i / 20) * totalQuestions)
          const isAnswered = qIndex < answered
          const isCurrent = qIndex === currentQuestion

          return (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${
                isCurrent
                  ? 'bg-blue-500'
                  : isAnswered
                    ? 'bg-green-400'
                    : 'bg-slate-200'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
