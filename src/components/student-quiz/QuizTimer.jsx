import React, { useEffect, useState } from 'react'
import { Clock, AlertCircle } from 'lucide-react'

/**
 * QuizTimer - Displays and manages quiz countdown timer
 * Shows time remaining in MM:SS format
 * Warns when time is running low (< 5 minutes)
 */
export function QuizTimer({ duration, isActive = true, onTimeUp = null }) {
  const [secondsLeft, setSecondsLeft] = useState(duration * 60)
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    setSecondsLeft(Math.max(0, Number(duration) || 0) * 60)
  }, [duration])

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = Math.max(0, prev - 1)
        if (next === 0 && onTimeUp) {
          onTimeUp()
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, onTimeUp])

  useEffect(() => {
    setIsWarning(secondsLeft > 0 && secondsLeft <= 300) // 5 minutes warning
  }, [secondsLeft])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return (
    <div
      role="timer"
      aria-live={isWarning ? 'assertive' : 'polite'}
      aria-label={`Time remaining ${displayTime.replace(':', ' minutes and ')} seconds`}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        isWarning
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-slate-100 text-slate-700 border border-slate-200'
      }`}
    >
      {isWarning ? (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <Clock className="w-4 h-4 flex-shrink-0" />
      )}
      <span className="font-mono font-semibold text-sm">{displayTime}</span>
    </div>
  )
}
