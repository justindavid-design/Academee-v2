import React, { useMemo, useState } from 'react'
import AdaptiveFeedback from './AdaptiveFeedback'
import { buildOverallFeedback, buildQuestionFeedback, normalizeQuizQuestions, parseSubmissionContent } from './quizUtils'
import TeacherAnalytics from '../analytics/TeacherAnalytics'
import { buildTeacherAnalytics, getQuizAttempts } from '../../lib/quizAnalytics'
import { getQuizQuestionsSource } from '../quiz/quizTypes'

export default function QuizAttemptCard({ quiz, submission, onSubmit }) {
  const questions = useMemo(() => normalizeQuizQuestions(getQuizQuestionsSource(quiz)), [quiz])
  const existingAttempt = useMemo(() => parseSubmissionContent(submission?.content), [submission?.content])
  const [selectedAnswers, setSelectedAnswers] = useState(() => existingAttempt?.answers || {})
  const [submittedAttempt, setSubmittedAttempt] = useState(existingAttempt)

  if (!questions.length) {
    return (
      <div className="rounded-[22px] border border-token bg-surface p-4 text-sm text-muted">
        This quiz does not have questions yet.
      </div>
    )
  }

  const score = submittedAttempt?.score ?? null
  const total = submittedAttempt?.total ?? questions.length
  const teacherAnalytics = useMemo(() => {
    const storedAttempts = getQuizAttempts({ quizId: quiz?.id })
    const currentAttempt = submittedAttempt
      ? [{
          quizId: quiz?.id,
          userId: submission?.user_id,
          userName: submission?.user_name || submission?.student_name,
          score: submittedAttempt.score,
          total: submittedAttempt.total,
          percentage: total ? Math.round((submittedAttempt.score / total) * 100) : 0,
          answers: submittedAttempt.answers || [],
          timestamp: submittedAttempt.timestamp || submission?.updated_at || submission?.submitted_at,
        }]
      : []

    return buildTeacherAnalytics(questions, [...storedAttempts, ...currentAttempt])
  }, [questions, quiz?.id, submission?.submitted_at, submission?.updated_at, submission?.user_id, submission?.user_name, submission?.student_name, submittedAttempt, total])

  const handleSubmit = () => {
    const answers = questions.map((question, index) => {
      const chosen = Number(selectedAnswers[question.id] ?? selectedAnswers[index])
      return {
        questionId: question.id,
        text: question.text,
        options: question.options,
        correct: question.correct,
        chosen,
        isCorrect: chosen === question.correct,
      }
    })

    const result = {
      answers,
      score: answers.filter((item) => item.isCorrect).length,
      total: questions.length,
      feedback: buildOverallFeedback(answers.filter((item) => item.isCorrect).length, questions.length),
    }

    setSubmittedAttempt(result)
    onSubmit?.(result)
  }

  return (
    <div className="mt-4 rounded-[22px] border border-token bg-surface p-4">
      <div className="space-y-4">
        {questions.map((question, questionIndex) => {
          const answered = submittedAttempt?.answers?.find((item) => item.questionId === question.id || item.questionId === questionIndex)
          const chosenIndex = answered ? answered.chosen : Number(selectedAnswers[question.id] ?? selectedAnswers[questionIndex])
          const feedbackText = answered ? buildQuestionFeedback(question, answered.chosen) : ''

          return (
            <div key={question.id || questionIndex} className="rounded-[20px] border border-token bg-app p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-subtle">Question {questionIndex + 1}</p>
              <h4 className="mt-2 text-base font-semibold text-main">{question.text}</h4>

              <div className="mt-3 space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isCorrect = answered && optionIndex === question.correct
                  const isWrongChoice = answered && optionIndex === answered.chosen && answered.chosen !== question.correct
                  const selected = !answered && chosenIndex === optionIndex

                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      disabled={Boolean(answered)}
                      onClick={() => setSelectedAnswers((current) => ({ ...current, [question.id || questionIndex]: optionIndex }))}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        isCorrect
                          ? 'border-emerald-400 bg-emerald-100 text-emerald-800'
                          : isWrongChoice
                            ? 'border-red-300 bg-red-50 text-red-800'
                            : selected
                              ? 'border-token bg-surface-alt text-main'
                              : 'border-token bg-surface text-main hover-surface'
                      }`}
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-full border border-current text-xs font-bold">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span>{option}</span>
                    </button>
                  )
                })}
              </div>

              {answered ? <AdaptiveFeedback text={feedbackText} isCorrect={answered.isCorrect} /> : null}
            </div>
          )
        })}
      </div>

      {submittedAttempt ? (
        <div className="mt-4 rounded-[20px] border border-token bg-surface p-4">
          <p className="text-sm font-semibold text-main">Quiz result</p>
          <p className="mt-2 text-base font-black text-main">
            {score}/{total}
          </p>
          <AdaptiveFeedback text={submittedAttempt.feedback} isCorrect={(score || 0) / total >= 0.6} variant="overall" />
        </div>
      ) : (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < questions.length}
            className="rounded-2xl primary-btn px-4 py-3 text-sm font-semibold disabled:opacity-50"
          >
            Submit quiz
          </button>
        </div>
      )}

      <div className="mt-4">
        <TeacherAnalytics analytics={teacherAnalytics} />
      </div>
    </div>
  )
}
