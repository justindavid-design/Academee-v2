import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Mic, MicOff, Square } from 'lucide-react'
import useSpeechRecognition from '../../accessibility/useSpeechRecognition'

function joinTranscript(baseValue, transcript) {
  const base = String(baseValue || '')
  const text = String(transcript || '').trim()
  if (!text) return base
  if (!base) return text
  return `${base.replace(/\s+$/, '')} ${text}`.replace(/\s+/g, ' ').trimStart()
}

export default function SpeechInputButton({
  value = '',
  onChange = null,
  label = 'Voice input',
  className = '',
  buttonClassName = '',
  liveClassName = '',
  placeholder = 'Tap to dictate',
  lang = undefined,
}) {
  const baseValueRef = useRef('')
  const [lastSnapshot, setLastSnapshot] = useState('')
  const {
    isSupported,
    isEnabled,
    isListening,
    transcript,
    error,
    start,
    stop,
    toggle,
  } = useSpeechRecognition()

  useEffect(() => {
    if (!isListening) {
      baseValueRef.current = ''
    }
  }, [isListening])

  useEffect(() => {
    if (!isListening || typeof onChange !== 'function') return
    const nextValue = joinTranscript(baseValueRef.current, transcript)
    setLastSnapshot(nextValue)
    onChange(nextValue)
  }, [isListening, onChange, transcript])

  const displayText = useMemo(() => {
    if (isListening) return lastSnapshot || value || placeholder
    if (transcript) return joinTranscript(baseValueRef.current, transcript)
    return value || placeholder
  }, [isListening, lastSnapshot, placeholder, transcript, value])

  const handleToggle = () => {
    if (isListening) {
      stop()
      return
    }

    baseValueRef.current = typeof value === 'string' ? value : String(value || '')
    start({
      lang,
      baseValue: baseValueRef.current,
      onTranscript: (next) => {
        const combined = joinTranscript(baseValueRef.current, next)
        setLastSnapshot(combined)
        onChange?.(combined)
      },
      onError: () => {
        // handled through hook state
      },
    })
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={isListening}
        aria-label={label}
        className={`inline-flex items-center gap-2 rounded-xl border border-token bg-surface px-3 py-2 text-sm font-semibold text-main transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50 ${buttonClassName}`}
        disabled={!isSupported || !isEnabled}
      >
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        <span>{isListening ? 'Stop dictation' : label}</span>
      </button>

      <p className={`min-h-[1.25rem] text-xs text-muted ${liveClassName}`} aria-live="polite">
        {error
          ? error
          : isListening
            ? `Listening. ${displayText}`
            : isSupported
              ? 'Voice input ready.'
              : 'Voice input is not supported in this browser.'}
      </p>

      {isListening ? (
        <button
          type="button"
          onClick={stop}
          className="inline-flex items-center gap-1.5 rounded-full bg-surface-quiet px-2.5 py-1 text-[11px] font-semibold text-muted transition hover:bg-surface-alt"
        >
          <Square className="h-3.5 w-3.5" />
          Stop recording
        </button>
      ) : null}
    </div>
  )
}
