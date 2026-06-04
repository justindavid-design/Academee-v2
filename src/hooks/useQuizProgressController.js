/**
 * useQuizProgressController Hook
 * Manages quiz flow including question progression and feedback display
 */

import { useState, useCallback, useRef } from 'react'
import { normalizeQuestionWithFeedback } from '../schemas/quizFeedbackSchema'

/**
 * Main hook for managing quiz progression with feedback
 *
 * State includes:
 * - currentQuestionIndex: Which question we're on
 * - answers: Map of question index to selected answer index
 * - showingFeedback: Whether feedback panel is visible
 * - selectedAnswerIndex: The answer selected (before moving to feedback)
 * - quizComplete: Whether all questions answered
 *
 * Flow: Question → Answer selected → Show feedback → Continue → Next question → Results
 */
export function useQuizProgressController(questions = [], options = {}) {
  const {
    isPracticeMode = true,
    onQuestionChange = null,
    onAnswerSubmit = null,
    onQuizComplete = null,
  } = options

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showingFeedback, setShowingFeedback] = useState(false)
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null)
  const [quizComplete, setQuizComplete] = useState(false)

  // Track which questions have been viewed
  const viewedQuestionsRef = useRef(new Set())

  // Normalize questions on load
  const normalizedQuestions = questions.map((q, idx) =>
    normalizeQuestionWithFeedback(q, idx)
  )

  const currentQuestion = normalizedQuestions[currentQuestionIndex]
  const totalQuestions = normalizedQuestions.length
  const answeredCount = Object.keys(answers).length

  /**
   * Handle answer selection and submission
   * Transitions to feedback state
   */
  const submitAnswer = useCallback(
    (answerIndex) => {
      if (answerIndex === null || answerIndex === undefined) return

      // Store answer
      setSelectedAnswerIndex(answerIndex)
      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: answerIndex,
      }))

      // In practice mode, show feedback immediately
      if (isPracticeMode) {
        setShowingFeedback(true)
      }

      // Callback for external tracking
      onAnswerSubmit?.(
        currentQuestionIndex,
        answerIndex,
        answerIndex === currentQuestion.correct
      )
    },
    [currentQuestionIndex, currentQuestion.correct, isPracticeMode, onAnswerSubmit]
  )

  /**
   * Continue to next question
   * Hides feedback and advances
   */
  const continueToNext = useCallback(() => {
    setShowingFeedback(false)

    if (currentQuestionIndex < totalQuestions - 1) {
      // Not last question - go to next
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      viewedQuestionsRef.current.add(nextIndex)

      onQuestionChange?.(nextIndex, totalQuestions)
    } else {
      // Last question - quiz complete
      setQuizComplete(true)
      onQuizComplete?.(answers)
    }
  }, [currentQuestionIndex, totalQuestions, answers, onQuestionChange, onQuizComplete])

  /**
   * Go to specific question
   * Used for review or navigation
   */
  const goToQuestion = useCallback(
    (index) => {
      if (index < 0 || index >= totalQuestions) return

      setCurrentQuestionIndex(index)
      setShowingFeedback(false)
      viewedQuestionsRef.current.add(index)

      onQuestionChange?.(index, totalQuestions)
    },
    [totalQuestions, onQuestionChange]
  )

  /**
   * Update answer for a specific question
   * Used for review/editing
   */
  const updateAnswer = useCallback((questionIndex, answerIndex) => {
    if (questionIndex < 0) return

    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }))
  }, [])

  /**
   * Restart quiz
   */
  const restart = useCallback(() => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setShowingFeedback(false)
    setSelectedAnswerIndex(null)
    setQuizComplete(false)
    viewedQuestionsRef.current.clear()
  }, [])

  /**
   * Get state object
   */
  const state = {
    currentQuestionIndex,
    currentQuestion,
    totalQuestions,
    answers,
    answeredCount,
    selectedAnswerIndex,
    showingFeedback,
    quizComplete,
    isFirstQuestion: currentQuestionIndex === 0,
    isLastQuestion: currentQuestionIndex === totalQuestions - 1,
    progressPercentage: Math.round((answeredCount / totalQuestions) * 100),
    viewedQuestions: Array.from(viewedQuestionsRef.current),
  }

  /**
   * Get actions object
   */
  const actions = {
    submitAnswer,
    continueToNext,
    goToQuestion,
    updateAnswer,
    restart,
  }

  return {
    state,
    ...actions,
    // Flat access for backward compatibility
    ...state,
  }
}

export default useQuizProgressController
