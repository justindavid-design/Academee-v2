import React from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

/**
 * AnswerOption - Individual answer choice card
 * Supports multiple choice, checkboxes, true/false, etc.
 * Shows selection state, correct/incorrect feedback
 * Fully keyboard and touch accessible
 */
export function AnswerOption({
  text = '',
  index = 0,
  isSelected = false,
  isCorrect = null,
  isDisabled = false,
  isShowing = true,
  onSelect = null,
  type = 'single', // 'single', 'multiple', 'true-false'
  showFeedback = false,
}) {
  if (!isShowing) return null

  const handleClick = () => {
    if (!isDisabled && onSelect) {
      onSelect(index)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
      return
    }

    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) {
      const buttons = Array.from(e.currentTarget.parentElement?.querySelectorAll('button[role="radio"]') || [])
      const currentIndex = buttons.indexOf(e.currentTarget)
      if (currentIndex < 0) return

      const nextIndex = e.key === 'ArrowDown' || e.key === 'ArrowRight'
        ? currentIndex + 1
        : currentIndex - 1

      const nextButton = buttons[nextIndex]
      if (!nextButton) return

      e.preventDefault()
      nextButton.focus()
      nextButton.click()
    }
  }

  // Determine styling based on state
  const isIncorrect = showFeedback && isSelected && isCorrect === false
  const isCorrectSelection = showFeedback && isSelected && isCorrect === true
  const isUnansweredCorrect = showFeedback && !isSelected && isCorrect === true

  const getBaseStyle = () => {
    if (isIncorrect) return 'border-red-300 bg-red-50 text-red-900'
    if (isCorrectSelection) return 'border-green-300 bg-green-50 text-green-900'
    if (isUnansweredCorrect) return 'border-green-300 bg-green-50 text-green-900'
    if (isSelected) return 'border-blue-400 bg-blue-50 text-blue-900'
    return 'border-slate-200 bg-white text-slate-900'
  }

  const getHoverStyle = () => {
    if (isDisabled) return ''
    if (isSelected || showFeedback) return ''
    return 'hover:border-blue-300 hover:bg-slate-50'
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      type="button"
      disabled={isDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="radio"
      aria-checked={isSelected}
      aria-disabled={isDisabled}
      aria-label={`Answer option ${index + 1}${isSelected ? ', selected' : ''}${showFeedback && isCorrectSelection ? ', correct' : ''}`}
      data-speech-label={`Answer option ${index + 1}. ${text}`}
      className={`relative w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 font-medium text-base group ${
        getBaseStyle()
      } ${getHoverStyle()} ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox/Radio indicator */}
        <div
          className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-lg border-2 transition-all flex items-center justify-center ${
            isIncorrect
              ? 'border-red-400 bg-red-100'
              : isCorrectSelection || isUnansweredCorrect
                ? 'border-green-400 bg-green-100'
                : isSelected
                  ? 'border-blue-500 bg-blue-100'
                  : 'border-slate-300 bg-slate-50'
          }`}
        >
          {isIncorrect && <X className="w-3 h-3 text-red-600" />}
          {(isCorrectSelection || isUnansweredCorrect) && <Check className="w-3 h-3 text-green-600" />}
          {!showFeedback && isSelected && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
        </div>

        {/* Answer text */}
        <span className="flex-1 text-sm leading-relaxed break-words pr-2">{text}</span>
      </div>

      {/* Feedback icon on the right */}
      {showFeedback && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isIncorrect && <X className="w-5 h-5 text-red-500" />}
          {(isCorrectSelection || isUnansweredCorrect) && <Check className="w-5 h-5 text-green-500" />}
        </div>
      )}

      {/* Focus ring for accessibility */}
      <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-focus-visible:ring-blue-400 pointer-events-none transition-all" />
    </motion.button>
  )
}
