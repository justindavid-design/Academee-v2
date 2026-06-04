import { apiFetch } from './apiClient.js'
import { getApiErrorMessage, safeJson } from '../components/courses/utils.js'
import { serializeContentWithAttachments } from './fileUtils.js'

export const notificationService = {
  /**
   * Create a new announcement/notification
   */
  async createNotification(notificationData, userId) {
    const res = await apiFetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actor_user_id: userId,
        user_id: userId,
        course_id: notificationData.course_id,
        type: notificationData.type || 'announcement',
        title: notificationData.title.trim(),
        body: notificationData.body || serializeContentWithAttachments(notificationData.body, notificationData.attachments),
      }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to post announcement.'))
    return data
  },

  /**
   * Delete a notification/announcement
   */
  async deleteNotification(notificationId, userId) {
    const res = await apiFetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: notificationId, user_id: userId }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to delete announcement.'))
    return data
  },

  /**
   * Fetch notifications for a course
   */
  async fetchNotifications(userId, courseId, limit = 10) {
    const res = await apiFetch(`/api/notifications?user_id=${encodeURIComponent(userId)}&course_id=${encodeURIComponent(courseId)}&limit=${limit}`)
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to load notifications.'))
    return Array.isArray(data) ? data : []
  },
}
