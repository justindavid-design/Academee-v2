import { useSyncExternalStore } from 'react'
import {
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  applyAccessibilityPreferences,
  clearThemePreset,
  getAccessibilityPreferences,
  getThemeSnapshot,
  setAccessibilityPreferences as persistAccessibilityPreferences,
} from '../lib/theme'

const ACCESSIBILITY_KEY = 'academee_accessibility'

let snapshot = getAccessibilityPreferences()
const listeners = new Set()
let initialized = false

function canUseDOM() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function setupAccessibilityListeners() {
  if (!canUseDOM() || initialized) return

  initialized = true

  const handleStorageChange = (event) => {
    if (event.key !== ACCESSIBILITY_KEY) return

    snapshot = getAccessibilityPreferences()
    applyAccessibilityPreferences(snapshot)
    listeners.forEach((listener) => listener())
  }

  window.addEventListener('storage', handleStorageChange)
}

function broadcast(nextPrefs) {
  snapshot = nextPrefs
  applyAccessibilityPreferences(nextPrefs)
  listeners.forEach((listener) => listener())
}

export function initAccessibilitySettings() {
  setupAccessibilityListeners()
  snapshot = getAccessibilityPreferences()
  applyAccessibilityPreferences(snapshot)
  return snapshot
}

export function setAccessibilitySettings(prefs) {
  const next = persistAccessibilityPreferences(prefs)
  broadcast(next)
  return next
}

export function updateAccessibilitySettings(patch) {
  const next = { ...snapshot, ...patch }

  // Keep the accessibility toggle and theme preset aligned.
  if (Object.prototype.hasOwnProperty.call(patch, 'highContrast') && patch.highContrast === false) {
    const themeSnapshot = getThemeSnapshot()
    if (themeSnapshot.customTheme === 'theme-high-contrast') {
      clearThemePreset()
    }
  }

  return setAccessibilitySettings(next)
}

export function resetAccessibilitySettings() {
  const themeSnapshot = getThemeSnapshot()
  if (themeSnapshot.customTheme === 'theme-high-contrast') {
    clearThemePreset()
  }

  return setAccessibilitySettings(DEFAULT_ACCESSIBILITY_PREFERENCES)
}

export function useAccessibilitySettings() {
  const prefs = useSyncExternalStore(
    (callback) => {
      listeners.add(callback)
      setupAccessibilityListeners()
      return () => listeners.delete(callback)
    },
    () => snapshot,
    () => DEFAULT_ACCESSIBILITY_PREFERENCES,
  )

  return {
    ...prefs,
    preferences: prefs,
    setPreferences: setAccessibilitySettings,
    updatePreferences: updateAccessibilitySettings,
    resetPreferences: resetAccessibilitySettings,
  }
}

if (canUseDOM()) {
  initAccessibilitySettings()
}

export default useAccessibilitySettings
