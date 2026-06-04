import { useSyncExternalStore } from 'react'

const THEME_MODE_KEY = 'theme-mode'
const THEME_PRESET_KEY = 'theme-preset'
const LEGACY_THEME_KEY = 'theme'
const ACCESSIBILITY_KEY = 'academee_accessibility'
const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)'

export const DEFAULT_ACCESSIBILITY_PREFERENCES = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  readableFont: false,
  textToSpeech: false,
  speechNavigation: false,
  speechToText: false,
  speechRate: 1,
}

export const CUSTOM_THEMES = [
  { key: 'theme-aquatic', label: 'Aquatic', scheme: 'dark' },
  { key: 'theme-desert', label: 'Desert', scheme: 'light' },
  { key: 'theme-dusk', label: 'Dusk', scheme: 'dark' },
  { key: 'theme-night-sky', label: 'Night Sky', scheme: 'dark' },
  { key: 'theme-neon-pulse', label: 'Neon Pulse', scheme: 'dark' },
  { key: 'theme-high-contrast', label: 'High Contrast', scheme: 'light' },
]

const CUSTOM_THEME_LOOKUP = new Map(CUSTOM_THEMES.map((theme) => [theme.key, theme]))

let snapshot = {
  mode: 'system',
  theme: 'light',
  customTheme: '',
}

const listeners = new Set()
let initialized = false

function canUseDOM() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function isValidMode(value) {
  return value === 'light' || value === 'dark' || value === 'system'
}

function getThemeMeta(themeKey) {
  return CUSTOM_THEME_LOOKUP.get(themeKey) || null
}

function getPrefersDark() {
  if (!canUseDOM() || !window.matchMedia) return false
  return window.matchMedia(THEME_MEDIA_QUERY).matches
}

function normalizeSpeechRate(value) {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return DEFAULT_ACCESSIBILITY_PREFERENCES.speechRate
  return Math.min(1.75, Math.max(0.75, parsed))
}

function normalizeAccessibilityPreferences(prefs = {}) {
  return {
    ...DEFAULT_ACCESSIBILITY_PREFERENCES,
    ...prefs,
    speechRate: normalizeSpeechRate(prefs.speechRate),
  }
}

function resolveTheme(mode, customTheme) {
  if (customTheme) {
    return getThemeMeta(customTheme)?.scheme || 'light'
  }

  if (mode === 'system') {
    return getPrefersDark() ? 'dark' : 'light'
  }

  return mode
}

function applyThemeToDocument(nextSnapshot) {
  if (!canUseDOM()) return

  const root = document.documentElement

  CUSTOM_THEMES.forEach((theme) => {
    root.classList.remove(theme.key)
  })

  if (nextSnapshot.customTheme) {
    root.classList.add(nextSnapshot.customTheme)
  }

  root.classList.toggle('dark', nextSnapshot.theme === 'dark')
  root.dataset.themeMode = nextSnapshot.mode
  root.dataset.themePreset = nextSnapshot.customTheme || ''
  root.dataset.themeResolved = nextSnapshot.theme
  root.style.colorScheme = nextSnapshot.theme === 'dark' ? 'dark' : 'light'
}

function applyAccessibilityToDocument() {
  if (!canUseDOM()) return

  try {
    const prefs = getAccessibilityPreferences()
    applyAccessibilityPreferences(prefs)
  } catch (_error) {
    // no-op
  }
}

export function getAccessibilityPreferences() {
  if (!canUseDOM()) {
    return DEFAULT_ACCESSIBILITY_PREFERENCES
  }

  try {
    return normalizeAccessibilityPreferences(JSON.parse(window.localStorage.getItem(ACCESSIBILITY_KEY) || '{}'))
  } catch (_error) {
    return DEFAULT_ACCESSIBILITY_PREFERENCES
  }
}

export function applyAccessibilityPreferences(prefs = getAccessibilityPreferences()) {
  if (!canUseDOM()) return

  const normalized = normalizeAccessibilityPreferences(prefs)
  const root = document.documentElement

  root.classList.toggle('a11y-high-contrast', !!normalized.highContrast)
  root.classList.toggle('a11y-large-text', !!normalized.largeText)
  root.classList.toggle('a11y-reduced-motion', !!normalized.reducedMotion)
  root.classList.toggle('a11y-readable-font', !!normalized.readableFont)
  root.dataset.a11yTextToSpeech = normalized.textToSpeech ? 'on' : 'off'
  root.dataset.a11ySpeechNavigation = normalized.speechNavigation ? 'on' : 'off'
  root.dataset.a11ySpeechToText = normalized.speechToText ? 'on' : 'off'
  root.style.setProperty('--a11y-speech-rate', String(normalized.speechRate))
}

function persistAccessibilityPreferences(prefs) {
  if (!canUseDOM()) return

  try {
    window.localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(normalizeAccessibilityPreferences(prefs)))
  } catch (_error) {
    // no-op
  }
}

export function setAccessibilityPreferences(prefs) {
  const next = normalizeAccessibilityPreferences(prefs)
  persistAccessibilityPreferences(next)
  applyAccessibilityPreferences(next)
  return next
}

