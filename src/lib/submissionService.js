import { apiFetch } from './apiClient.js'
import { getApiErrorMessage, safeJson } from '../components/courses/utils.js'
import {
  enrichSubmission,
  getSubmissionStatus,
  isSubmissionLate,
} from './submissionStatus.js'
import {
  emitLmsEvent,
  requestCourseRefresh,
  requestSubmissionRefresh,
} from './lmsEvents.js'

export const submissionService = {
  /**
   * Submit work for an assignment
   */
  async submitWork(assignmentId, content, userId) {
    if (!content || (typeof content === 'string' && !content.trim())) {
      throw new Error('Please add a response before submitting.')
    }

    const res = await apiFetch(`/api/assignments/${assignmentId}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, content }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to submit work.'))
    const submission = enrichSubmission(data)
    emitLmsEvent({
      type: 'submission-updated',
      action: 'submit',
      assignmentId,
      userId,
      submission,
      timestamp: Date.now(),
    })
    requestSubmissionRefresh(assignmentId, userId, 'submit')
    requestCourseRefresh(data?.course_id || data?.assignment?.course_id || null, 'submit')
    return submission
  },

  /**
   * Unsubmit work for an assignment
   */
  async unsubmitWork(submissionId, userId) {
    const res = await apiFetch(`/api/submissions/${submissionId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to unsubmit work.'))
    const submission = enrichSubmission(data)
    emitLmsEvent({
      type: 'submission-updated',
      action: 'unsubmit',
      submissionId,
      userId,
      submission,
      timestamp: Date.now(),
    })
    requestSubmissionRefresh(data?.assignment_id || null, userId, 'unsubmit')
    requestCourseRefresh(data?.assignment?.course_id || null, 'unsubmit')
    return submission
  },

  /**
   * Grade a submission
   */
  async gradeSubmission(submissionId, gradingData, userId) {
    const res = await apiFetch(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        score: gradingData.score,
        feedback: gradingData.feedback,
        status: gradingData.status || 'graded',
      }),
    })
    const data = await safeJson(res)
    if (!res.ok) throw new Error(getApiErrorMessage(data, 'Unable to save grade.'))
    const submission = enrichSubmission(data)
    emitLmsEvent({
      type: 'submission-updated',
      action: 'grade',
      submissionId,
      userId,
      submission,
      timestamp: Date.now(),
    })
    requestSubmissionRefresh(data?.assignment_id || null, userId, 'grade')
    requestCourseRefresh(data?.assignment?.course_id || null, 'grade')
    return submission
  },

  /**
   * Get submission status
   */
  getSubmissionStatus(submission) {
    return getSubmissionStatus(submission)
  },

  /**
   * Check if submission is late
   */
  isLate(submission, dueDate) {
    return isSubmissionLate(submission, dueDate)
  },
}
