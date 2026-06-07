import { apiFetch } from './apiClient.js'
import { getApiErrorMessage, safeJson } from '../components/courses/utils.js'

export const quizService = {
  /**
   * Create a new quiz
   */
  async createQuiz(courseId, quizData, userId) {
    const questions = Array.isArray(quizData.questions) ? quizData.questions : []
    const res = await apiFetch(`/api/courses/${courseId}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: quizData.title.trim(),
        description: quizData.description.trim(),
        instructions: quizData.instructions?.trim() || '',
        due_at: quizData.due_at ? new Date(quizData.due_at).toISOString() : null,
        status: quizData.status,
        module_id: quizData.module_id || null,
        time_limit: quizData.time_limit ? Number(quizData.time_limit) : null,
        attempts_allowed: Number(quizData.attempts_allowed || 1),
        passing_score: Number(quizData.passing_score || 70),
        shuffleQuestions: Boolean(quizData.shuffleQuestions),
        shuffleAnswers: Boolean(quizData.shuffleAnswers),
        showCorrectAnswers: quizData.showCorrectAnswers !== false,
        autoGrading: quizData.autoGrading !== false,
        mode: quizData.mode || 'practice',
        questions,
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
    const payload = {
      ...updates,
      quiz_id: updates.quiz_id || updates.id || null,
      assignment_id: updates.assignment_id || updates.assignmentId || null,
      user_id: userId,
    }
    delete payload.id
    const res = await apiFetch(`/api/courses/${courseId}/quizzes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.attempts)) return data.attempts
    return []
  },

  /**
   * Get the user's latest attempt
   */
  getLatestAttempt(attempts, userId) {
    const matching = (Array.isArray(attempts) ? attempts : []).filter((attempt) =>
      String(attempt.user_id ?? attempt.student_id) === String(userId)
    )

    const sorted = matching.sort((a, b) => {
      const attemptA = Number(a.attempt_number || 0)
      const attemptB = Number(b.attempt_number || 0)
      if (attemptB !== attemptA) return attemptB - attemptA

      const timeA = new Date(a.submitted_at || a.updated_at || a.created_at || 0).getTime()
      const timeB = new Date(b.submitted_at || b.updated_at || b.created_at || 0).getTime()
      return timeB - timeA
    })

    return sorted[0] || null
  },
}
