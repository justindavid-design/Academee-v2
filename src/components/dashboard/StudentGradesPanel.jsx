import React from 'react'
import Loading from '../Loading'
import { getSubmissionStatus } from '../../lib/submissionStatus'

function formatDate(value) {
  if (!value) return 'No due date'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'No due date' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function EmptyPanel({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-token bg-surface p-8 text-center">
      <p className="text-sm font-semibold text-main">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
    </div>
  )
}

function WorkspaceShell({ title, description, children, aside }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <main className="min-w-0 space-y-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-main">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        </div>
        {children}
      </main>
      {aside ? <aside className="space-y-4">{aside}</aside> : null}
    </div>
  )
}

function GradeCard({ type, title, dueDate, status, score, maxScore, feedback, submittedAt }) {
  const percent = maxScore && score !== null && score !== undefined ? Math.round((score / maxScore) * 100) : null
  const statusBgColor =
    status === 'Graded'
      ? 'bg-emerald-50 border-emerald-200'
      : status === 'Submitted'
        ? 'bg-blue-50 border-blue-200'
        : 'bg-slate-50 border-slate-200'
  const statusTextColor =
    status === 'Graded' ? 'text-emerald-700' : status === 'Submitted' ? 'text-blue-700' : 'text-slate-700'

  return (
    <article className="rounded-2xl border border-token bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{type}</p>
          <h3 className="mt-1 text-lg font-semibold text-main line-clamp-2">{title}</h3>
          <p className="mt-2 text-sm text-muted">Due: {formatDate(dueDate)}</p>
          {submittedAt && <p className="text-sm text-muted">Submitted: {formatDate(submittedAt)}</p>}
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusBgColor} ${statusTextColor}`}>{status}</div>
          {percent !== null && (
            <div className="text-right">
              <div className="text-2xl font-bold text-main">
                {score}/{maxScore}
              </div>
              <div className="text-xs text-muted">{percent}%</div>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className="mt-4 rounded-2xl bg-surface-alt p-4">
          <p className="text-sm font-semibold text-main">Teacher Feedback</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{feedback}</p>
        </div>
      )}
    </article>
  )
}

/**
 * StudentGradesPanel
 * 
 * Student view of grades showing:
 * - Assignment scores and feedback
 * - Quiz results
 * - Overall progress
 * - Submission status
 * 
 * Maintains consistent teacher UI styling.
 */
export default function StudentGradesPanel({
  loading = false,
  studentGrades = [],
  overallGPA,
  completionStats,
}) {
  // Calculate statistics
  const gradedCount = studentGrades.filter((g) => getSubmissionStatus(g.submission, g.dueAt || g.due_at) === 'graded').length
  const submittedCount = studentGrades.filter((g) => ['submitted', 'late', 'graded', 'returned'].includes(getSubmissionStatus(g.submission, g.dueAt || g.due_at))).length
  const averageScore =
    gradedCount > 0
      ? Math.round(
          (studentGrades
            .filter((g) => g.submission?.score !== null && g.submission?.score !== undefined)
            .reduce((sum, g) => sum + (g.submission.score / g.submission.maxScore) * 100, 0) /
            gradedCount) *
            10
        ) / 10
      : null

  return (
    <WorkspaceShell
      title="Grades"
      description="Track your scores, feedback, submission status, and progress."
      aside={
        <div className="rounded-2xl border border-token bg-surface p-4 shadow-sm">
          <p className="text-sm font-semibold text-main">📊 Summary</p>
          <div className="mt-3 space-y-2">
            {averageScore !== null && (
              <div className="rounded-xl bg-surface-alt p-3">
                <p className="text-xs text-muted">Average Score</p>
                <p className="mt-1 text-xl font-bold text-main">{averageScore}%</p>
              </div>
            )}
            <div className="rounded-xl bg-surface-alt p-3">
              <p className="text-xs text-muted">Graded Work</p>
              <p className="mt-1 text-xl font-bold text-main">
                {gradedCount}/{studentGrades.length}
              </p>
            </div>
            <div className="rounded-xl bg-surface-alt p-3">
              <p className="text-xs text-muted">Submitted</p>
              <p className="mt-1 text-xl font-bold text-main">
                {submittedCount}/{studentGrades.length}
              </p>
            </div>
          </div>
        </div>
      }
    >
      {loading ? <Loading message="Loading your grades..." /> : null}

      {!loading && studentGrades.length === 0 ? (
        <EmptyPanel
          title="No grades yet"
          description="Scores and teacher feedback will appear after you submit work and your instructor reviews it."
        />
      ) : null}

      {!loading && studentGrades.length > 0 ? (
        <div className="space-y-3">
          {studentGrades.map((item) => (
            <GradeCard
              key={`${item.type}-${item.id}`}
              type={item.type === 'assignment' ? 'Assignment' : item.type === 'quiz' ? 'Quiz' : item.type}
              title={item.title}
              dueDate={item.dueAt || item.due_at}
              status={
                getSubmissionStatus(item.submission, item.dueAt || item.due_at) === 'graded'
                  ? 'Graded'
                  : ['submitted', 'late', 'returned'].includes(getSubmissionStatus(item.submission, item.dueAt || item.due_at))
                    ? 'Submitted'
                    : getSubmissionStatus(item.submission, item.dueAt || item.due_at) === 'late'
                      ? 'Late'
                      : getSubmissionStatus(item.submission, item.dueAt || item.due_at) === 'returned'
                        ? 'Returned'
                    : 'Not submitted'
              }
              score={item.submission?.score}
              maxScore={item.submission?.maxScore || 100}
              feedback={item.submission?.feedback}
              submittedAt={item.submission?.submittedAt || item.submission?.submitted_at}
            />
          ))}
        </div>
      ) : null}
    </WorkspaceShell>
  )
}
