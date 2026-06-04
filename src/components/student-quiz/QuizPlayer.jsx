import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { QuizHeader } from './QuizHeader'
import { QuestionCard } from './QuestionCard'
import { AnswerOption } from './AnswerOption'
import { QuizNavigator } from './QuizNavigator'
import { QuizSubmitModal } from './QuizSubmitModal'
import { QuizResults } from './QuizResults'
import { AdaptiveFeedbackRenderer, FeedbackLayout, QuizMode } from './AdaptiveFeedbackRenderer'
import { buildAttemptAnalytics } from '../../lib/quizAnalytics'
import useAIFeedback from '../../hooks/useAIFeedback'
import {
  buildAdaptiveInsights,
  createEmptyMasteryProfile,
  normalizeQuizQuestions,
  selectAdaptiveNextQuestion,
  updateMasteryProfile,
} from '../../lib/adaptiveQuizEngine'

function normalizeQuizMode(value) {
  const mode = String(value || '').toLowerCase()
  if (mode === 'study' || mode === 'review') return 'study'
  if (mode === 'exam') return 'exam'
  return 'practice'
}

function pickInitialQuestionIndex(questions = []) {
  if (!questions.length) return 0
  const mediumIndex = questions.findIndex((question) => String(question.difficulty || '').toLowerCase() === 'medium')
  if (mediumIndex >= 0) return mediumIndex

  const easyIndex = questions.findIndex((question) => String(question.difficulty || '').toLowerCase() === 'easy')
  if (easyIndex >= 0) return easyIndex

  return 0
}

function getPrimaryConcept(question) {
  return question?.conceptTags?.[0] || 'general'
}

function rebuildAdaptiveSession(questions = [], answerSequence = [], answerRecords = {}) {
  let masteryByConcept = createEmptyMasteryProfile(questions)
  const analyticsList = []
  const analyticsByQuestionIndex = {}

  answerSequence.forEach((questionIndex) => {
    const record = answerRecords[questionIndex]
    const question = questions[questionIndex]
    if (!record || !question) return

    const concept = getPrimaryConcept(question)
    const masteryBefore = Number(masteryByConcept?.[concept]?.score ?? masteryByConcept?.[concept] ?? 50)
    const responseTimeSeconds = Number(record.responseTimeSeconds ?? Math.round(Number(record.responseTimeMs || 0) / 1000))
    const nextMastery = updateMasteryProfile({
      masteryByConcept,
      question,
      isCorrect: Boolean(record.isCorrect),
      responseTimeSeconds: Number.isFinite(responseTimeSeconds) ? responseTimeSeconds : null,
      questionAnalytics: analyticsList,
    })
    const masteryAfter = Number(nextMastery?.[concept]?.score ?? masteryBefore)
    masteryByConcept = nextMastery

    const selectedAnswerText = question.options?.[Number(record.selectedAnswerIndex)] || record.selectedAnswerText || ''
    const correctAnswerText = question.options?.[Number(question.correct)] || question.correctAnswer || ''

    const analyticsEntry = {
      questionId: question.id,
      question_id: question.id,
      questionIndex,
      text: question.question,
      concept,
      conceptTags: question.conceptTags || [],
      difficulty: question.difficulty || 'Medium',
      selected_answer: selectedAnswerText,
      selected_answer_index: Number(record.selectedAnswerIndex),
      selectedAnswer: selectedAnswerText,
      selectedAnswerIndex: Number(record.selectedAnswerIndex),
      selectedAnswerText,
      correct: Boolean(record.isCorrect),
      isCorrect: Boolean(record.isCorrect),
      correct_answer: correctAnswerText,
      correctAnswer: correctAnswerText,
      response_time: Number.isFinite(responseTimeSeconds) ? responseTimeSeconds : null,
      response_time_ms: Number.isFinite(Number(record.responseTimeMs)) ? Number(record.responseTimeMs) : null,
      responseTimeSeconds: Number.isFinite(responseTimeSeconds) ? responseTimeSeconds : null,
      responseTimeMs: Number.isFinite(Number(record.responseTimeMs)) ? Number(record.responseTimeMs) : null,
      mastery_before: masteryBefore,
      mastery_after: masteryAfter,
      masteryBefore,
      masteryAfter,
      explanation: question.explanation || '',
      trivia: question.trivia || '',
      learningTip: question.learningTip || '',
    }

    analyticsList.push(analyticsEntry)
    analyticsByQuestionIndex[questionIndex] = analyticsEntry
  })

  return {
    masteryByConcept,
    analyticsList,
    analyticsByQuestionIndex,
  }
}

function buildAnswerRecord(question, selectedAnswerIndex, responseTimeMs) {
  const selectedIndex = Number(selectedAnswerIndex)
  const selectedAnswerText = question?.options?.[selectedIndex] || ''
  const correctAnswerText = question?.options?.[Number(question?.correct)] || question?.correctAnswer || ''
  const concept = getPrimaryConcept(question)
  const isCorrect = Number.isFinite(selectedIndex) && selectedIndex === Number(question?.correct)

  return {
    questionId: question?.id,
    question_id: question?.id,
    text: question?.question,
    selectedAnswerIndex: selectedIndex,
    selectedAnswerText,
    selected_answer: selectedAnswerText,
    selectedAnswer: selectedAnswerText,
    correct: Number(question?.correct ?? 0),
    correctAnswer: correctAnswerText,
    correct_answer: correctAnswerText,
    isCorrect,
    correctOption: correctAnswerText,
    selectedOption: selectedAnswerText,
    concept,
    conceptTags: question?.conceptTags || [],
    difficulty: question?.difficulty || 'Medium',
    responseTimeMs,
    responseTimeSeconds: Number.isFinite(responseTimeMs) ? Math.round(responseTimeMs / 1000) : null,
    response_time_ms: responseTimeMs,
    response_time: Number.isFinite(responseTimeMs) ? Math.round(responseTimeMs / 1000) : null,
    explanation: question?.explanation || '',
    trivia: question?.trivia || '',
    learningTip: question?.learningTip || '',
    answeredAt: new Date().toISOString(),
  }
}

/**
 * QuizPlayer - Main fullscreen quiz player component
 * Orchestrates the complete student quiz-taking experience
 * Handles question navigation, answer selection, autosave, and submission
 */
