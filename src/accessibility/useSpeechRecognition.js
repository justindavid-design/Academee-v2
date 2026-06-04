import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccessibilitySettings } from './useAccessibilitySettings'

function getRecognitionConstructor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function useSpeechRecognition() {
  const { speechToText } = useAccessibilitySettings()
  const recognitionRef = useRef(null)
  const baseValueRef = useRef('')
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')

  const isSupported = useMemo(() => !!getRecognitionConstructor(), [])

  const cleanupRecognition = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.onresult = null
    recognitionRef.current.onerror = null
    recognitionRef.current.onend = null
    recognitionRef.current = null
  }, [])

  const stop = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
  }, [])

  const start = useCallback((options = {}) => {
    if (!isSupported || !speechToText) return false

    const Recognition = getRecognitionConstructor()
    if (!Recognition) return false

    cleanupRecognition()
    const recognition = new Recognition()
    recognition.continuous = !!options.continuous
    recognition.interimResults = true
    recognition.lang = options.lang || window.navigator?.language || 'en-US'

    baseValueRef.current = typeof options.baseValue === 'string' ? options.baseValue : ''
    setTranscript('')
    setError('')
    setIsListening(true)

    recognition.onresult = (event) => {
      const combined = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()

      setTranscript(combined)
      options.onTranscript?.(combined, { isFinal: event.results[event.results.length - 1]?.isFinal })
    }

    recognition.onerror = (event) => {
      setError(event.error || 'Speech recognition failed.')
      setIsListening(false)
      options.onError?.(event.error || 'Speech recognition failed.')
      cleanupRecognition()
    }

    recognition.onend = () => {
      setIsListening(false)
      cleanupRecognition()
      options.onEnd?.(transcript)
    }

    recognitionRef.current = recognition
    recognition.start()
    return true
  }, [cleanupRecognition, isSupported, speechToText, transcript])

  const toggle = useCallback((options = {}) => {
    if (isListening) {
      stop()
      return false
    }

    return start(options)
  }, [isListening, start, stop])

  useEffect(() => () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (_error) {
        // no-op
      }
    }
    cleanupRecognition()
  }, [cleanupRecognition])

  return {
    isSupported,
    isEnabled: speechToText,
    isListening,
    transcript,
    error,
    start,
    stop,
    toggle,
  }
}

export default useSpeechRecognition
