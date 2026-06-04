import { apiFetch } from './apiClient'

async function jsonRequest(url, init = {}) {
  const res = await apiFetch(url, init)
  return res.json()
}

export function getIntelligenceStatus() {
  return jsonRequest('/api/intelligence/status')
}

export function askCourseTutor({ courseId, question }) {
  return jsonRequest('/api/intelligence/rag-query', {
    method: 'POST',
    body: JSON.stringify({ course_id: courseId, question }),
  })
}

export function requestGradingSuggestion(payload) {
  return jsonRequest('/api/intelligence/grading-suggest', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function adaptContentForLearner({ text, mode = 'plain-language', courseId = null }) {
  return jsonRequest('/api/intelligence/accessibility-adapt', {
    method: 'POST',
    body: JSON.stringify({ text, mode, course_id: courseId }),
  })
}

export function getInstitutionAnalytics(courseId = null) {
  const query = courseId ? `?course_id=${encodeURIComponent(courseId)}` : ''
  return jsonRequest(`/api/intelligence/analytics${query}`)
}

export function getMasteryProfile(courseId) {
  return jsonRequest(`/api/intelligence/mastery?course_id=${encodeURIComponent(courseId)}`)
}

export function getAdaptiveRecommendations(courseId) {
  return jsonRequest(`/api/intelligence/recommendations?course_id=${encodeURIComponent(courseId)}`)
}
