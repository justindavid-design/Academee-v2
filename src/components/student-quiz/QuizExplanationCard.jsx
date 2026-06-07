/**
 * QuizExplanationCard
 * Displays why the answer is correct or incorrect
 */

import React from 'react'

export function QuizExplanationCard({ isCorrect, explanation, selectedOption, correctOption, answerAnalysis }) {
  if (!explanation) return null

  const baseStyle = 'mb-4 rounded-lg border-2 p-4 transition-colors duration-200'
  const colorStyle = isCorrect
    ? 'border-green-300 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-900 dark:text-green-50'
    : 'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-900 dark:text-red-50'

  const iconStyle = isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'

  return (
    <div className={`${baseStyle} ${colorStyle}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex-shrink-0 text-2xl font-bold ${iconStyle}`}>
          {isCorrect ? 'Correct' : 'Incorrect'}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="mb-2 text-sm font-semibold md:text-base">
            {isCorrect ? 'Correct!' : 'Not Quite Right'}
          </h3>
          <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
            {explanation}
          </p>

          {answerAnalysis && (
            <div className="mt-3 border-t border-current border-opacity-20 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] opacity-75">
                Chosen answer analysis
              </p>
              <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                {answerAnalysis}
              </p>
            </div>
          )}

          {!isCorrect && selectedOption && correctOption && (
            <div className="mt-3 border-t border-current border-opacity-20 pt-3">
              <p className="mb-2 text-xs opacity-75">Your answer:</p>
              <p className="mb-2 text-sm italic">{selectedOption}</p>
              <p className="mb-2 text-xs opacity-75">Correct answer:</p>
              <p className="text-sm font-medium">{correctOption}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizExplanationCard
