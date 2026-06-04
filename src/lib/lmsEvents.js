const LMS_EVENT_NAME = 'academee:lms-sync'

function canUseDOM() {
  return typeof window !== 'undefined' && typeof window.dispatchEvent === 'function'
}

export function emitLmsEvent(detail = {}) {
  if (!canUseDOM()) return
  window.dispatchEvent(new CustomEvent(LMS_EVENT_NAME, { detail }))
}

export function subscribeLmsEvent(handler) {
  if (!canUseDOM() || typeof handler !== 'function') {
    return () => {}
  }

  const listener = (event) => handler(event.detail || {})
  window.addEventListener(LMS_EVENT_NAME, listener)
  return () => window.removeEventListener(LMS_EVENT_NAME, listener)
}

export function requestCourseRefresh(courseId, reason = 'refresh') {
  emitLmsEvent({ type: 'course-refresh', courseId, reason, timestamp: Date.now() })
}

export function requestSubmissionRefresh(assignmentId, userId = null, reason = 'refresh') {
  emitLmsEvent({ type: 'submission-refresh', assignmentId, userId, reason, timestamp: Date.now() })
}