function persistThemeState(nextSnapshot) {
  if (!canUseDOM()) return

  try {
    window.localStorage.setItem(THEME_MODE_KEY, nextSnapshot.mode)
    if (nextSnapshot.customTheme) {
      window.localStorage.setItem(THEME_PRESET_KEY, nextSnapshot.customTheme)
      window.localStorage.setItem(LEGACY_THEME_KEY, nextSnapshot.customTheme)
    } else {
      window.localStorage.removeItem(THEME_PRESET_KEY)
      window.localStorage.setItem(LEGACY_THEME_KEY, nextSnapshot.mode)
    }
  } catch (_error) {
    // no-op
  }
}

function broadcastThemeState(nextSnapshot) {
  snapshot = nextSnapshot
  applyThemeToDocument(snapshot)
  listeners.forEach((listener) => listener())
}

function readStoredThemeState() {
  if (!canUseDOM()) {
    return snapshot
  }

  let storedMode = 'system'
  let storedPreset = ''

  try {
    const mode = window.localStorage.getItem(THEME_MODE_KEY)
    const preset = window.localStorage.getItem(THEME_PRESET_KEY)
    const legacy = window.localStorage.getItem(LEGACY_THEME_KEY)

    if (isValidMode(mode)) {
      storedMode = mode
    } else if (isValidMode(legacy)) {
      storedMode = legacy
    }

    if (preset && getThemeMeta(preset)) {
      storedPreset = preset
    } else if (legacy && legacy.startsWith('theme-') && getThemeMeta(legacy)) {
      storedPreset = legacy
    }
  } catch (_error) {
    // no-op
  }

  const theme = resolveTheme(storedMode, storedPreset)

  return {
    mode: storedMode,
    theme,
    customTheme: storedPreset,
  }
}

function syncThemeFromStorage() {
  const nextSnapshot = readStoredThemeState()
  broadcastThemeState(nextSnapshot)
}

function setupThemeListeners() {
  if (!canUseDOM() || initialized) return

  initialized = true
  applyAccessibilityToDocument()

  const media = window.matchMedia ? window.matchMedia(THEME_MEDIA_QUERY) : null

  const handleSystemThemeChange = () => {
    if (snapshot.mode !== 'system' || snapshot.customTheme) return
    const nextSnapshot = {
      ...snapshot,
      theme: resolveTheme(snapshot.mode, snapshot.customTheme),
    }
    broadcastThemeState(nextSnapshot)
  }

  const handleStorageChange = (event) => {
    if (event.key === ACCESSIBILITY_KEY) {
      applyAccessibilityToDocument()
      return
    }

    if (event.key === THEME_MODE_KEY || event.key === THEME_PRESET_KEY || event.key === LEGACY_THEME_KEY) {
      syncThemeFromStorage()
    }
  }

  if (media?.addEventListener) {
    media.addEventListener('change', handleSystemThemeChange)
  } else if (media?.addListener) {
    media.addListener(handleSystemThemeChange)
  }

  window.addEventListener('storage', handleStorageChange)
}

export function initTheme() {
  setupThemeListeners()
  const nextSnapshot = readStoredThemeState()
  broadcastThemeState(nextSnapshot)
  return nextSnapshot
}

export function getThemeSnapshot() {
  return snapshot
}

export function setThemeMode(mode) {
  if (!isValidMode(mode)) return snapshot.theme

  const nextSnapshot = {
    mode,
    customTheme: '',
    theme: resolveTheme(mode, ''),
  }

  persistThemeState(nextSnapshot)
  broadcastThemeState(nextSnapshot)
  return nextSnapshot.theme
}

export function setThemePreset(themeKey) {
  const preset = getThemeMeta(themeKey)
  if (!preset) return snapshot.theme

  const nextSnapshot = {
    mode: preset.scheme,
    customTheme: themeKey,
    theme: preset.scheme,
  }

  persistThemeState(nextSnapshot)
  broadcastThemeState(nextSnapshot)
  return nextSnapshot.theme
}

export function clearThemePreset() {
  return setThemeMode(snapshot.theme === 'dark' ? 'dark' : 'light')
}

export function toggleTheme() {
  if (snapshot.customTheme) {
    return setThemeMode(snapshot.theme === 'dark' ? 'light' : 'dark')
  }

  return setThemeMode(snapshot.theme === 'dark' ? 'light' : 'dark')
}

export function useTheme() {
  const themeSnapshot = useSyncExternalStore(
    (callback) => {
      listeners.add(callback)
      setupThemeListeners()
      return () => listeners.delete(callback)
    },
    () => snapshot,
    () => snapshot,
  )

  return {
    mode: themeSnapshot.mode,
    theme: themeSnapshot.theme,
    customTheme: themeSnapshot.customTheme,
    setMode: setThemeMode,
    setThemePreset,
    clearThemePreset,
    toggleTheme,
  }
}

if (canUseDOM()) {
  initTheme()
}

export default useTheme
