import { useState, useCallback } from 'react'
import { submissionService } from '../lib/submissionService.js'
import { assignmentService } from '../lib/assignmentService.js'
import { quizService } from '../lib/quizService.js'
import { toast } from '../lib/ToastProvider.jsx'

/**
 * Hook to manage grading operations and student grades
 * Handles loading student grades, grading submissions, and managing drafts
 */
export function useGradeManager(courseId, userId) {
  const [studentGrades, setStudentGrades] = useState([])
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [gradingDrafts, setGradingDrafts] = useState({})

  const loadStudentGrades = useCallback(async () => {
    setLoadingGrades(true)
    try {
      // Get all assignments for the course
      const assignments = await assignmentService.fetchSubmissions(courseId, userId)
      const gradesData = []

      // Fetch submissions for each assignment
      for (const assignment of assignments) {
        try {
          const submissions = await assignmentService.fetchSubmissions(assignment.id, userId)
          const userSubmission = submissions.find((sub) => String(sub.user_id) === String(userId))

          gradesData.push({
            id: assignment.id,
            type: 'assignment',
            title: assignment.title,
            instructions: assignment.instructions,
            dueAt: assignment.due_at,
            submission: userSubmission || null,
            createdAt: assignment.created_at,
          })
        } catch (err) {
          console.error(`Failed to load submissions for assignment ${assignment.id}:`, err)
        }
      }

      // Get all quizzes for the course
      const quizzes = await quizService.fetchAttempts(courseId, userId)

      // Fetch attempts for each quiz
      for (const quiz of quizzes) {
        try {
          const attempts = await quizService.fetchAttempts(quiz.id, userId)
          const userAttempt = quizService.getLatestAttempt(attempts, userId)

          gradesData.push({
            id: quiz.id,
            type: 'quiz',
            title: quiz.title,
            description: quiz.description,
            dueAt: quiz.due_at,
            submission: userAttempt || null,
            createdAt: quiz.created_at,
          })
        } catch (err) {
          console.error(`Failed to load attempts for quiz ${quiz.id}:`, err)
        }
      }

      // Sort by due date descending
      gradesData.sort((a, b) => {
        const dateA = new Date(a.dueAt || 0)
        const dateB = new Date(b.dueAt || 0)
        return dateB - dateA
      })

      setStudentGrades(gradesData)
    } catch (err) {
      console.error('Failed to load grades:', err)
      toast.error('Failed to load grades', err.message)
    } finally {
      setLoadingGrades(false)
    }
  }, [courseId, userId])

  const updateGradingDraft = useCallback((submissionId, updates) => {
    setGradingDrafts((current) => ({
      ...current,
      [submissionId]: {
        ...(current[submissionId] || {}),
        ...updates,
      },
    }))
  }, [])

  const gradeSubmission = useCallback(async (submissionId, assignmentId) => {
    try {
      const draft = gradingDrafts[submissionId] || {}
      const result = await submissionService.gradeSubmission(submissionId, draft, userId)
      setGradingDrafts((current) => ({ ...current, [submissionId]: { score: '', feedback: '' } }))
      toast.success('Grade saved', 'The submission has been graded')
      return result
    } catch (err) {
      console.error('Failed to grade submission:', err)
      toast.error('Failed to save grade', err.message)
      throw err
    }
  }, [userId, gradingDrafts])

  const clearGradingDraft = useCallback((submissionId) => {
    setGradingDrafts((current) => {
      const next = { ...current }
      delete next[submissionId]
      return next
    })
  }, [])

  return {
    studentGrades,
    loadingGrades,
    gradingDrafts,
    loadStudentGrades,
    updateGradingDraft,
    gradeSubmission,
    clearGradingDraft,
  }
}
