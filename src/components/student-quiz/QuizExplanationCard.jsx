/**
 * QuizExplanationCard
 * Displays why the answer is correct or incorrect
 */

import React from 'react'

export function QuizExplanationCard({ isCorrect, explanation, selectedOption, correctOption, answerAnalysis }) {
  if (!explanation) return null

  const baseStyle =
    'rounded-lg border-2 p-4 mb-4 transition-colors duration-200'
  const colorStyle = isCorrect
    ? 'border-green-300 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-900 dark:text-green-50'
    : 'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-900 dark:text-red-50'

  const iconStyle = isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  const icon = isCorrect ? '✓' : '✗'

  return (
    <div className={`${baseStyle} ${colorStyle}`}>
      <div className='flex items-start gap-3'>
        <span className={`text-2xl font-bold ${iconStyle} flex-shrink-0 mt-0.5`}>
          {icon}
        </span>
        <div className='flex-1 min-w-0'>
          <h3 className='font-semibold mb-2 text-sm md:text-base'>
            {isCorrect ? 'Correct!' : 'Not Quite Right'}
          </h3>
          <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
            {explanation}
          </p>

          {answerAnalysis && (
            <div className='mt-3 pt-3 border-t border-current border-opacity-20'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] opacity-75 mb-2'>
                Chosen answer analysis
              </p>
              <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
                {answerAnalysis}
              </p>
            </div>
          )}

          {/* Show selected vs correct for wrong answers */}
          {!isCorrect && selectedOption && correctOption && (
            <div className='mt-3 pt-3 border-t border-current border-opacity-20'>
              <p className='text-xs opacity-75 mb-2'>Your answer:</p>
              <p className='text-sm mb-2 italic'>{selectedOption}</p>
              <p className='text-xs opacity-75 mb-2'>Correct answer:</p>
              <p className='text-sm font-medium'>{correctOption}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizExplanationCard
