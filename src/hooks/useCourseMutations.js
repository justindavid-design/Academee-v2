import { useState, useCallback } from 'react'
import { courseService } from '../lib/courseService.js'
import { assignmentService } from '../lib/assignmentService.js'
import { quizService } from '../lib/quizService.js'
import { notificationService } from '../lib/notificationService.js'
import { toast } from '../lib/ToastProvider.jsx'

/**
 * Hook to manage course mutations (create, update, delete)
 * Consolidates all mutation logic in one place
 */
export function useCourseMutations(courseId, userId, onSuccess = () => {}) {
  const [isLoading, setIsLoading] = useState(false)

  const createModule = useCallback(async (moduleData) => {
    setIsLoading(true)
    try {
      const result = await courseService.createModule(courseId, moduleData, userId)
      toast.success('Lesson created', 'Your lesson has been added to the course')
      onSuccess()
      return result
    } catch (err) {
      console.error('Failed to create module:', err)
      toast.error('Failed to create lesson', err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [courseId, userId, onSuccess])

  const updateModule = useCallback(async (moduleUpdates) => {
    setIsLoading(true)
    try {
      const result = await courseService.updateModule(courseId, moduleUpdates, userId)
      toast.success('Lesson updated', 'Your lesson has been saved successfully')
      onSuccess()
      return result
    } catch (err) {
      console.error('Failed to update module:', err)
      toast.error('Failed to update lesson', err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [courseId, userId, onSuccess])

  const deleteModule = useCallback(async (moduleId) => {
    setIsLoading(true)
    try {
      await courseService.deleteModule(courseId, moduleId, userId)
      toast.success('Lesson deleted', 'The lesson has been removed')
      onSuccess()
    } catch (err) {
      console.error('Failed to delete module:', err)
      toast.error('Failed to delete lesson', err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [courseId, userId, onSuccess])

  const createAssignment = useCallback(async (assignmentData) => {
    setIsLoading(true)
    try {
      const result = await assignmentService.createAssignment(courseId, assignmentData, userId)
      toast.success('Assignment created', 'Your assignment has been added to the course')
      onSuccess()
      return result
    } catch (err) {
      console.error('Failed to create assignment:', err)
      toast.error('Failed to create assignment', err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [courseId, userId, onSuccess])

  const updateAssignment = useCallback(async (assignmentUpdates) => {
    setIsLoading(true)
    try {
      const result = await assignmentService.updateAssignment(courseId, assignmentUpdates, userId)
      toast.success('Assignment updated', 'Your assignment has been saved successfully')
      onSuccess()
      return result
    } catch (err) {
      console.error('Failed to update assignment:', err)
      toast.error('Failed to update assignment', err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [courseId, userId, onSuccess])

  const deleteAssignment = useCallback(async (assignmentId) => {
    setIsLoading(true)
    try {
      await assignmentService.deleteAssignment(courseId, assignmentId, userId)
      toast.success('Assignment deleted', 'The assignment has been removed')
      onSuccess()
    } catch (err) {
      console.error('Failed to delete assignment:', err)
      toast.error('Failed to delete assignment', err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [courseId, userId, onSuccess])

  const createQuiz = useCallback(async (quizData) => {
    setIsLoading(true)
    try {
      const result = await quizService.createQuiz(courseId, quizData, userId)
      toast.success('Quiz created', 'Your quiz has been added to the course')
      onSuccess()
      return result
    } catch (err) {
      console.error('Failed to create quiz:', err)
      toast.error('Failed to create quiz', err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [courseId, userId, onSuccess])

  const updateQuiz = useCallback(async (quizUpdates) => {
    setIsLoading(true)
    try {
      const result = await quizService.updateQuiz(courseId, quizUpdates, userId)
      toast.success('Quiz updated', 'Your quiz has been saved successfully')
      onSuccess()
      return result
    } catch (err) {
      console.error('Failed to update quiz:', err)
      toast.error('Failed to update quiz', err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [courseId, userId, onSuccess])

  const deleteQuiz = useCallback(async (quizId, assignmentId) => {
    setIsLoading(true)
    try {
      await quizService.deleteQuiz(courseId, quizId, assignmentId, userId)
      toast.success('Quiz deleted', 'The quiz has been removed')
      onSuccess()
    } catch (err) {
      console.error('Failed to delete quiz:', err)
      toast.error('Failed to delete quiz', err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [courseId, userId, onSuccess])

  const createAnnouncement = useCallback(async (announcementData) => {
    setIsLoading(true)
    try {
      const result = await notificationService.createNotification(
        { ...announcementData, course_id: courseId, type: 'announcement' },
        userId
      )
      toast.success('Announcement posted', 'Your announcement has been sent to the class')
      onSuccess()
      return result
    } catch (err) {
      console.error('Failed to create announcement:', err)
      toast.error('Failed to create announcement', err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [courseId, userId, onSuccess])

  const deleteAnnouncement = useCallback(async (announcementId) => {
    setIsLoading(true)
    try {
      await notificationService.deleteNotification(announcementId, userId)
      toast.success('Announcement deleted', 'The announcement has been removed')
      onSuccess()
    } catch (err) {
      console.error('Failed to delete announcement:', err)
      toast.error('Failed to delete announcement', err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [courseId, userId, onSuccess])

  return {
    isLoading,
    createModule,
    updateModule,
    deleteModule,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    createAnnouncement,
    deleteAnnouncement,
  }
}
