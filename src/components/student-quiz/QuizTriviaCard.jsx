/**
 * QuizTriviaCard
 * Displays fun facts and learning trivia related to the question
 */

import React from 'react'

export function QuizTriviaCard({ trivia, learningTip, conceptTags }) {
  const hasContent = trivia || learningTip || (Array.isArray(conceptTags) && conceptTags.length > 0)

  if (!hasContent) return null

  return (
    <div className="space-y-3">
      {trivia && (
        <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4 text-blue-900 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-50">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 text-sm font-bold uppercase tracking-[0.12em]">Did you know?</span>
            <div className="min-w-0 flex-1">
              <h4 className="mb-1 text-sm font-semibold md:text-base">Fun Fact</h4>
              <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                {trivia}
              </p>
            </div>
          </div>
        </div>
      )}

      {learningTip && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-50">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 text-sm font-bold uppercase tracking-[0.12em]">Tip</span>
            <div className="min-w-0 flex-1">
              <h4 className="mb-1 text-sm font-semibold md:text-base">Learning Tip</h4>
              <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                {learningTip}
              </p>
            </div>
          </div>
        </div>
      )}

      {Array.isArray(conceptTags) && conceptTags.length > 0 && (
        <div className="rounded-lg border-2 border-purple-300 bg-purple-50 p-4 text-purple-900 dark:border-purple-700 dark:bg-purple-900 dark:text-purple-50">
          <h4 className="mb-2 text-sm font-semibold md:text-base">Related Concepts</h4>
          <div className="flex flex-wrap gap-2">
            {conceptTags.map((tag, index) => (
              <span
                key={index}
                className="inline-block rounded-full bg-purple-200 px-3 py-1 text-xs font-medium dark:bg-purple-800"
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
