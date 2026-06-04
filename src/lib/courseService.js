import { apiFetch } from './apiClient.js'
import { getApiErrorMessage, safeJson } from '../components/courses/utils.js'

export const courseService = {
  /**
   * Fetch course details
   */
  async fetchCourse(courseId, userId) {
    const res = await apiFetch(`/api/courses/${courseId}?user_id=${encodeURIComponent(userId)}`)
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to load course details.'))
    return data
  },

  /**
   * Fetch modules for a course
   */
  async fetchModules(courseId, userId) {
    const res = await apiFetch(`/api/courses/${courseId}/modules?user_id=${encodeURIComponent(userId)}`)
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to load lessons.'))
    return Array.isArray(data) ? data : []
  },

  /**
   * Fetch assignments for a course
   */
  async fetchAssignments(courseId, userId) {
    const res = await apiFetch(`/api/courses/${courseId}/assignments?user_id=${encodeURIComponent(userId)}`)
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to load assignments.'))
    return Array.isArray(data) ? data : []
  },

  /**
   * Fetch quizzes for a course
   */
  async fetchQuizzes(courseId, userId) {
    const res = await apiFetch(`/api/courses/${courseId}/quizzes?user_id=${encodeURIComponent(userId)}`)
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to load quizzes.'))
    return Array.isArray(data) ? data : []
  },

  /**
   * Fetch notifications/announcements for a course
   */
  async fetchNotifications(courseId, userId, limit = 10) {
    const res = await apiFetch(`/api/notifications?user_id=${encodeURIComponent(userId)}&course_id=${encodeURIComponent(courseId)}&limit=${limit}`)
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to load announcements.'))
    return Array.isArray(data) ? data : []
  },

  /**
   * Load entire course workspace (all data in parallel)
   */
  async loadWorkspace(courseId, userId) {
    const [courseRes, modulesRes, assignmentsRes, quizzesRes, notificationsRes] = await Promise.all([
      this.fetchCourse(courseId, userId),
      this.fetchModules(courseId, userId),
      this.fetchAssignments(courseId, userId),
      this.fetchQuizzes(courseId, userId),
      this.fetchNotifications(courseId, userId),
    ])

    return {
      course: courseRes,
      modules: modulesRes,
      assignments: assignmentsRes,
      quizzes: quizzesRes,
      announcements: notificationsRes.filter(item => item.type === 'announcement'),
    }
  },

  /**
   * Create a new module
   */
  async createModule(courseId, moduleData, userId) {
    const res = await apiFetch(`/api/courses/${courseId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...moduleData,
        title: moduleData.title.trim(),
        description: moduleData.description.trim(),
        user_id: userId,
      }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to create lesson.'))
    return data
  },

  /**
   * Update an existing module
   */
  async updateModule(courseId, updates, userId) {
    const res = await apiFetch(`/api/courses/${courseId}/modules`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, user_id: userId }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to update lesson.'))
    return data
  },

  /**
   * Delete a module
   */
  async deleteModule(courseId, moduleId, userId) {
    const res = await apiFetch(`/api/courses/${courseId}/modules`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: moduleId, user_id: userId }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to delete lesson.'))
    return data
  },
}
