import { useCallback, useEffect, useRef, useState } from 'react'
import { useAccessibilitySettings } from './useAccessibilitySettings'
import { useSpeechSynthesis } from './useSpeechSynthesis'

function normalizeLabel(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function getElementLabel(element) {
  if (!element) return ''

  const ariaLabel = normalizeLabel(element.getAttribute?.('aria-label'))
  if (ariaLabel) return ariaLabel

  const dataLabel = normalizeLabel(element.getAttribute?.('data-speech-label'))
  if (dataLabel) return dataLabel

  const title = normalizeLabel(element.getAttribute?.('title'))
  if (title) return title

  const labelledBy = element.getAttribute?.('aria-labelledby')
  if (labelledBy) {
    const labels = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent || '')
      .map(normalizeLabel)
      .filter(Boolean)
    if (labels.length) return labels.join(' ')
  }

  const text = normalizeLabel(element.textContent)
  if (text) return text

  return ''
}

function shouldIgnoreElement(element) {
  if (!element) return true
  if (element.closest?.('[data-speech-ignore="true"]')) return true
  if (element.matches?.('input, textarea, select, option, [contenteditable="true"]')) return true
  return false
}

export function useFocusSpeech() {
  const { speechNavigation } = useAccessibilitySettings()
  const { speak, stop, isSupported } = useSpeechSynthesis()
  const [announcement, setAnnouncement] = useState('')
  const lastAnnouncementRef = useRef('')
  const lastSpokenAtRef = useRef(0)

  const announce = useCallback((label, options = {}) => {
    const value = normalizeLabel(label)
    if (!value || !speechNavigation) return false

    const now = Date.now()
    if (value === lastAnnouncementRef.current && now - lastSpokenAtRef.current < (options.debounceMs || 700)) {
      return false
    }

    lastAnnouncementRef.current = value
    lastSpokenAtRef.current = now
    setAnnouncement(value)
    return speak(value, { force: true, ...options })
  }, [speechNavigation, speak])

  useEffect(() => {
    if (!speechNavigation || !isSupported) {
      setAnnouncement('')
      return undefined
    }

    const handleFocus = (event) => {
      const target = event.target
      if (shouldIgnoreElement(target)) return

      const label = getElementLabel(target)
      if (!label) return

      announce(label, { rate: target?.dataset?.speechRate ? Number(target.dataset.speechRate) : undefined })
    }

    const handleBlur = () => {
      if (!speechNavigation) return
      if (window.document.activeElement === document.body) {
        stop()
      }
    }

    document.addEventListener('focusin', handleFocus)
    document.addEventListener('focusout', handleBlur)

    return () => {
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('focusout', handleBlur)
    }
  }, [announce, isSupported, speechNavigation, stop])

  return {
    announcement,
    announce,
    enabled: speechNavigation,
    isSupported,
  }
}

export default useFocusSpeech