export function QuizPlayer({
  quiz = {},
  onSubmit = null,
  onExit = null,
  initialAnswers = {},
}) {
  const questions = useMemo(
    () => normalizeQuizQuestions(quiz.meta?.questions || []),
    [quiz.meta?.questions]
  )
  const quizTitle = quiz.title || 'Quiz'
  const duration = quiz.meta?.duration || 30
  const passThreshold = quiz.meta?.passThreshold || 0.7
  const quizMode = normalizeQuizMode(quiz.meta?.mode || quiz.meta?.settings?.mode || quiz.mode)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState(initialAnswers)
  const [answerRecords, setAnswerRecords] = useState({})
  const [answerSequence, setAnswerSequence] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [navigatorOpen, setNavigatorOpen] = useState(true)
  const [submittedResult, setSubmittedResult] = useState(null)
  const [aiFeedbackByQuestion, setAiFeedbackByQuestion] = useState({})

  const { requestFeedback } = useAIFeedback({
    enabled: quizMode !== 'exam',
  })

  const questionStartTimesRef = useRef({})

  useEffect(() => {
    if (!quiz.id) return

    const startIndex = pickInitialQuestionIndex(questions)
    setCurrentQuestion(startIndex)
    setAnswers(initialAnswers || {})
    setAnswerRecords({})
    setAnswerSequence([])
    setSubmitted(false)
    setSubmitting(false)
    setShowSubmitModal(false)
    setSubmittedResult(null)
    setAiFeedbackByQuestion({})
    questionStartTimesRef.current = { [startIndex]: Date.now() }
  }, [quiz.id, questions, initialAnswers])

  useEffect(() => {
    questionStartTimesRef.current[currentQuestion] = Date.now()
  }, [currentQuestion])

  const adaptiveSession = useMemo(
    () => rebuildAdaptiveSession(questions, answerSequence, answerRecords),
    [questions, answerSequence, answerRecords]
  )

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value !== null && value !== undefined).length,
    [answers]
  )

  const answeredQuestions = useMemo(
    () => Object.keys(answers)
      .map(Number)
      .filter((index) => answers[index] !== null && answers[index] !== undefined),
    [answers]
  )

  const currentQ = questions[currentQuestion]
  const currentRecord = answerRecords[currentQuestion] || null
  const hasCurrentAnswer = currentRecord || Number.isFinite(Number(answers[currentQuestion]))

  const nextQuestionIndex = useMemo(() => {
    if (!questions.length) return null

    const answeredIndices = Object.keys(answers)
      .map(Number)
      .filter((index) => answers[index] !== null && answers[index] !== undefined)

    if (!hasCurrentAnswer) {
      const nextUnanswered = questions.findIndex((_, index) => index > currentQuestion && !answeredIndices.includes(index))
      if (nextUnanswered >= 0) return nextUnanswered
      return questions.findIndex((_, index) => !answeredIndices.includes(index))
    }

    if (!currentQ || !currentRecord) {
      return questions.findIndex((_, index) => !answeredIndices.includes(index))
    }

    const currentOutcome = {
      isCorrect: Boolean(currentRecord.isCorrect),
      responseTimeSeconds: currentRecord.responseTimeSeconds,
      difficulty: currentQ.difficulty,
      conceptTags: currentQ.conceptTags,
    }

    return selectAdaptiveNextQuestion({
      questions,
      currentIndex: currentQuestion,
      masteryByConcept: adaptiveSession.masteryByConcept,
      questionAnalytics: adaptiveSession.analyticsList,
      answeredIndices,
      currentOutcome,
    })
  }, [adaptiveSession.analyticsList, adaptiveSession.masteryByConcept, answers, currentQuestion, currentQ, currentRecord, hasCurrentAnswer, questions])

  const adaptiveInsights = useMemo(
    () => buildAdaptiveInsights({
      masteryByConcept: adaptiveSession.masteryByConcept,
      questionAnalytics: adaptiveSession.analyticsList,
    }),
    [adaptiveSession.analyticsList, adaptiveSession.masteryByConcept]
  )

  const feedbackMode = quizMode === 'exam' ? QuizMode.EXAM : quizMode === 'study' ? QuizMode.STUDY : QuizMode.PRACTICE
  const feedbackLayout = quizMode === 'study' ? FeedbackLayout.PANEL : FeedbackLayout.CARD
  const showFeedbackAutomatically = quizMode !== 'exam'

  useEffect(() => {
    const quizKey = `quiz_attempt_${quiz.id || 'draft'}`
    localStorage.setItem(
      quizKey,
      JSON.stringify({
        quizId: quiz.id,
        answers,
        timestamp: Date.now(),
        currentQuestion,
        adaptive: {
          masteryByConcept: adaptiveSession.masteryByConcept,
          answerSequence,
        },
      })
    )
  }, [adaptiveSession.masteryByConcept, answerSequence, answers, currentQuestion, quiz.id])

  const goToQuestion = useCallback((index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestion(index)
    }
  }, [questions.length])

  const goPrevious = useCallback(() => {
    goToQuestion(Math.max(0, currentQuestion - 1))
  }, [currentQuestion, goToQuestion])

  const goNext = useCallback(() => {
    if (nextQuestionIndex === null || nextQuestionIndex === undefined) {
      handleSubmitClick()
      return
    }
    goToQuestion(nextQuestionIndex)
  }, [nextQuestionIndex, goToQuestion])

  function handleAnswerSelect(optionIndex) {
    if (!currentQ) return

    const startedAt = questionStartTimesRef.current[currentQuestion] || Date.now()
    const responseTimeMs = Math.max(0, Date.now() - startedAt)
    const record = buildAnswerRecord(currentQ, optionIndex, responseTimeMs)

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIndex,
    }))

    setAnswerRecords((prev) => ({
      ...prev,
      [currentQuestion]: record,
    }))

    setAnswerSequence((prev) => (
      prev.includes(currentQuestion) ? prev : [...prev, currentQuestion]
    ))

    void requestFeedback(currentQ, optionIndex)
      .then((feedback) => {
        if (!feedback) return
        setAiFeedbackByQuestion((prev) => ({
          ...prev,
          [currentQuestion]: feedback,
        }))
      })
      .catch(() => {
        // Local adaptive feedback stays visible if the AI call fails.
      })
  }

  function handleSubmitClick() {
    setShowSubmitModal(true)
  }

  async function handleSubmitConfirm() {
    setSubmitting(true)
    try {
      const enrichedAnswers = questions.map((question, index) => {
        const record = adaptiveSession.analyticsByQuestionIndex[index] || answerRecords[index] || {}
        const chosen = Number(record.selectedAnswerIndex ?? answers[index])
        const isCorrect = Number.isFinite(chosen) && chosen === Number(question.correct)
        const concept = getPrimaryConcept(question)

        return {
          questionId: question.id || index,
          question_id: question.id || index,
          text: question.question,
          options: question.options,
          correct: Number(question.correct),
          correctAnswer: question.correctAnswer || question.options?.[question.correct] || '',
          chosen,
          selectedAnswerIndex: chosen,
          selected_answer_index: chosen,
          selectedAnswer: question.options?.[chosen] || record.selectedAnswerText || '',
          selected_answer: question.options?.[chosen] || record.selectedAnswerText || '',
          isCorrect,
          correct_answer: question.options?.[question.correct] || question.correctAnswer || '',
          conceptTags: question.conceptTags || [],
          concept,
          difficulty: question.difficulty || 'Medium',
          explanation: question.explanation || '',
          learningTip: question.learningTip || '',
          trivia: question.trivia || '',
          responseTimeMs: record.responseTimeMs ?? record.response_time_ms ?? null,
          responseTimeSeconds: record.responseTimeSeconds ?? record.response_time ?? null,
          response_time_ms: record.responseTimeMs ?? record.response_time_ms ?? null,
          response_time: record.responseTimeSeconds ?? record.response_time ?? null,
          masteryBefore: record.masteryBefore ?? record.mastery_before ?? null,
          masteryAfter: record.masteryAfter ?? record.mastery_after ?? null,
          mastery_before: record.masteryBefore ?? record.mastery_before ?? null,
          mastery_after: record.masteryAfter ?? record.mastery_after ?? null,
        }
      })

      const score = enrichedAnswers.filter((answer) => answer.isCorrect).length

      const result = {
        answers: enrichedAnswers,
        score,
        total: questions.length,
        percentage: questions.length ? Math.round((score / questions.length) * 100) : 0,
        timestamp: new Date().toISOString(),
        quizId: quiz.id,
        quizTitle,
        mode: quizMode,
        masteryByConcept: adaptiveSession.masteryByConcept,
        adaptiveInsights,
      }

      result.analytics = buildAttemptAnalytics(questions, result.answers, {
        quizId: quiz.id,
        quizTitle,
        mode: quizMode,
        masteryByConcept: adaptiveSession.masteryByConcept,
        adaptiveInsights,
      })

      setSubmittedResult(result)
      setSubmitted(true)
      setShowSubmitModal(false)

      onSubmit?.(result)
      localStorage.removeItem(`quiz_attempt_${quiz.id || 'draft'}`)
    } finally {
      setSubmitting(false)
    }
  }

  function handleTimeUp() {
    handleSubmitClick()
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showSubmitModal || submitted) return
      if (event.altKey || event.metaKey || event.ctrlKey) return

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goNext()
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrevious()
      }

      if (event.key === 'Home') {
        event.preventDefault()
        goToQuestion(0)
      }

      if (event.key === 'End') {
        event.preventDefault()
        goToQuestion(questions.length - 1)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrevious, goToQuestion, questions.length, showSubmitModal, submitted])

  if (submitted && submittedResult) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <QuizResults
            score={submittedResult.score}
            totalQuestions={submittedResult.total}
            passThreshold={passThreshold}
            answers={submittedResult.answers}
            adaptiveInsights={submittedResult.adaptiveInsights}
            onExit={onExit}
          />
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="w-full h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No questions in this quiz</p>
          {onExit && (
            <button
              onClick={onExit}
              className="px-6 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600"
            >
              Exit Quiz
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col overflow-hidden">
      <QuizHeader
        quizTitle={quizTitle}
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        answered={answeredCount}
        duration={duration}
        isActive={!submitted}
        onTimeUp={handleTimeUp}
        onExit={onExit}
      />

      <div className="flex-1 flex overflow-hidden">
        <QuizNavigator
          totalQuestions={questions.length}
          currentQuestion={currentQuestion}
          answeredQuestions={answeredQuestions}
          onSelectQuestion={goToQuestion}
          isOpen={navigatorOpen}
          onToggle={() => setNavigatorOpen(!navigatorOpen)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8">
            <div className="max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <QuestionCard
                    questionNumber={currentQuestion + 1}
                    totalQuestions={questions.length}
                    text={currentQ?.text}
                    imageUrl={currentQ?.imageUrl}
                    mediaUrl={currentQ?.mediaUrl}
                    mediaType={currentQ?.mediaType}
                  >
                    <div className="space-y-3">
                      {currentQ?.options?.map((option, index) => (
                        <AnswerOption
                          key={`${currentQ.id || currentQuestion}-${index}`}
                          index={index}
                          text={option}
                          isSelected={Number(answers[currentQuestion]) === index}
                          isDisabled={false}
                          onSelect={handleAnswerSelect}
                        />
                      ))}
                    </div>

                    {showFeedbackAutomatically && Number.isFinite(Number(answers[currentQuestion])) ? (
                      <div className="pt-2">
                        <AdaptiveFeedbackRenderer
                          question={currentQ}
                          selectedAnswerIndex={Number(answers[currentQuestion])}
                          layout={feedbackLayout}
                          mode={feedbackMode}
                          showAutomatically={showFeedbackAutomatically}
                          onContinue={goNext}
                          autoAdvanceDelay={currentQ?.autoAdvanceDelay || quiz.meta?.settings?.autoAdvanceDelay || null}
                          feedbackOverride={aiFeedbackByQuestion[currentQuestion] || null}
                        />
                      </div>
                    ) : null}
                  </QuestionCard>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white px-6 md:px-8 py-6">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <button
                onClick={goPrevious}
                disabled={currentQuestion <= 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-sm text-slate-600 font-medium">
                Question {currentQuestion + 1} of {questions.length}
              </span>

              {nextQuestionIndex !== null && nextQuestionIndex !== undefined ? (
                <button
                  onClick={goNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitClick}
                  className="px-6 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSubmitModal && (
          <QuizSubmitModal
            isOpen={showSubmitModal}
            totalQuestions={questions.length}
            answeredQuestions={answeredCount}
            isSubmitting={submitting}
            onConfirm={handleSubmitConfirm}
            onCancel={() => setShowSubmitModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default QuizPlayer
