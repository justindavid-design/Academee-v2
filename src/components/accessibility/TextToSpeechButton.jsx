import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Pause, Play, RotateCcw, Square, Volume2 } from 'lucide-react'
import useSpeechSynthesis from '../../accessibility/useSpeechSynthesis'

function resolveSpeechText(content) {
  if (Array.isArray(content)) {
    return content.flat().filter(Boolean).join(' ')
  }

  if (typeof content === 'string') return content
  if (content == null) return ''
  return String(content)
}

export default function TextToSpeechButton({
  text = '',
  label = 'Read aloud',
  className = '',
  buttonClassName = '',
  panelClassName = '',
  placement = 'right',
  compact = false,
}) {
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const {
    isSupported,
    isEnabled,
    isSpeaking,
    isPaused,
    status,
    rate,
    setRate,
    speak,
    pause,
    resume,
    stop,
    replay,
  } = useSpeechSynthesis()

  const value = useMemo(() => resolveSpeechText(text).trim(), [text])
  const canReplay = !!value
  const isDisabled = !isSupported || !isEnabled || !value

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handlePrimaryAction = () => {
    if (!value || !isSupported) return

    if (isSpeaking) {
      pause()
      return
    }

    if (isPaused) {
      resume()
      return
    }

    speak(value)
  }

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-token bg-surface px-3 py-2 text-sm font-semibold text-main transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50 ${buttonClassName}`}
        disabled={isDisabled}
        title={!isEnabled ? 'Enable Text-to-Speech in accessibility settings' : undefined}
      >
        <Volume2 className="h-4 w-4" />
        {!compact ? <span className="hidden sm:inline">{label}</span> : null}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={`${label} controls`}
          className={`absolute top-full z-30 mt-2 w-72 rounded-2xl border border-token bg-surface p-3 shadow-card ${placement === 'right' ? 'right-0' : 'left-0'} ${panelClassName}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-main">{label}</p>
              <p className="text-xs text-muted">{status === 'speaking' ? 'Reading aloud' : status === 'paused' ? 'Paused' : 'Ready'}</p>
            </div>
            <span className="rounded-full bg-surface-quiet px-2 py-1 text-[11px] font-semibold text-muted">
              {value.length} chars
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={isDisabled}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-token px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSpeaking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isSpeaking ? 'Pause' : isPaused ? 'Resume' : 'Play'}
            </button>
            <button
              type="button"
              onClick={() => stop()}
              disabled={isDisabled}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-token bg-surface px-3 py-2 text-sm font-semibold text-main transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Square className="h-4 w-4" />
              Stop
            </button>
            <button
              type="button"
              onClick={() => replay()}
              disabled={isDisabled || !canReplay}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-token bg-surface px-3 py-2 text-sm font-semibold text-main transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Replay
            </button>
            <button
              type="button"
              onClick={() => speak(value)}
              disabled={isDisabled || !canReplay}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-token bg-surface px-3 py-2 text-sm font-semibold text-main transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              Restart
            </button>
          </div>

          <label className="mt-3 block">
            <span className="text-xs font-semibold text-muted">Speech rate</span>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min="0.75"
                max="1.75"
                step="0.05"
                value={rate}
                onChange={(event) => setRate(Number(event.target.value))}
                className="h-2 w-full cursor-pointer accent-[color:var(--primary)]"
                aria-label="Speech rate"
              />
              <span className="w-12 rounded-full bg-surface-quiet px-2 py-1 text-center text-xs font-semibold text-main">
                {Number(rate).toFixed(2)}x
              </span>
            </div>
          </label>
        </div>
      ) : null}
    </div>
  )
}
