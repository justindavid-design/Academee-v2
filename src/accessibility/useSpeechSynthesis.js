import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccessibilitySettings } from './useAccessibilitySettings'

function canUseSpeech() {
  return typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined'
}

function normalizeSpeechText(text) {
  if (Array.isArray(text)) {
    return text.flat().filter(Boolean).join(' ')
  }

  if (typeof text === 'string') {
    return text
  }

  if (text == null) return ''

  return String(text)
}

export function useSpeechSynthesis() {
  const { speechRate, textToSpeech, updatePreferences } = useAccessibilitySettings()
  const utteranceRef = useRef(null)
  const lastTextRef = useRef('')
  const lastOptionsRef = useRef({})
  const [status, setStatus] = useState('idle')

  const isSupported = useMemo(() => canUseSpeech(), [])

  const stop = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    utteranceRef.current = null
    setStatus('idle')
  }, [isSupported])

  const pause = useCallback(() => {
    if (!isSupported || !window.speechSynthesis.speaking) return
    window.speechSynthesis.pause()
    setStatus('paused')
  }, [isSupported])

  const resume = useCallback(() => {
    if (!isSupported || !window.speechSynthesis.paused) return
    window.speechSynthesis.resume()
    setStatus('speaking')
  }, [isSupported])

  const speak = useCallback((text, options = {}) => {
    const value = normalizeSpeechText(text).trim()
    if (!value || !isSupported) return false
    if (!options.force && !textToSpeech) return false

    const rate = Math.min(1.75, Math.max(0.75, Number(options.rate ?? speechRate ?? 1) || 1))
    const utterance = new window.SpeechSynthesisUtterance(value)

    lastTextRef.current = value
    lastOptionsRef.current = { ...options, rate }

    utterance.rate = rate
    utterance.pitch = Number(options.pitch ?? 1) || 1
    utterance.volume = Number(options.volume ?? 1) || 1
    utterance.lang = options.lang || window.navigator?.language || 'en-US'

    utterance.onstart = () => setStatus('speaking')
    utterance.onend = () => {
      utteranceRef.current = null
      setStatus('idle')
    }
    utterance.onerror = () => {
      utteranceRef.current = null
      setStatus('idle')
    }

    window.speechSynthesis.cancel()
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    return true
  }, [isSupported, speechRate, textToSpeech])

  const replay = useCallback((overrideOptions = {}) => {
    if (!lastTextRef.current) return false
    return speak(lastTextRef.current, {
      ...lastOptionsRef.current,
      ...overrideOptions,
    })
  }, [speak])

  const setRate = useCallback((nextRate) => {
    const normalized = Math.min(1.75, Math.max(0.75, Number(nextRate) || 1))
    updatePreferences({ speechRate: normalized })
    return normalized
  }, [updatePreferences])

  useEffect(() => () => {
    if (isSupported) window.speechSynthesis.cancel()
  }, [isSupported])

  return {
    isSupported,
    isEnabled: textToSpeech,
    status,
    isSpeaking: status === 'speaking',
    isPaused: status === 'paused',
    rate: speechRate,
    speak,
    pause,
    resume,
    stop,
    replay,
    setRate,
  }
}

export default useSpeechSynthesis
