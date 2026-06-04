/**
 * INTEGRATION EXAMPLE
 * How to integrate Adaptive Quiz Feedback System into QuizPlayer
 * Copy patterns from this file to integrate into your existing quiz components
 */

import React, { useState } from 'react'
import { useQuizProgressController } from '../hooks/useQuizProgressController'
import QuizFeedbackPanel from './QuizFeedbackPanel'
import QuestionCard from './QuestionCard'
import QuizResults from './QuizResults'

/**
 * EXAMPLE 1: Basic Integration (Recommended)
 * 
 * Simple integration with feedback between questions
 * Copy this pattern to your QuizPlayer component
 */
export function QuizPlayerWithFeedback({ quiz, onSubmit }) {
  const questions = quiz.meta?.questions || []

  const controller = useQuizProgressController(questions, {
    isPracticeMode: true,
    onAnswerSubmit: (questionIdx, answerIdx, isCorrect) => {
      console.log(`Question ${questionIdx}: ${isCorrect ? 'Correct' : 'Incorrect'}`)
    },
    onQuizComplete: (answers) => {
      console.log('Quiz complete, submitting...')
      handleQuizSubmit(answers)
    },
  })

  const handleAnswerSelect = (answerIndex) => {
    // Record the answer and show feedback
    controller.submitAnswer(answerIndex)
  }

  const handleContinueClick = () => {
    // Hide feedback and move to next question or results
    controller.continueToNext()
  }

  const handleQuizSubmit = (answers) => {
    const submission = {
      answers: Object.values(answers),
      score: calculateScore(questions, answers),
      total: questions.length,
      feedback: 'Quiz completed with adaptive feedback',
    }
    onSubmit(submission)
  }

  // Calculate score
  const calculateScore = (questions, answers) => {
    return questions.reduce((score, question, idx) => {
      return answers[idx] === question.correct ? score + 1 : score
    }, 0)
  }

  // RENDER
  if (controller.quizComplete) {
    return (
      <QuizResults
        score={calculateScore(questions, controller.answers)}
        total={questions.length}
        onRestart={() => controller.restart()}
      />
    )
  }

  return (
    <div className='w-full max-w-3xl mx-auto'>
      {/* Progress indicator */}
      <div className='mb-6 bg-gray-100 rounded-lg p-4 dark:bg-gray-800'>
        <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
          Question {controller.currentQuestionIndex + 1} of {controller.totalQuestions}
        </p>
        <div className='mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700'>
          <div
            className='bg-blue-600 h-2 rounded-full transition-all duration-300'
            style={{ width: `${controller.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Show question OR feedback */}
      {!controller.showingFeedback && (
        <QuestionCard
          key={controller.currentQuestionIndex}
          question={controller.currentQuestion}
          onAnswer={handleAnswerSelect}
          questionNumber={controller.currentQuestionIndex + 1}
        />
      )}

      {controller.showingFeedback && (
        <QuizFeedbackPanel
          question={controller.currentQuestion}
          selectedAnswerIndex={controller.selectedAnswerIndex}
          onContinue={handleContinueClick}
          isPracticeMode={true}
        />
      )}
    </div>
  )
}

/**
 * EXAMPLE 2: With Quiz Modes
 * 
 * Supports Practice and Exam modes with different feedback behavior
 */
export function QuizPlayerWithModes({ quiz, mode = 'practice', onSubmit }) {
  const isPracticeMode = mode === 'practice'
  const questions = quiz.meta?.questions || []

  const controller = useQuizProgressController(questions, {
    isPracticeMode,
  })

  const handleAnswerSelect = (answerIndex) => {
    controller.submitAnswer(answerIndex)
  }

  const handleContinueClick = () => {
    controller.continueToNext()
  }

  if (controller.quizComplete) {
    return <QuizResults score={getScore(questions, controller.answers)} />
  }

  return (
    <div>
      {!controller.showingFeedback ? (
        <QuestionCard
          question={controller.currentQuestion}
          onAnswer={handleAnswerSelect}
          showFeedbackHint={isPracticeMode}
        />
      ) : (
        // In practice mode, show feedback immediately
        isPracticeMode && (
          <QuizFeedbackPanel
            question={controller.currentQuestion}
            selectedAnswerIndex={controller.selectedAnswerIndex}
            onContinue={handleContinueClick}
            isPracticeMode={true}
          />
        )
      )}
    </div>
  )
}

/**
 * EXAMPLE 3: With Analytics
 * 
 * Track student performance and learning
 */
export function QuizPlayerWithAnalytics({ quiz, onSubmit }) {
  const questions = quiz.meta?.questions || []
  const [analytics, setAnalytics] = useState({
    totalTime: 0,
    answersPerQuestion: {},
    correctCount: 0,
    conceptsLearned: new Set(),
  })

  const startTime = React.useRef(Date.now())

  const controller = useQuizProgressController(questions, {
    isPracticeMode: true,
    onAnswerSubmit: (questionIdx, answerIdx, isCorrect) => {
      // Track answer
      setAnalytics((prev) => ({
        ...prev,
        answersPerQuestion: {
          ...prev.answersPerQuestion,
          [questionIdx]: answerIdx,
        },
        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
      }))
    },
    onQuizComplete: (answers) => {
      // Final analytics
      const elapsedTime = Date.now() - startTime.current
      console.log(`Quiz completed in ${elapsedTime}ms`)

      handleQuizSubmit(answers, {
        ...analytics,
        totalTime: elapsedTime,
      })
    },
  })

  const handleQuizSubmit = (answers, analyticsData) => {
    // Send to backend with analytics
    onSubmit({
      answers: Object.values(answers),
      score: getScore(questions, answers),
      total: questions.length,
      analytics: analyticsData,
    })
  }

  if (controller.quizComplete) {
    return (
      <div>
        <QuizResults
          score={analytics.correctCount}
          total={questions.length}
          timeSpent={analytics.totalTime}
        />
      </div>
    )
  }

  return (
    <div>
      {!controller.showingFeedback ? (
        <QuestionCard
          question={controller.currentQuestion}
          onAnswer={(idx) => controller.submitAnswer(idx)}
        />
      ) : (
        <QuizFeedbackPanel
          question={controller.currentQuestion}
          selectedAnswerIndex={controller.selectedAnswerIndex}
          onContinue={() => controller.continueToNext()}
        />
      )}
    </div>
  )
}

/**
 * EXAMPLE 4: With AI Feedback (Future)
 * 
 * Enable AI-generated explanations when service is ready
 */
export function QuizPlayerWithAI({ quiz, enableAI = false, onSubmit }) {
  const questions = quiz.meta?.questions || []
  const { useAIFeedback } = require('../hooks/useAIFeedback')
  const aiHelper = useAIFeedback({
    enabled: enableAI,
    onError: (error) => console.error('AI failed, using fallback:', error),
  })

  const controller = useQuizProgressController(questions, {
    isPracticeMode: true,
  })

  React.useEffect(() => {
    // Pre-generate AI feedback for current question
    if (enableAI && controller.showingFeedback) {
      aiHelper.requestFeedback(controller.currentQuestion, controller.selectedAnswerIndex)
    }
  }, [controller.showingFeedback])

  if (controller.quizComplete) {
    return <QuizResults score={getScore(questions, controller.answers)} />
  }

  return (
    <div>
      {!controller.showingFeedback ? (
        <QuestionCard
          question={controller.currentQuestion}
          onAnswer={(idx) => controller.submitAnswer(idx)}
        />
      ) : (
        <div>
          {/* Show loading state while AI generates */}
          {aiHelper.loading[getCacheKey(controller.currentQuestion.id)] && (
            <div className='text-center py-8'>
              <div className='animate-spin text-4xl'>✨</div>
              <p className='mt-2 text-sm text-gray-600'>Generating personalized feedback...</p>
            </div>
          )}

          {/* Show feedback when ready */}
          {!aiHelper.loading[getCacheKey(controller.currentQuestion.id)] && (
            <QuizFeedbackPanel
              question={controller.currentQuestion}
              selectedAnswerIndex={controller.selectedAnswerIndex}
              onContinue={() => controller.continueToNext()}
            />
          )}
        </div>
      )}
    </div>
  )
}

function getCacheKey(questionId) {
  return `${questionId}:${0}`
}

/**
 * EXAMPLE 5: Custom Feedback Component
 * 
 * Create custom feedback display for specific use case
 */
export function CustomQuizFeedback({ question, selectedAnswerIndex, onContinue }) {
  const { buildDetailedFeedback } = require('../lib/quizFeedbackUtils')
  const feedback = buildDetailedFeedback(question, selectedAnswerIndex)

  if (!feedback) return null

  return (
    <div className='custom-feedback-panel'>
      {/* Header with status */}
      <div className={`feedback-header ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
        <span className='status-icon'>{feedback.statusIcon}</span>
        <span className='status-text'>{feedback.status}</span>
      </div>

      {/* Content sections */}
      <div className='feedback-content'>
        <div className='section explanation'>
          <h3>Why?</h3>
          <p>{feedback.explanation}</p>
        </div>

        {feedback.learningTip && (
          <div className='section learning-tip'>
            <h3>💡 Tip</h3>
            <p>{feedback.learningTip}</p>
          </div>
        )}

        {feedback.trivia && (
          <div className='section trivia'>
            <h3>🎓 Fun Fact</h3>
            <p>{feedback.trivia}</p>
          </div>
        )}
      </div>

      {/* Action button */}
      <button onClick={onContinue} className='btn-continue'>
        Next Question →
      </button>
    </div>
  )
}

/**
 * EXAMPLE 6: Minimal Setup
 * 
 * Quickest way to add feedback (copy-paste ready)
 */
export function MinimalQuizSetup({ quiz }) {
  const questions = quiz.meta?.questions || []
  const c = useQuizProgressController(questions)

  if (c.quizComplete) return <div>Quiz done! Score: {getScore(questions, c.answers)}</div>

  return (
    <div>
      {!c.showingFeedback && (
        <QuestionCard question={c.currentQuestion} onAnswer={(i) => c.submitAnswer(i)} />
      )}
      {c.showingFeedback && (
        <QuizFeedbackPanel
          question={c.currentQuestion}
          selectedAnswerIndex={c.selectedAnswerIndex}
          onContinue={() => c.continueToNext()}
        />
      )}
    </div>
  )
}

// Helper function
function getScore(questions, answers) {
  return questions.reduce(
    (score, q, i) => (answers[i] === q.correct ? score + 1 : score),
    0
  )
}

/**
 * INTEGRATION CHECKLIST
 * 
 * [ ] Import useQuizProgressController hook
 * [ ] Import QuizFeedbackPanel component
 * [ ] Add state for quiz progression
 * [ ] Add handlers for answer submission
 * [ ] Render QuestionCard when not showing feedback
 * [ ] Render QuizFeedbackPanel when showing feedback
 * [ ] Handle quiz completion
 * [ ] Test keyboard navigation
 * [ ] Test screen reader
 * [ ] Test dark mode
 * [ ] Mobile responsive test
 */
