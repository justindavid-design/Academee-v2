import { useState, useCallback, useRef } from 'react'
import { enrichSubmission } from '../lib/submissionStatus.js'
import { emitLmsEvent, requestSubmissionRefresh } from '../lib/lmsEvents.js'

/**
 * Hook for managing submission state and synchronization
 * Handles optimistic updates, error recovery, and state sync
 */
export function useSubmissionState(initialSubmission, assignmentId) {
  const [submission, setSubmission] = useState(initialSubmission)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const refreshTimeoutRef = useRef(null)

  // Clear error after 5 seconds
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Submit work
  const handleSubmit = useCallback(
    async (files, content = null) => {
      setIsLoading(true)
      setError(null)

      try {
        const formData = new FormData()
        if (files && files.length > 0) {
          files.forEach((file) => {
            formData.append('files', file)
          })
        }
        if (content) {
          formData.append('content', JSON.stringify(content))
        }

        // POST to the assignment submissions endpoint
        const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to submit work')
        }

        const data = await response.json()


        // Optimistic update - server returns computed status
        const nextSubmission = enrichSubmission(data)
        setSubmission(nextSubmission)
        emitLmsEvent({
          type: 'submission-updated',
          action: 'submit',
          assignmentId,
          submission: nextSubmission,
          timestamp: Date.now(),
        })
        requestSubmissionRefresh(assignmentId, null, 'submit')

        return nextSubmission
      } catch (err) {
        setError(err.message || 'Failed to submit work')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [assignmentId]
  )

  // Unsubmit work
  const handleUnsubmit = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Optimistic update to draft
      const previousSubmission = submission
      setSubmission({
        ...submission,
        status: 'draft',
        submitted_at: null,
      })

      if (!submission || !submission.id) {
        throw new Error('No submission to unsubmit')
      }

      const response = await fetch(`/api/submissions/${submission.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        // Revert optimistic update
        setSubmission(previousSubmission)
        throw new Error('Failed to unsubmit work')
      }

      const data = await response.json()

      const nextSubmission = enrichSubmission(data)
      setSubmission(nextSubmission)
      emitLmsEvent({
        type: 'submission-updated',
        action: 'unsubmit',
        assignmentId,
        submission: nextSubmission,
        timestamp: Date.now(),
      })
      requestSubmissionRefresh(assignmentId, null, 'unsubmit')

      return nextSubmission
    } catch (err) {
      setError(err.message || 'Failed to unsubmit work')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [submission, assignmentId])

  // Refresh submission state from server
  const refreshSubmission = useCallback(async () => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        // API returns an array of submissions (teachers see many, students see their own)
        const first = Array.isArray(data) && data.length > 0 ? enrichSubmission(data[0]) : null
        setSubmission(first)
        return first
      }
    } catch (err) {
      console.error('Failed to refresh submission:', err)
    }
  }, [assignmentId])

  // Schedule refresh (debounced)
  const scheduleRefresh = useCallback(
    (delay = 1000) => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      refreshTimeoutRef.current = setTimeout(refreshSubmission, delay)
    },
    [refreshSubmission]
  )

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }
  }, [])

  return {
    submission,
    isLoading,
    error,
    clearError,
    handleSubmit,
    handleUnsubmit,
    refreshSubmission,
    scheduleRefresh,
    cleanup,
  }
}

export default useSubmissionState
