import React, { useState } from 'react'
import { Layers, ClipboardList, PenLine, BookOpen } from 'lucide-react'
import { getSubmissionStatus as resolveSubmissionStatus } from '../../lib/submissionStatus'

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

function TopicSection({ title, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="overflow-hidden rounded-2xl border border-token bg-surface shadow-sm">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-4 border-b border-token px-5 py-4 text-left">
        <span>
          <span className="block text-base font-semibold text-main">{title}</span>
          <span className="mt-0.5 block text-xs text-muted">{count} item{count === 1 ? '' : 's'}</span>
        </span>
        <svg className={`h-5 w-5 text-muted transition ${open ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
      {open ? <div className="space-y-3 p-4 sm:p-5">{children}</div> : null}
    </section>
  )
}

function StudentItemRow({ icon: Icon, title, description, meta, badge, onView, onSubmit }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-token bg-surface p-4 transition hover:border-token sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-surface text-muted">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-main">{title}</h4>
            {badge ? <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-muted">{badge}</span> : null}
          </div>
          {description ? <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{description}</p> : null}
          {meta ? <p className="mt-2 text-xs font-medium text-muted">{meta}</p> : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {onSubmit ? (
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
          >
            Submit
          </button>
        ) : null}
        {onView ? (
          <button
            type="button"
            onClick={onView}
            className="rounded-xl border border-token px-3 py-2 text-xs font-semibold text-main hover:bg-surface-alt transition"
          >
            View
          </button>
        ) : null}
      </div>
    </div>
  )
}

/**
 * StudentClassworkPanel
 * 
 * Student-friendly classwork display showing:
 * - Modules/Topics (read-only)
 * - Assignments with submission status
 * - Quizzes with attempt status
 * - Resources
 * 
 * All items show student-specific actions (View, Submit).
 * Maintains consistent teacher UI styling.
 */
export default function StudentClassworkPanel({
  modules = [],
  assignments = [],
  quizzes = [],
  userSubmissions = {},
  userQuizAttempts = {},
  onViewAssignment,
  onStartQuiz,
}) {
  // Helper to get submission status badge
  const getSubmissionStatus = (assignmentId) => {
    const submission = userSubmissions[assignmentId]
    const status = resolveSubmissionStatus(submission)
    if (status === 'graded') return { label: 'Graded', color: 'text-emerald-600' }
    if (status === 'late') return { label: 'Late', color: 'text-amber-600' }
    if (status === 'returned') return { label: 'Returned', color: 'text-sky-600' }
    if (status === 'submitted') return { label: 'Submitted', color: 'text-emerald-600' }
    if (status === 'missing') return { label: 'Missing', color: 'text-rose-600' }
    return { label: 'Draft', color: 'text-slate-600' }
  }

  // Helper to get quiz status badge
  const getQuizStatus = (quizId) => {
    const attempt = userQuizAttempts[quizId]
    if (!attempt) return { label: 'Not attempted', color: 'text-slate-600' }
    return { label: 'Attempted', color: 'text-emerald-600' }
  }

  return (
    <WorkspaceShell
      title="Classwork"
      description="The organized learning workspace for modules, assignments, quizzes, and resources."
      aside={
        <div className="rounded-2xl border border-token bg-surface p-4 shadow-sm">
          <p className="text-sm font-semibold text-muted">Your Progress</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="rounded-xl bg-surface-alt p-3">
              <p className="text-xs text-muted">Assignments</p>
              <p className="mt-1 text-lg font-semibold text-main">
                {Object.values(userSubmissions).filter((s) => ['submitted', 'late', 'graded', 'returned'].includes(resolveSubmissionStatus(s))).length} / {assignments.length}
              </p>
            </div>
            <div className="rounded-xl bg-surface-alt p-3">
              <p className="text-xs text-muted">Quizzes</p>
              <p className="mt-1 text-lg font-semibold text-main">
                {Object.values(userQuizAttempts).filter((a) => a).length} / {quizzes.length}
              </p>
            </div>
          </div>
        </div>
      }
    >
      <TopicSection title="Topics / Modules" count={modules.length}>
        {modules.map((item) => (
          <StudentItemRow
            key={item.id}
            icon={Layers}
            title={item.title}
            description={item.description}
            badge="Module"
            onView={() => {}}
          />
        ))}
        {modules.length === 0 ? <EmptyPanel title="No modules yet" description="Course topics and modules will appear here as your instructor creates them." /> : null}
      </TopicSection>

      <TopicSection title="Assignments" count={assignments.length}>
        {assignments.map((item) => {
          const status = getSubmissionStatus(item.id)
          return (
            <StudentItemRow
              key={item.id}
              icon={ClipboardList}
              title={item.title}
              description={item.instructions}
              meta={formatDate(item.due_at)}
              badge={status.label}
              onView={() => onViewAssignment?.(item)}
              onSubmit={() => onViewAssignment?.(item)}
            />
          )
        })}
        {assignments.length === 0 ? (
          <EmptyPanel title="No assignments yet" description="Your instructor will post assignments here as the course progresses." />
        ) : null}
      </TopicSection>

      <TopicSection title="Quizzes" count={quizzes.length}>
        {quizzes.map((item) => {
          const status = getQuizStatus(item.id)
          return (
            <StudentItemRow
              key={item.id}
              icon={PenLine}
              title={item.title}
              description={item.description}
              meta={formatDate(item.due_at)}
              badge={status.label}
              onSubmit={() => onStartQuiz?.(item)}
            />
          )
        })}
        {quizzes.length === 0 ? <EmptyPanel title="No quizzes yet" description="Quizzes will appear here once your instructor creates them." /> : null}
      </TopicSection>

      <TopicSection title="Resources" count={0} defaultOpen={false}>
        <EmptyPanel title="No resources yet" description="Course materials and resources will be shared here." />
      </TopicSection>
    </WorkspaceShell>
  )
}
