import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, BarChart3, Award } from 'lucide-react'
import QuizSummary from '../analytics/QuizSummary'
import StudentAnalytics from '../analytics/StudentAnalytics'
import { buildStudentAnalyticsFromResult } from '../../lib/quizAnalytics'

/**
 * QuizResults - Displays quiz results and feedback after submission
 * Shows score, correct/incorrect answers, pass/fail status
 * Provides answer explanations and review options
 */
export function QuizResults({
  score = 0,
  totalQuestions = 0,
  passThreshold = 0.7,
  answers = [],
  adaptiveInsights = null,
  showExplanations = true,
  onReview = null,
  onRetry = null,
}) {
  const percentage = (score / totalQuestions) * 100
  const passed = percentage >= passThreshold * 100
  const percentageRounded = Math.round(percentage)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const getGrade = () => {
    if (percentageRounded >= 90) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-50' }
    if (percentageRounded >= 80) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    if (percentageRounded >= 70) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    if (percentageRounded >= 60) return { grade: 'D', color: 'text-orange-600', bgColor: 'bg-orange-50' }
    return { grade: 'F', color: 'text-red-600', bgColor: 'bg-red-50' }
  }

  const gradeInfo = getGrade()
  const analytics = useMemo(
    () =>
      buildStudentAnalyticsFromResult({
        answers,
        score,
        total: totalQuestions,
        percentage: percentageRounded,
      }),
    [answers, percentageRounded, score, totalQuestions]
  )

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Score display */}
      <motion.div
        variants={item}
        className={`rounded-2xl p-8 text-center border-2 border-slate-200 ${gradeInfo.bgColor}`}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          {passed ? (
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>

        <h1 className={`text-5xl font-bold ${gradeInfo.color}`}>{percentageRounded}%</h1>
        <p className="text-slate-600 mt-2">
          You got {score} out of {totalQuestions} questions correct
        </p>

        <div className={`inline-block mt-6 px-6 py-3 rounded-full font-bold text-lg ${gradeInfo.color} ${gradeInfo.bgColor}`}>
          Grade: {gradeInfo.grade}
        </div>

        <p className="mt-6 text-base text-slate-700">
          {passed
            ? '🎉 Congratulations! You passed the quiz.'
            : '📚 Keep practicing to improve your score!'}
        </p>
      </motion.div>

      <QuizSummary analytics={analytics} passThreshold={passThreshold * 100} />

      <StudentAnalytics analytics={analytics} />

      {/* Performance breakdown */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-sm text-slate-600 mb-2">Correct</p>
          <p className="text-2xl font-bold text-green-600">{score}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-sm text-slate-600 mb-2">Incorrect</p>
          <p className="text-2xl font-bold text-red-600">{totalQuestions - score}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-sm text-slate-600 mb-2">Accuracy</p>
          <p className="text-2xl font-bold text-blue-600">{percentageRounded}%</p>
        </div>
      </motion.div>

      {adaptiveInsights && (
        <motion.div variants={item} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-900">Adaptive Learning Insights</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <InsightColumn
              title="Strengths"
              emptyLabel="Keep going"
              items={adaptiveInsights.strengths || []}
              accent="text-green-700"
            />
            <InsightColumn
              title="Weak Areas"
              emptyLabel="No major gaps detected"
              items={adaptiveInsights.weakAreas || []}
              accent="text-red-700"
            />
            <InsightColumn
              title="Recommendations"
              emptyLabel="Continue the current path"
              items={(adaptiveInsights.recommendations || []).map((item) => ({ concept: item }))}
              accent="text-blue-700"
              renderItem={(item) => item.concept}
            />
          </div>
        </motion.div>
      )}

      {/* Answer review */}
      {showExplanations && answers.length > 0 && (
        <motion.div variants={item} className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Answer Review</h2>

          <div className="space-y-3">
            {answers.map((answer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl border-2 p-4 ${
                  answer.isCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {answer.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      Question {index + 1}: {answer.text}
                    </p>

                    {answer.isCorrect ? (
                      <p className="text-sm text-green-700 mt-2">
                        ✓ Your answer: {answer.options?.[answer.chosen]}
                      </p>
                    ) : (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-red-700">
                          ✗ Your answer: {answer.options?.[answer.chosen] || 'Not answered'}
                        </p>
                        <p className="text-sm text-green-700">
                          ✓ Correct answer: {answer.options?.[answer.correct]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div variants={item} className="flex gap-3 flex-col sm:flex-row">
        {onReview && (
          <button
            onClick={onReview}
            className="flex-1 px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            Review Answers
          </button>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-1 px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Award className="w-5 h-5" />
            Try Again
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

function InsightColumn({ title, emptyLabel, items, accent, renderItem }) {
  const hasItems = Array.isArray(items) && items.length > 0

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className={`text-sm font-bold uppercase tracking-[0.12em] ${accent}`}>{title}</h3>
      <div className="mt-3 space-y-2">
        {hasItems ? items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            {renderItem ? renderItem(item) : (
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">{item.concept}</p>
                <p className="text-xs text-slate-500">Mastery {item.mastery}%</p>
                {item.note ? <p className="text-sm">{item.note}</p> : null}
              </div>
            )}
          </div>
        )) : (
          <p className="text-sm text-slate-500">{emptyLabel}</p>
        )}
      </div>
    </div>
  )
}
