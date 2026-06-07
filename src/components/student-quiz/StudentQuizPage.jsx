import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../lib/AuthProvider'
import { apiFetch } from '../../lib/apiClient'
import { QuizPlayer } from '../student-quiz'
import { recordQuizAttempt } from '../../lib/quizAnalytics'

/**
 * StudentQuizPage - Fullscreen quiz-taking page
 * Loads quiz data and renders the QuizPlayer component
 * Handles quiz submission and navigation
 */
export default function StudentQuizPage() {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true)
        const res = await apiFetch(
          `/api/courses/${courseId}/quizzes/${quizId}`
        )

        if (!res.ok) {
          throw new Error('Failed to load quiz')
        }

        const data = await res.json()
        setQuiz(data)
      } catch (err) {
        console.error('Error loading quiz:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (courseId && quizId && user?.id) {
      loadQuiz()
    }
  }, [courseId, quizId, user?.id])

  // Handle quiz submission
  const handleQuizSubmit = async (result) => {
    try {
      // Submit attempt to backend
      const res = await apiFetch(
        `/api/courses/${courseId}/quizzes/${quizId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({
            answers: result.answers,
            score: result.score,
            total: result.total,
            percentage: result.percentage,
            analytics: result.analytics,
            masteryByConcept: result.masteryByConcept,
            adaptiveInsights: result.adaptiveInsights,
            mode: result.mode,
          }),
        }
      )

      if (!res.ok) {
        throw new Error('Failed to submit quiz')
      }

      // Redirect to results or course
      recordQuizAttempt({
        quizId,
        quizTitle: quiz?.title || 'Quiz',
        userId: user.id,
        userName: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email || 'Student',
        score: result.score,
        total: result.total,
        percentage: result.percentage,
        answers: result.answers,
        analytics: result.analytics,
        masteryByConcept: result.masteryByConcept,
        adaptiveInsights: result.adaptiveInsights,
        timestamp: result.timestamp,
        mode: quiz?.meta?.mode || quiz?.meta?.settings?.mode || quiz?.mode || 'practice',
      })

      setTimeout(() => {
        navigate(`/courses/${courseId}`)
      }, 2000)
    } catch (err) {
      console.error('Error submitting quiz:', err)
    }
  }

  // Handle exit
  const handleExit = () => {
    navigate(`/courses/${courseId}`)
  }

  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-50 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md">
          <p className="text-red-700 font-semibold mb-4">Error Loading Quiz</p>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={handleExit}
            className="w-full px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
          >
            Return to Course
          </button>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="w-full h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Quiz not found</p>
      </div>
    )
  }

  return (
    <QuizPlayer
      quiz={quiz}
      onSubmit={handleQuizSubmit}
      onExit={handleExit}
    />
  )
}
