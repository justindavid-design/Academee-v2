import { useState, useCallback } from 'react'
import { assignmentService } from '../lib/assignmentService.js'
import { toast } from '../lib/ToastProvider.jsx'

/**
 * Hook to manage assignment submissions loading and caching
 * Handles loading submissions for assignments with draft management
 */
export function useAssignmentSubmissions(userId) {
  const [submissionLists, setSubmissionLists] = useState({})
  const [loadingSubmissions, setLoadingSubmissions] = useState({})

  const loadSubmissions = useCallback(async (assignmentId) => {
    setLoadingSubmissions((current) => ({ ...current, [assignmentId]: true }))
    try {
      const submissions = await assignmentService.fetchSubmissions(assignmentId, userId)
      setSubmissionLists((current) => ({ ...current, [assignmentId]: submissions }))
      return submissions
    } catch (err) {
      console.error(`Failed to load submissions for assignment ${assignmentId}:`, err)
      toast.error('Failed to load submissions', err.message)
      throw err
    } finally {
      setLoadingSubmissions((current) => ({ ...current, [assignmentId]: false }))
    }
  }, [userId])

  const refreshSubmissions = useCallback(async (assignmentId) => {
    return loadSubmissions(assignmentId)
  }, [loadSubmissions])

  const clearSubmissions = useCallback((assignmentId) => {
    setSubmissionLists((current) => {
      const next = { ...current }
      delete next[assignmentId]
      return next
    })
  }, [])

  return {
    submissionLists,
    loadingSubmissions,
    loadSubmissions,
    refreshSubmissions,
    clearSubmissions,
  }
}
