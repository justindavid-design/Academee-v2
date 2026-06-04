function canUseDOM() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function getImportMetaEnv() {
  return typeof import.meta !== 'undefined' ? import.meta.env || {} : {}
}

function normalizeBaseUrl(value = '') {
  return String(value || '').trim().replace(/\/$/, '')
}

export function getPublicEnvValue(key) {
  const env = getImportMetaEnv()
  return typeof env[key] === 'string' ? env[key].trim() : ''
}

export function getMissingPublicEnv(keys = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']) {
  return keys.filter((key) => !getPublicEnvValue(key))
}

export function getMissingPublicEnvError(keys = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']) {
  const missing = getMissingPublicEnv(keys)
  if (!missing.length) return ''
  return `Missing required environment variable${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}`
}

export function getApiBaseUrl() {
  const configured = normalizeBaseUrl(getPublicEnvValue('VITE_API_BASE_URL'))
  if (configured) return configured

  if (!canUseDOM()) return ''

  const { hostname } = window.location
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8787'
  }

  return ''
}

export function formatMissingServerEnv(keys = []) {
  const unique = [...new Set(keys.filter(Boolean))]
  if (!unique.length) return ''
  return `Missing required server environment variable${unique.length === 1 ? '' : 's'}: ${unique.join(', ')}`
}
