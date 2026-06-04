import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { QuizTimer } from './QuizTimer'
import { QuizProgressBar } from './QuizProgressBar'

/**
 * QuizHeader - Sticky header showing quiz info, timer, and progress
 * Displays quiz title, navigation, timer, and progress indicator
 * Professional, minimal, focused on the assessment
 */
export function QuizHeader({
  quizTitle = 'Quiz',
  currentQuestion = 0,
  totalQuestions = 1,
  answered = 0,
  duration = 30, // in minutes
  isActive = true,
  onTimeUp = null,
  onExit = null,
  showProgress = true,
}) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm"
    >
      <div className="px-6 py-4 space-y-4">
        {/* Top bar: back button and title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {onExit && (
              <button
                onClick={onExit}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors -ml-2"
                title="Exit quiz"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
            )}
            <h1 className="text-lg font-bold text-slate-900 truncate">{quizTitle}</h1>
          </div>

          {/* Timer on the right */}
          <QuizTimer
            duration={duration}
            isActive={isActive}
            onTimeUp={onTimeUp}
          />
        </div>

        {/* Progress bar */}
        {showProgress && (
          <QuizProgressBar
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            answered={answered}
          />
        )}
      </div>
    </motion.div>
  )
}
