import { useState, useCallback } from 'react'
import { submissionService } from '../lib/submissionService.js'
import { uploadFiles, serializeContentWithAttachments } from '../lib/fileUtils.js'
import { toast } from '../lib/ToastProvider.jsx'
import { emitLmsEvent } from '../lib/lmsEvents.js'

/**
 * Hook to manage student work submissions
 * Handles submitting work, managing drafts, and tracking submission status
 */
export function useStudentSubmission(userId) {
  const [submissionDrafts, setSubmissionDrafts] = useState({})
  const [isSubmitting, setIsSubmitting] = useState({})

  const updateDraft = useCallback((assignmentId, content) => {
    setSubmissionDrafts((current) => ({
      ...current,
      [assignmentId]: content,
    }))
  }, [])

  const clearDraft = useCallback((assignmentId) => {
    setSubmissionDrafts((current) => {
      const next = { ...current }
      delete next[assignmentId]
      return next
    })
  }, [])

  const submitWork = useCallback(async (assignmentId, contentOverride = null) => {
    setIsSubmitting((current) => ({ ...current, [assignmentId]: true }))
    try {
      const contentValue = contentOverride ?? (submissionDrafts[assignmentId] || '')

      // Handle file uploads
      const uploadedSubmissionFiles = typeof contentValue === 'object' && Array.isArray(contentValue.files)
        ? await uploadFiles(contentValue.files.filter((file) => typeof File !== 'undefined' && file instanceof File))
        : []
      const existingSubmissionFiles = typeof contentValue === 'object' && Array.isArray(contentValue.files)
        ? contentValue.files.filter((file) => !(typeof File !== 'undefined' && file instanceof File))
        : []

      // Serialize content with attachments
      const serializedContent = typeof contentValue === 'string'
        ? contentValue.trim()
        : serializeContentWithAttachments(contentValue.note || contentValue.text || '', [...existingSubmissionFiles, ...uploadedSubmissionFiles], {
            submittedAt: new Date().toISOString(),
          })

      // Submit work
      const result = await submissionService.submitWork(assignmentId, serializedContent, userId)

      // Clear draft on success
      clearDraft(assignmentId)
      toast.success('Work submitted', 'Your submission has been sent to your teacher')
      emitLmsEvent({
        type: 'submission-updated',
        action: 'submit',
        assignmentId,
        submission: result,
        timestamp: Date.now(),
      })

      return result
    } catch (err) {
      console.error('Failed to submit work:', err)
      toast.error('Failed to submit work', err.message)
      throw err
    } finally {
      setIsSubmitting((current) => ({ ...current, [assignmentId]: false }))
    }
  }, [userId, submissionDrafts, clearDraft])

  const unsubmitWork = useCallback(async (submissionId) => {
    setIsSubmitting((current) => ({ ...current, [submissionId]: true }))
    try {
      const result = await submissionService.unsubmitWork(submissionId, userId)
      toast.success('Submission withdrawn', 'You can now edit and resubmit your work')
      emitLmsEvent({
        type: 'submission-updated',
        action: 'unsubmit',
        submissionId,
        submission: result,
        timestamp: Date.now(),
      })
      return result
    } catch (err) {
      console.error('Failed to unsubmit work:', err)
      toast.error('Failed to unsubmit work', err.message)
      throw err
    } finally {
      setIsSubmitting((current) => ({ ...current, [submissionId]: false }))
    }
  }, [userId])

  return {
    submissionDrafts,
    isSubmitting,
    updateDraft,
    clearDraft,
    submitWork,
    unsubmitWork,
  }
}
