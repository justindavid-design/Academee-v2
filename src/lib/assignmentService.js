import { apiFetch } from './apiClient.js'
import { getApiErrorMessage, safeJson } from '../components/courses/utils.js'
import { enrichSubmission } from './submissionStatus.js'

export const assignmentService = {
  /**
   * Create a new assignment
   */
  async createAssignment(courseId, assignmentData, userId) {
    const res = await apiFetch(`/api/courses/${courseId}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...assignmentData,
        title: assignmentData.title.trim(),
        instructions: assignmentData.instructions.trim(),
        due_at: assignmentData.due_at ? new Date(assignmentData.due_at).toISOString() : null,
        module_id: assignmentData.module_id || null,
        user_id: userId,
      }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to create assignment.'))
    return data
  },

  /**
   * Update an existing assignment
   */
  async updateAssignment(courseId, updates, userId) {
    const res = await apiFetch(`/api/courses/${courseId}/assignments`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, user_id: userId }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to update assignment.'))
    return data
  },

  /**
   * Delete an assignment
   */
  async deleteAssignment(courseId, assignmentId, userId) {
    const res = await apiFetch(`/api/courses/${courseId}/assignments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: assignmentId, user_id: userId }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to delete assignment.'))
    return data
  },

  /**
   * Fetch submissions for an assignment
   */
  async fetchSubmissions(assignmentId, userId) {
    const res = await apiFetch(`/api/assignments/${assignmentId}/submissions?user_id=${encodeURIComponent(userId)}`)
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to load submitted work.'))
    return Array.isArray(data) ? data.map((submission) => enrichSubmission(submission)) : []
  },
}
