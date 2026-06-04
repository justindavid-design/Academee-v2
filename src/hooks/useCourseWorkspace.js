import { useEffect, useState, useCallback } from 'react'
import { courseService } from '../lib/courseService.js'
import { toast } from '../lib/ToastProvider.jsx'

/**
 * Hook to manage course workspace loading and caching
 * Handles loading course, modules, assignments, quizzes, and announcements in parallel
 */
export function useCourseWorkspace(courseId, userId) {
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [assignments, setAssignments] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadWorkspace = useCallback(async () => {
    if (!courseId || !userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await courseService.loadWorkspace(courseId, userId)
      setCourse(data.course)
      setModules(data.modules)
      setAssignments(data.assignments)
      setQuizzes(data.quizzes)
      setAnnouncements(data.announcements)
    } catch (err) {
      console.error('Failed to load course workspace:', err)
      setError(err.message)
      toast.error('Failed to load course', err.message)
    } finally {
      setLoading(false)
    }
  }, [courseId, userId])

  const refresh = useCallback(() => loadWorkspace(), [loadWorkspace])

  useEffect(() => {
    loadWorkspace()
  }, [loadWorkspace])

  return {
    course,
    setCourse,
    modules,
    setModules,
    assignments,
    setAssignments,
    quizzes,
    setQuizzes,
    announcements,
    setAnnouncements,
    loading,
    error,
    refresh,
  }
}
