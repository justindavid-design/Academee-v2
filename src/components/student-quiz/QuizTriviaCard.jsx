/**
 * QuizTriviaCard
 * Displays fun facts and learning trivia related to the question
 */

import React from 'react'

export function QuizTriviaCard({ trivia, learningTip, conceptTags }) {
  const hasContent = trivia || learningTip || (Array.isArray(conceptTags) && conceptTags.length > 0)

  if (!hasContent) return null

  return (
    <div className='space-y-3'>
      {/* Trivia */}
      {trivia && (
        <div className='rounded-lg border-2 border-blue-300 bg-blue-50 p-4 text-blue-900 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-50'>
          <div className='flex items-start gap-3'>
            <span className='text-2xl flex-shrink-0'>🎓</span>
            <div className='flex-1 min-w-0'>
              <h4 className='font-semibold mb-1 text-sm md:text-base'>Fun Fact</h4>
              <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
                {trivia}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Learning Tip */}
      {learningTip && (
        <div className='rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-50'>
          <div className='flex items-start gap-3'>
            <span className='text-2xl flex-shrink-0'>💡</span>
            <div className='flex-1 min-w-0'>
              <h4 className='font-semibold mb-1 text-sm md:text-base'>Learning Tip</h4>
              <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
                {learningTip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Concept Tags */}
      {Array.isArray(conceptTags) && conceptTags.length > 0 && (
        <div className='rounded-lg border-2 border-purple-300 bg-purple-50 p-4 text-purple-900 dark:border-purple-700 dark:bg-purple-900 dark:text-purple-50'>
          <h4 className='font-semibold mb-2 text-sm md:text-base'>Related Concepts</h4>
          <div className='flex flex-wrap gap-2'>
            {conceptTags.map((tag, index) => (
              <span
                key={index}
                className='inline-block rounded-full bg-purple-200 px-3 py-1 text-xs font-medium dark:bg-purple-800'
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizTriviaCard
