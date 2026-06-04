import supabase from './supabaseClient'

const DEFAULT_TIMEOUT_MS = 20000

function isAbortError(error) {
  return error?.name === 'AbortError'
}

function safeRequestLabel(input) {
  return typeof input === 'string' ? input : input?.url || 'request'
}

export async function getApiAuthHeaders() {
  if (typeof supabase.auth?.getSession !== 'function') return {}

  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch(input, init = {}) {
  const authHeaders = await getApiAuthHeaders()
  const timeoutMs = Number.isFinite(init.timeoutMs) ? init.timeoutMs : DEFAULT_TIMEOUT_MS
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null

  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...(init.headers || {}),
  }

  const timeoutId = controller
    ? window.setTimeout(() => controller.abort(), timeoutMs)
    : null

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller ? controller.signal : init.signal,
      headers,
    })

    if (!response.ok) {
      let message = `Request failed (${response.status})`

      try {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const data = await response.json()
          message = data?.error || data?.message || message
        }
      } catch (_error) {
        // no-op - fall back to generic message
      }

      throw new Error(message)
    }

    return response
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)} seconds`)
    }

    if (error instanceof Error && error.name !== 'TypeError') {
      throw error
    }

    if (typeof console !== 'undefined' && console.error) {
      console.error('API request failed', { request: safeRequestLabel(input) })
    }

    throw new Error('Network request failed. Please try again.')
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId)
  }
}

export async function apiJson(input, init = {}) {
  return apiFetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
}
