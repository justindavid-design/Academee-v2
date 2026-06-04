import { apiFetch } from './apiClient.js'
import { getApiErrorMessage, safeJson } from '../components/courses/utils.js'

export const quizService = {
  /**
   * Create a new quiz
   */
  async createQuiz(courseId, quizData, userId) {
    const res = await apiFetch(`/api/courses/${courseId}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: quizData.title.trim(),
        description: quizData.description.trim(),
        due_at: quizData.due_at ? new Date(quizData.due_at).toISOString() : null,
        status: quizData.status,
        questions: quizData.questions,
        user_id: userId,
      }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to create quiz.'))
    return data
  },

  /**
   * Update an existing quiz
   */
  async updateQuiz(courseId, updates, userId) {
    const res = await apiFetch(`/api/courses/${courseId}/quizzes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, user_id: userId }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to update quiz.'))
    return data
  },

  /**
   * Delete a quiz
   */
  async deleteQuiz(courseId, quizId, assignmentId, userId) {
    const res = await apiFetch(`/api/courses/${courseId}/quizzes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id: quizId, assignment_id: assignmentId, user_id: userId }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to delete quiz.'))
    return data
  },

  /**
   * Fetch quiz attempts for a user
   */
  async fetchAttempts(quizId, userId) {
    const res = await apiFetch(`/api/quizzes/${quizId}/attempts?user_id=${encodeURIComponent(userId)}`)
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to load quiz attempts.'))
    return Array.isArray(data) ? data : []
  },

  /**
   * Get the user's latest attempt
   */
  getLatestAttempt(attempts, userId) {
    return attempts.find(attempt => String(attempt.user_id) === String(userId))
  },
}
