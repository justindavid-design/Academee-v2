import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileArchive,
  FileImage,
  FileText,
  Flame,
  LayoutDashboard,
  Megaphone,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  Timer,
  Trash2,
  Trophy,
  UploadCloud,
  Video,
  X,
  Zap,
  Users,
} from 'lucide-react'
import PeopleList from '../dashboard/PeopleList'
import { apiFetch } from '../../lib/apiClient'
import { useAuth } from '../../lib/AuthProvider'
import { normalizeQuizQuestions } from '../quizzes/quizUtils'
import FileUploadDropzone from '../common/FileUploadDropzone'
import { FileAttachmentList } from '../common/FileAttachmentCard'
import { parseAttachments, parseContentWithAttachments } from '../../lib/fileUtils'
import { enrichSubmission, getSubmissionStatus } from '../../lib/submissionStatus'
import { subscribeLmsEvent } from '../../lib/lmsEvents'
import AdaptiveInsightPanel from '../adaptive/AdaptiveInsightPanel'

const demoQuizQuestions = [
  {
    id: 'demo-1',
    text: 'Which learning habit makes quiz review more effective?',
    type: 'multiple',
    options: ['Review only the score', 'Compare answers with feedback', 'Skip missed questions', 'Wait until finals week'],
    correct: 1,
  },
  {
    id: 'demo-2',
    text: 'Select the resources that can appear inside a module.',
    type: 'checkbox',
    options: ['Lessons', 'Videos', 'Assignments', 'Quizzes'],
    correct: [0, 1, 2, 3],
  },
  {
    id: 'demo-3',
    text: 'A submitted assignment can still show teacher feedback after grading.',
    type: 'boolean',
    options: ['True', 'False'],
    correct: 0,
  },
  {
    id: 'demo-4',
    text: 'In one short phrase, what should you do before submitting work?',
    type: 'short',
    correctText: 'review',
  },
]

const fileTypeIcons = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  ppt: FileText,
  pptx: FileText,
  zip: FileArchive,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  mp4: Video,
  mov: Video,
}

function formatDate(value, fallback = 'No due date') {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function formatRelative(value) {
  if (!value) return 'Recently'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return formatDate(value)
}

function getDueState(value, isDone = false) {
  if (isDone) return { label: 'Submitted', tone: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
  if (!value) return { label: 'Open', tone: 'bg-surface text-main border-token' }
  const due = new Date(value)
  if (Number.isNaN(due.getTime())) return { label: 'Open', tone: 'bg-surface text-main border-token' }
  if (due < new Date()) return { label: 'Missing', tone: 'bg-rose-100 text-rose-700 border-rose-200' }
  const hours = (due.getTime() - Date.now()) / 36e5
  if (hours < 48) return { label: 'Due soon', tone: 'bg-amber-100 text-amber-800 border-amber-200' }
  return { label: 'On track', tone: 'bg-sky-100 text-sky-700 border-sky-200' }
}

function submissionLabel(submission, dueAt) {
  const status = getSubmissionStatus(submission, dueAt)
  if (status === 'submitted') return 'Submitted'
  if (status === 'late') return 'Late'
  if (status === 'graded') return 'Graded'
  if (status === 'returned') return 'Returned'
  if (status === 'missing') return 'Missing'
  return 'Draft'
}

function statusBadge(label, tone) {
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${tone}`}>{label}</span>
}

function buildFeed({ announcements, assignments, quizzes, modules }) {
  const items = []
  announcements.forEach((item) => items.push({ id: `ann-${item.id}`, type: 'announcement', at: item.created_at, item }))
  assignments.forEach((item) => items.push({ id: `asg-${item.id}`, type: 'assignment', at: item.created_at || item.due_at, item }))
  quizzes.forEach((item) => items.push({ id: `quiz-${item.id}`, type: 'quiz', at: item.created_at || item.due_at, item }))
  modules.forEach((item) => items.push({ id: `mod-${item.id}`, type: 'module', at: item.created_at, item }))
  return items.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
}

function getQuizQuestions(quiz) {
  const source = quiz?.questions || quiz?.meta?.questions || quiz?.content || quiz?.question_bank
  const normalized = normalizeQuizQuestions(source)
  return normalized.length
    ? normalized.map((question, index) => ({
        ...question,
        id: question.id || `question-${index + 1}`,
        type: question.type || (Array.isArray(question.correct) ? 'checkbox' : question.options?.length === 2 && question.options.every((option) => ['true', 'false'].includes(String(option).toLowerCase())) ? 'boolean' : question.options?.length ? 'multiple' : 'short'),
      }))
    : demoQuizQuestions
}

function getCompletionStats({ assignments, quizzes, modules, submissions, quizResults }) {
  const submittedAssignments = assignments.filter((assignment) => ['submitted', 'late', 'graded', 'returned'].includes(submissions[assignment.id]?.status)).length
  const completedQuizzes = quizzes.filter((quiz) => quizResults[quiz.id]?.submittedAt).length
  const completedModules = Math.min(modules.length, Math.floor((submittedAssignments + completedQuizzes) / 2))
  const total = assignments.length + quizzes.length + modules.length
  const done = submittedAssignments + completedQuizzes + completedModules
  return {
    total,
    done,
    submittedAssignments,
    completedQuizzes,
    completedModules,
    percent: total ? Math.round((done / total) * 100) : 0,
  }
}

export default function StudentCourseExperience({
  course,
  courseId,
  modules = [],
  assignments = [],
  quizzes = [],
  announcements = [],
  message = '',
  onSubmitAssignment,
  onMessage,
}) {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState('stream')
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [activeAssignment, setActiveAssignment] = useState(null)
  const [expandedModule, setExpandedModule] = useState(modules[0]?.id || null)
  const [toast, setToast] = useState('')
  const [submissions, setSubmissions] = useState({})
  const [quizResults, setQuizResults] = useState({})
  const currentUserId = user?.id

  useEffect(() => {
    if (!currentUserId || !assignments.length) {
      setSubmissions({})
      return undefined
    }

    let active = true

    async function loadSubmissions() {
      try {
        const rows = await Promise.all(
          assignments.map(async (assignment) => {
            try {
              const res = await apiFetch(`/api/assignments/${assignment.id}/submissions?user_id=${encodeURIComponent(currentUserId)}`)
              const data = await res.json().catch(() => [])
              if (!res.ok) return [assignment.id, null]
              const submission = Array.isArray(data) ? data.find((row) => String(row.user_id) === String(currentUserId)) || data[0] || null : null
              return [assignment.id, enrichSubmission(submission, assignment)]
            } catch (_error) {
              return [assignment.id, null]
            }
          })
        )

        if (!active) return

        setSubmissions(
          rows.reduce((acc, [assignmentId, submission]) => {
            if (submission) acc[assignmentId] = submission
            return acc
          }, {})
        )
      } catch (error) {
        console.error('Failed to load student submissions:', error)
      }
    }

    loadSubmissions()
    return () => {
      active = false
    }
  }, [assignments, currentUserId])

  useEffect(() => {
    const unsubscribe = subscribeLmsEvent((detail) => {
      if (!detail) return
      if (detail.type === 'submission-updated') {
        if (!detail.assignmentId || assignments.some((assignment) => String(assignment.id) === String(detail.assignmentId))) {
          setSubmissions((current) => {
            if (!detail.assignmentId) return current
            const next = { ...current }
            if (detail.action === 'unsubmit') {
              next[detail.assignmentId] = detail.submission || { status: 'draft' }
            } else if (detail.submission) {
              next[detail.assignmentId] = enrichSubmission(detail.submission, assignments.find((assignment) => String(assignment.id) === String(detail.assignmentId)))
            }
            return next
          })
        }
      }
    })

    return unsubscribe
  }, [assignments])

  const stats = useMemo(
    () => getCompletionStats({ assignments, quizzes, modules, submissions, quizResults }),
    [assignments, quizzes, modules, submissions, quizResults]
  )
  const feed = useMemo(() => buildFeed({ announcements, assignments, quizzes, modules }), [announcements, assignments, quizzes, modules])
  const upcoming = useMemo(
    () => [...assignments, ...quizzes]
      .filter((item) => item.due_at)
      .sort((a, b) => new Date(a.due_at) - new Date(b.due_at))
      .slice(0, 4),
    [assignments, quizzes]
  )

  const showToast = (text) => {
    setToast(text)
    window.clearTimeout(showToast.timer)
    showToast.timer = window.setTimeout(() => setToast(''), 2600)
  }

  const handleAssignmentSubmit = async (assignment, payload) => {
    const submittedAt = new Date().toISOString()
    const localSubmission = { ...payload, submittedAt, status: 'submitted' }
    setSubmissions((current) => ({ ...current, [assignment.id]: enrichSubmission(localSubmission, assignment) }))
    if (onSubmitAssignment) {
      const result = await onSubmitAssignment(assignment.id, localSubmission)
      if (result) {
        setSubmissions((current) => ({ ...current, [assignment.id]: enrichSubmission(result, assignment) }))
      }
    }
    setActiveAssignment(null)
    showToast('Assignment submitted and saved.')
    onMessage?.('')
  }

  return (
    <div className="-mx-4 -my-6 min-h-screen bg-surface text-main md:-mx-8 lg:-mx-10">
      <div className="border-b border-token bg-surface">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[1fr_360px] lg:py-8">
          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-token bg-surface-alt px-3 py-1 text-xs font-black text-main shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> Student experience
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                <Flame className="h-3.5 w-3.5" /> {stats.percent}% course momentum
              </span>
            </div>
            <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-main md:text-5xl">
              {course?.title || 'Student course'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted md:text-base">
              Jump into lessons, complete work, take quizzes, and keep every deadline in view from one focused classroom space.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => quizzes[0] && setActiveQuiz(quizzes[0])}
                disabled={!quizzes.length}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl primary-btn px-5 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play className="h-4 w-4" /> Start latest quiz
              </button>
              <button
                type="button"
                onClick={() => setActiveView('classwork')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-token bg-surface px-5 py-3 text-sm font-black text-main shadow-sm transition hover:border-token hover:bg-surface-alt focus:outline-none focus:ring-4 focus:ring-primary/10"
              >
                <BookOpen className="h-4 w-4" /> View classwork
              </button>
            </div>
          </div>
          <ProgressTracker stats={stats} upcoming={upcoming} />
        </div>
      </div>

      <div className="sticky top-0 z-20 border-b border-token bg-surface/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 md:px-6" aria-label="Student course sections">
          {[
            ['stream', LayoutDashboard, 'Stream'],
            ['classwork', BookOpen, 'Classwork'],
            ['people', Users, 'People'],
            ['grades', Timer, 'Grades'],
          ].map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveView(id)}
              className={`inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-primary/10 ${
                activeView === id ? 'bg-surface-alt text-main shadow-sm ring-1 ring-token' : 'text-muted hover:bg-surface hover:text-main'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      </div>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[1fr_340px]">
        <section className="min-w-0">
          {message ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{message}</div> : null}
          <AnimatePresence mode="wait">
            {activeView === 'stream' ? (
              <motion.div key="stream" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
                <StudentStream
                  feed={feed}
                  submissions={submissions}
                  quizResults={quizResults}
                  onOpenAssignment={setActiveAssignment}
                  onStartQuiz={setActiveQuiz}
                  onOpenModule={(module) => {
                    setExpandedModule(module.id)
                    setActiveView('classwork')
                  }}
                />
              </motion.div>
            ) : null}
            {activeView === 'classwork' ? (
              <motion.div key="classwork" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <ModuleAccordion
                  modules={modules}
                  assignments={assignments}
                  quizzes={quizzes}
                  expandedModule={expandedModule}
                  onToggle={setExpandedModule}
                  onOpenAssignment={setActiveAssignment}
                  onStartQuiz={setActiveQuiz}
                />
              </motion.div>
            ) : null}
            {activeView === 'people' ? (
              <motion.div key="people" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <section className="rounded-2xl border border-token bg-surface p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-main">People</h2>
                      <p className="mt-1 text-sm text-subtle">Your instructor and classmates in this course.</p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl border border-token bg-surface-alt p-4">
                    {courseId ? <PeopleList courseId={courseId} /> : <p className="text-sm text-subtle">People list unavailable.</p>}
                  </div>
                </section>
              </motion.div>
            ) : null}
            {activeView === 'grades' ? (
              <motion.div key="grades" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <ProgressDashboard stats={stats} assignments={assignments} quizzes={quizzes} modules={modules} submissions={submissions} quizResults={quizResults} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        <aside className="space-y-4">
          <AdaptiveInsightPanel courseId={courseId} role="student" compact />
          <NotificationsPanel announcements={announcements} upcoming={upcoming} />
          <AchievementPanel stats={stats} />
        </aside>
      </main>

      <AnimatePresence>
        {activeQuiz ? (
          <QuizPlayer
            quiz={activeQuiz}
            onClose={() => setActiveQuiz(null)}
            onFinish={(result) => {
              setQuizResults((current) => ({ ...current, [activeQuiz.id]: result }))
              showToast(result.pending ? 'Quiz submitted. Results will be posted after review.' : `Quiz submitted. Score: ${result.percent}%`)
            }}
          />
        ) : null}
        {activeAssignment ? (
          <AssignmentSubmission
            assignment={activeAssignment}
            submission={submissions[activeAssignment.id]}
            onClose={() => setActiveAssignment(null)}
            onSubmit={(payload) => handleAssignmentSubmit(activeAssignment, payload)}
            onDraft={(payload) => {
              setSubmissions((current) => ({ ...current, [activeAssignment.id]: { ...payload, status: 'draft' } }))
              showToast('Draft saved.')
            }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-token bg-surface px-4 py-3 text-sm font-black text-main shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> {toast}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function ProgressTracker({ stats, upcoming }) {
  return (
    <div className="rounded-[28px] border border-token bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-subtle">Overall progress</p>
          <p className="mt-1 text-4xl font-black text-main">{stats.percent}%</p>
        </div>
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-alt text-primary-token">
          <Trophy className="h-8 w-8" />
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-surface-alt" aria-label={`${stats.percent}% course progress`}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${stats.percent}%` }} className="h-full rounded-full bg-primary-token" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <MiniStat label="Quizzes" value={stats.completedQuizzes} />
        <MiniStat label="Work" value={stats.submittedAssignments} />
        <MiniStat label="Modules" value={stats.completedModules} />
      </div>
      <div className="mt-5 space-y-2">
        <p className="text-xs font-black uppercase tracking-wide text-subtle">Up next</p>
        {upcoming.length ? upcoming.slice(0, 2).map((item) => (
          <div key={`${item.title}-${item.due_at}`} className="flex items-center justify-between gap-3 rounded-xl bg-surface-alt px-3 py-2 text-xs font-bold text-main">
            <span className="truncate">{item.title} deadline</span>
            <span className="shrink-0 text-subtle">{formatDate(item.due_at)}</span>
          </div>
        )) : <p className="rounded-xl bg-surface-alt px-3 py-2 text-sm font-bold text-subtle">No upcoming deadlines.</p>}
      </div>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-token bg-surface-alt px-3 py-2">
      <p className="text-lg font-black text-main">{value}</p>
      <p className="text-[11px] font-bold text-subtle">{label}</p>
    </div>
  )
}

function StudentStream({ feed, submissions, quizResults, onOpenAssignment, onStartQuiz, onOpenModule }) {
  if (!feed.length) {
    return (
      <div className="rounded-2xl border border-dashed border-token bg-surface p-10 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-muted" />
        <h2 className="mt-4 text-xl font-black text-main">Nothing posted yet</h2>
        <p className="mt-2 text-sm font-semibold text-subtle">Announcements, modules, quizzes, and assignments will appear here.</p>
      </div>
    )
  }

  return feed.map(({ id, type, item }, index) => (
    <motion.article
      key={id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.2) }}
      className={`rounded-2xl border border-token bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${
        type === 'announcement' ? 'cursor-default' : 'cursor-pointer'
      }`}
      onClick={
        type === 'assignment'
          ? () => onOpenAssignment(item)
          : type === 'quiz'
            ? () => onStartQuiz(item)
            : type === 'module'
              ? () => onOpenModule(item)
              : undefined
      }
      role={type === 'announcement' ? undefined : 'button'}
      tabIndex={type === 'announcement' ? undefined : 0}
      aria-label={type === 'announcement' ? undefined : `Open ${type}: ${item.title}`}
      onKeyDown={
        type === 'announcement'
          ? undefined
          : (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                if (type === 'assignment') onOpenAssignment(item)
                if (type === 'quiz') onStartQuiz(item)
                if (type === 'module') onOpenModule(item)
              }
            }
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <FeedIcon type={type} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-surface-alt px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-main">{type}</span>
            <span className="text-xs font-bold text-subtle">{formatRelative(item.created_at || item.due_at)}</span>
            {type === 'assignment' ? <SubmissionStatus label={submissionLabel(submissions[item.id], item.due_at)} /> : null}
            {type === 'quiz' && quizResults[item.id] ? statusBadge('Completed', 'bg-emerald-100 text-emerald-700 border-emerald-200') : null}
          </div>
          <h2 className="mt-1 text-xl font-black tracking-tight text-main">{item.title}</h2>
          <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-muted">
            {item.body || item.instructions || item.description || 'Open this item to continue learning.'}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {item.due_at ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                <CalendarDays className="h-3.5 w-3.5" /> Due {formatDate(item.due_at)}
              </span>
            ) : null}
            {type === 'quiz' ? <ActionButton onClick={() => onStartQuiz(item)} icon={Zap} label={quizResults[item.id] ? 'Review quiz' : 'Start quiz'} ariaLabel={`Submit quiz: ${item.title}`} /> : null}
            {type === 'assignment' ? <ActionButton onClick={() => onOpenAssignment(item)} icon={UploadCloud} label={['submitted', 'late', 'graded', 'returned'].includes(submissions[item.id]?.status) ? 'View submission' : 'Submit work'} /> : null}
            {type === 'module' ? <ActionButton onClick={() => onOpenModule(item)} icon={BookOpen} label="Open module" /> : null}
          </div>
        </div>
      </div>
    </motion.article>
  ))
}

function FeedIcon({ type }) {
  const config = {
    announcement: [Megaphone, 'bg-amber-50 text-amber-700'],
    assignment: [UploadCloud, 'bg-sky-50 text-sky-700'],
    quiz: [Zap, 'bg-violet-50 text-violet-700'],
    module: [BookOpen, 'bg-emerald-50 text-emerald-700'],
  }[type] || [Bell, 'bg-surface-alt text-main']
  const [Icon, tone] = config
  return (
    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tone}`}>
      <Icon className="h-6 w-6" />
    </div>
  )
}

function ActionButton({ onClick, icon: Icon, label, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onClick?.(event)
      }}
      aria-label={ariaLabel}
      className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  )
}

function ModuleAccordion({ modules, assignments, quizzes, expandedModule, onToggle, onOpenAssignment, onStartQuiz }) {
  const fallbackModules = modules.length ? modules : [{ id: 'getting-started', title: 'Getting started', description: 'Course materials will appear here as modules are published.' }]
  return (
    <div className="space-y-4">
      {fallbackModules.map((module, index) => {
        const isOpen = expandedModule === module.id || (!expandedModule && index === 0)
        const moduleAssignments = assignments.filter((item) => !item.module_id || String(item.module_id) === String(module.id))
        const moduleQuizzes = quizzes.filter((item) => !item.module_id || String(item.module_id) === String(module.id))
        return (
          <section key={module.id} className="overflow-hidden rounded-2xl border border-token bg-surface shadow-sm">
            <button
              type="button"
              onClick={() => onToggle(isOpen ? null : module.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left focus:outline-none focus:ring-4 focus:ring-sky-100"
              aria-expanded={isOpen}
            >
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-emerald-600">Module {index + 1}</p>
                <h2 className="mt-1 text-xl font-black text-main">{module.title}</h2>
                <p className="mt-1 text-sm font-semibold text-subtle">{module.description || `${moduleAssignments.length + moduleQuizzes.length} activities`}</p>
              </div>
              <ChevronDown className={`h-5 w-5 shrink-0 text-subtle transition ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100">
                  <div className="grid gap-3 p-5">
                    <ModuleResource icon={Video} title="Interactive lesson" meta="Video and notes" />
                    <ModuleResource icon={FileText} title="Reading packet" meta="PDF resource" />
                    {moduleAssignments.map((assignment) => (
                      <ModuleResource key={assignment.id} icon={UploadCloud} title={assignment.title} meta={`Assignment - due ${formatDate(assignment.due_at)}`} action="Submit" onClick={() => onOpenAssignment(assignment)} />
                    ))}
                    {moduleQuizzes.map((quiz) => (
                      <ModuleResource key={quiz.id} icon={Zap} title={quiz.title} meta={`Quiz - due ${formatDate(quiz.due_at)}`} action="Start" onClick={() => onStartQuiz(quiz)} />
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>
        )
      })}
    </div>
  )
}

function ModuleResource({ icon: Icon, title, meta, action, onClick }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-token bg-surface-alt p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-muted shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-main">{title}</p>
          <p className="truncate text-xs font-bold text-subtle">{meta}</p>
        </div>
      </div>
      {action ? (
        <button type="button" onClick={onClick} className="rounded-xl secondary-btn px-3 py-2 text-xs font-black focus:outline-none focus:ring-4 focus:ring-primary/10">
          {action}
        </button>
      ) : <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}
    </div>
  )
}

function QuizPlayer({ quiz, onClose, onFinish }) {
  const questions = useMemo(() => getQuizQuestions(quiz), [quiz])
  const autosaveKey = `academee:quiz:${quiz.id || quiz.assignment_id || quiz.title}:draft`
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = window.localStorage.getItem(autosaveKey)
      return saved ? JSON.parse(saved)?.answers || {} : {}
    } catch (_error) {
      return {}
    }
  })
  const [secondsLeft, setSecondsLeft] = useState(Math.max(60, (quiz.time_limit_minutes || 15) * 60))
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const startedAt = useRef(Date.now())
  const question = questions[index]
  const answeredCount = questions.filter((item) => hasAnswer(answers[item.id])).length
  const unanswered = questions.length - answeredCount
  const progress = Math.round((answeredCount / questions.length) * 100)

  useEffect(() => {
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(autosaveKey, JSON.stringify({ answers, index, updatedAt: new Date().toISOString() }))
  }, [answers, index, autosaveKey])

  useEffect(() => {
    const warnBeforeExit = (event) => {
      if (result) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeExit)
    return () => window.removeEventListener('beforeunload', warnBeforeExit)
  }, [result])

  useEffect(() => {
    if (secondsLeft === 0 && !result && !submitting) submitQuiz()
  }, [secondsLeft, result, submitting])

  const updateAnswer = (value) => {
    setAnswers((current) => ({ ...current, [question.id]: value }))
  }

  const submitQuiz = async () => {
    setSubmitting(true)
    const correct = questions.reduce((total, item) => total + (isCorrect(item, answers[item.id]) ? 1 : 0), 0)
    const percent = Math.round((correct / questions.length) * 100)
    const computed = {
      score: correct,
      total: questions.length,
      percent,
      passed: percent >= Number(quiz.passing_percent || 70),
      timeTaken: Math.round((Date.now() - startedAt.current) / 1000),
      answers,
      questions,
      submittedAt: new Date().toISOString(),
      pending: questions.some((item) => item.type === 'short' || item.type === 'identification'),
    }

    try {
      if (quiz.assignment_id) {
        await apiFetch(`/api/assignments/${quiz.assignment_id}/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: {
              answers: questions.map((item, itemIndex) => ({
                questionId: item.id,
                chosen: answers[item.id],
                index: itemIndex,
              })),
              timeTaken: computed.timeTaken,
            },
          }),
        })
      }
      window.localStorage.removeItem(autosaveKey)
      setResult(computed)
      setConfirming(false)
      onFinish(computed)
    } catch (error) {
      console.error(error)
      setResult({ ...computed, pending: true, submitError: 'Your answers are saved locally, but the final submission did not reach the server. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return <QuizResults quiz={quiz} result={result} onClose={onClose} onReview={(questionIndex) => {
      setResult(null)
      setIndex(questionIndex)
    }} />
  }

  return (
    <motion.div className="fixed inset-0 z-[60] overflow-hidden bg-surface text-main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex h-screen flex-col">
        <QuizHeader
          quiz={quiz}
          questionIndex={index}
          totalQuestions={questions.length}
          secondsLeft={secondsLeft}
          answeredCount={answeredCount}
          unanswered={unanswered}
          progress={progress}
          onClose={onClose}
        />

        <div className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-cols-1 gap-0 lg:grid-cols-[280px_1fr]">
          <QuizNavigator
            questions={questions}
            answers={answers}
            currentIndex={index}
            onJump={setIndex}
          />

          <main className="flex min-h-0 flex-col overflow-y-auto px-4 py-6 md:px-8">
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
              <AnimatePresence mode="wait">
                <QuestionCard key={question.id} question={question} answer={answers[question.id]} onAnswer={updateAnswer} />
              </AnimatePresence>
            </div>
          </main>
        </div>

        <footer className="border-t border-token bg-surface px-4 py-4">
          <div className="mx-auto flex max-w-7xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-token bg-surface px-5 py-3 text-sm font-black text-main transition hover:bg-surface-alt disabled:opacity-40">
              <ChevronLeft className="h-5 w-5" /> Previous
            </button>
            <p className="text-center text-xs font-bold text-subtle">
              Saved automatically • {unanswered} unanswered
            </p>
            {index < questions.length - 1 ? (
              <button type="button" onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl primary-btn px-5 py-3 text-sm font-black">
                Next <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button type="button" onClick={() => setConfirming(true)} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl primary-btn px-5 py-3 text-sm font-black">
                Submit quiz <Send className="h-5 w-5" />
              </button>
            )}
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {confirming ? (
          <ConfirmSubmit
            answered={answeredCount}
            total={questions.length}
            unanswered={unanswered}
            submitting={submitting}
            onCancel={() => setConfirming(false)}
            onConfirm={submitQuiz}
          />
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

function QuizHeader({ quiz, questionIndex, totalQuestions, secondsLeft, answeredCount, unanswered, progress, onClose }) {
  return (
    <header className="sticky top-0 z-10 border-b border-token bg-surface/95 px-4 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <button type="button" onClick={onClose} className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-token bg-surface px-3 py-2 text-sm font-black text-main hover:bg-surface-alt focus:outline-none focus:ring-4 focus:ring-primary/10">
          <ArrowLeft className="h-4 w-4" /> Leave
        </button>
        <div className="min-w-0 flex-1 md:px-4">
          <p className="truncate text-sm font-black text-main">{quiz.title || 'Quiz'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-subtle">
            <span>Question {questionIndex + 1} of {totalQuestions}</span>
            <QuizTimer secondsLeft={secondsLeft} />
            <span>{unanswered} remaining</span>
            <span>{answeredCount} answered</span>
          </div>
          <QuizProgressBar value={progress} />
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
          Autosaved
        </span>
      </div>
    </header>
  )
}

function QuizTimer({ secondsLeft }) {
  return <span>{formatSeconds(secondsLeft)} remaining</span>
}

function QuizProgressBar({ value }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-alt" aria-label={`${value}% answered`}>
      <motion.div className="h-full rounded-full bg-primary-token" animate={{ width: `${value}%` }} />
    </div>
  )
}

function QuizNavigator({ questions, answers, currentIndex, onJump }) {
  return (
    <aside className="hidden min-h-0 border-r border-token bg-surface p-5 lg:block">
      <div className="sticky top-24">
        <h2 className="text-sm font-black text-main">Question navigator</h2>
        <p className="mt-1 text-xs font-semibold leading-5 text-subtle">Jump freely between questions and review unanswered items before submitting.</p>
        <div className="mt-5 grid grid-cols-5 gap-2">
          {questions.map((question, questionIndex) => {
            const answered = hasAnswer(answers[question.id])
            const active = currentIndex === questionIndex
            return (
              <button
                key={question.id}
                type="button"
                onClick={() => onJump(questionIndex)}
                className={`grid h-11 w-11 place-items-center rounded-xl border text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
                  active
                    ? 'border-primary-token bg-primary-token text-white'
                    : answered
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-token bg-surface text-subtle hover:bg-surface-alt'
                }`}
                aria-label={`Go to question ${questionIndex + 1}${answered ? ', answered' : ', unanswered'}`}
              >
                {questionIndex + 1}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

function QuestionCard({ question, answer, onAnswer }) {
  const isCheckbox = question.type === 'checkbox'
  const isShortAnswer = question.type === 'short' || question.type === 'identification' || !question.options?.length
  const options = question.type === 'boolean' ? ['True', 'False'] : question.options
  return (
    <motion.section initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] md:p-8">
      <p className="text-sm font-black uppercase tracking-wide text-subtle">{isShortAnswer ? 'Written response' : isCheckbox ? 'Select all that apply' : 'Choose the best answer'}</p>
      <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight text-main md:text-4xl">{question.text}</h2>
      {question.image_url || question.media_url ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-token bg-surface-alt">
          <img src={question.image_url || question.media_url} alt="" className="max-h-[360px] w-full object-contain" />
        </div>
      ) : null}
      {isShortAnswer ? (
        <textarea
          value={answer || ''}
          onChange={(event) => onAnswer(event.target.value)}
                    className="mt-8 min-h-[180px] w-full resize-none rounded-2xl border border-token bg-surface-alt p-5 text-lg font-semibold text-main outline-none transition focus:ring-4 focus:ring-primary/10"
          placeholder="Type your answer here..."
          aria-label="Short answer response"
        />
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {options.map((option, optionIndex) => {
            const selected = isCheckbox ? Array.isArray(answer) && answer.includes(optionIndex) : answer === optionIndex
            return (
              <AnswerCard
                key={`${option}-${optionIndex}`}
                label={option}
                selected={selected}
                onClick={() => {
                  if (isCheckbox) {
                    const current = Array.isArray(answer) ? answer : []
                    onAnswer(current.includes(optionIndex) ? current.filter((item) => item !== optionIndex) : [...current, optionIndex])
                  } else {
                    onAnswer(optionIndex)
                  }
                }}
              />
            )
          })}
        </div>
      )}
    </motion.section>
  )
}

function AnswerCard({ label, selected, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex min-h-[96px] items-center gap-4 rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
        selected ? 'border-emerald-200 bg-emerald-50 text-main shadow-sm' : 'border-token bg-surface text-main hover:border-token hover:bg-surface-alt'
      }`}
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-sm font-black ${selected ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-token bg-surface-alt text-subtle group-hover:border-token'}`}>
        {selected ? <Check className="h-5 w-5" /> : null}
      </span>
      <span className="text-lg font-black leading-snug">{label}</span>
    </motion.button>
  )
}

function ConfirmSubmit({ answered, total, unanswered, submitting, onCancel, onConfirm }) {
  return (
    <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }} className="w-full max-w-md rounded-[28px] bg-surface p-6 text-main shadow-2xl">
        <h2 className="text-2xl font-black">Submit quiz?</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-muted">
          You answered {answered} of {total} questions. {unanswered > 0 ? 'You still have unanswered questions. Are you sure you want to submit?' : 'Review your work one last time before sending your final attempt.'}
        </p>
        <div className="mt-4 rounded-2xl border border-token bg-surface-alt p-4 text-sm font-bold text-main">
          <div className="flex justify-between"><span>Answered</span><span>{answered}</span></div>
          <div className="mt-2 flex justify-between"><span>Unanswered</span><span className={unanswered ? 'text-amber-700' : 'text-emerald-700'}>{unanswered}</span></div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={submitting} className="rounded-xl border border-token px-4 py-3 text-sm font-black text-main hover:bg-surface-alt disabled:opacity-50">Review answers</button>
          <button type="button" onClick={onConfirm} disabled={submitting} className="rounded-xl primary-btn px-4 py-3 text-sm font-black disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit now'}</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function QuizResults({ quiz, result, onClose, onReview }) {
  const reviewable = !result.pending
  return (
    <motion.div className="fixed inset-0 z-[60] overflow-y-auto bg-surface text-main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="rounded-[28px] border border-token bg-surface p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-subtle">Quiz submitted</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-main">{quiz.title || 'Quiz results'}</h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-muted">
                {result.pending ? 'Some responses may require instructor review before a final grade is available.' : result.passed ? 'You met the passing score for this quiz.' : 'Review the items below and revisit the related course material.'}
              </p>
            </div>
            <div className="rounded-2xl border border-token bg-surface-alt p-5 text-center">
              <p className="text-xs font-black uppercase tracking-wide text-subtle">Score</p>
              <p className="mt-1 text-5xl font-black text-main">{result.pending ? '--' : `${result.percent}%`}</p>
              <p className="mt-1 text-xs font-bold text-subtle">{result.score} of {result.total} auto-graded</p>
            </div>
          </div>

          {result.submitError ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
              {result.submitError}
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ResultMetric label="Time taken" value={formatSeconds(result.timeTaken)} />
            <ResultMetric label="Status" value={result.pending ? 'Pending review' : result.passed ? 'Passed' : 'Needs review'} />
            <ResultMetric label="Submitted" value={formatDate(result.submittedAt)} />
          </div>

          <div className="mt-8 space-y-3">
            <h2 className="text-lg font-black text-main">Answer review</h2>
            {result.questions.map((question, questionIndex) => {
              const correct = isCorrect(question, result.answers[question.id])
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => reviewable && onReview(questionIndex)}
                  className="flex w-full items-start justify-between gap-4 rounded-2xl border border-token bg-surface p-4 text-left transition hover:bg-surface-alt disabled:cursor-default"
                  disabled={!reviewable}
                >
                  <div>
                    <p className="text-sm font-black text-main">Question {questionIndex + 1}</p>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold text-muted">{question.text}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${correct ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {correct ? 'Correct' : question.type === 'short' || question.type === 'identification' ? 'Review' : 'Incorrect'}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <button type="button" onClick={onClose} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800">Return to course</button>
          </div>
        </section>
      </main>
    </motion.div>
  )
}

function ResultMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-subtle">{label}</p>
      <p className="mt-1 text-lg font-black text-main">{value}</p>
    </div>
  )
}

function isCorrect(question, answer) {
  if (question.type === 'short' || question.type === 'identification') return String(answer || '').toLowerCase().includes(String(question.correctText || question.correct || '').toLowerCase())
  if (Array.isArray(question.correct)) {
    return Array.isArray(answer) && question.correct.length === answer.length && question.correct.every((item) => answer.includes(item))
  }
  return answer === question.correct
}

function hasAnswer(answer) {
  if (Array.isArray(answer)) return answer.length > 0
  return answer !== undefined && answer !== null && String(answer).trim() !== ''
}

function formatSeconds(value) {
  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function AssignmentSubmission({ assignment, submission, onClose, onSubmit, onDraft }) {
  const submissionContent = parseContentWithAttachments(submission?.content || submission)
  const [files, setFiles] = useState(submissionContent.files || [])
  const [note, setNote] = useState(submissionContent.text || '')
  const [saving, setSaving] = useState(false)
  const statusValue = getSubmissionStatus(submission, assignment?.due_at)
  const status =
    statusValue === 'submitted'
      ? 'Submitted'
      : statusValue === 'late'
        ? 'Late'
        : statusValue === 'graded'
          ? 'Graded'
          : statusValue === 'returned'
            ? 'Returned'
            : statusValue === 'missing'
              ? 'Missing'
              : 'Draft'
  const resourceFiles = parseAttachments(assignment.attachment_url)

  const payload = { files, note }

  return (
    <motion.div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/60 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="mx-auto my-6 max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700">Assignment</span>
              <SubmissionStatus label={status} />
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-main">{assignment.title}</h2>
            <p className="mt-2 text-sm font-bold text-subtle">Due {formatDate(assignment.due_at)} - {assignment.points || 100} points</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-subtle hover:bg-surface-alt focus:outline-none focus:ring-4 focus:ring-primary/10" aria-label="Close assignment">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_360px]">
          <section>
            <h3 className="text-sm font-black uppercase tracking-wide text-subtle">Instructions</h3>
            <p className="mt-3 rounded-2xl bg-surface-alt p-4 text-sm font-semibold leading-7 text-main">{assignment.instructions || 'Complete the task and upload your work before the deadline.'}</p>
            <div className="mt-5">
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-subtle">Teacher resources</h4>
              <FileAttachmentList files={resourceFiles} emptyLabel="No teacher resources attached." />
            </div>
          </section>

          <section>
            <FileUploadDropzone
              files={files}
              onChange={setFiles}
              label="Upload your work"
              description="Attach files, preview them, and remove anything before submitting"
            />
            <label className="mt-4 block text-sm font-black text-main" htmlFor="student-note">Private note</label>
            <textarea id="student-note" value={note} onChange={(event) => setNote(event.target.value)} className="mt-2 min-h-[100px] w-full rounded-2xl border border-token p-4 text-sm font-semibold outline-none focus:ring-4 focus:ring-primary/10" placeholder="Add a note for your instructor..." />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => onDraft(payload)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">Save draft</button>
              <button
                type="button"
                disabled={saving || (!files.length && !note.trim())}
                onClick={async () => {
                  setSaving(true)
                  try {
                    await onSubmit(payload)
                  } finally {
                    setSaving(false)
                  }
                }}
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submission?.submitted_at ? 'Resubmit' : saving ? 'Submitting...' : 'Submit work'}
              </button>
            </div>
            {submission?.submitted_at ? <p className="mt-3 text-xs font-bold text-slate-500">Submitted {formatDate(submission.submitted_at)}</p> : null}
          </section>
        </div>
      </motion.div>
    </motion.div>
  )
}

function UploadZone({ inputRef, isDragging, setIsDragging, onFiles }) {
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        onFiles(event.dataTransfer.files)
      }}
      className={`flex min-h-[190px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition focus:outline-none focus:ring-4 focus:ring-sky-100 ${
        isDragging ? 'border-sky-400 bg-sky-50' : 'border-slate-300 bg-slate-50 hover:border-sky-300 hover:bg-sky-50'
      }`}
    >
      <UploadCloud className="h-10 w-10 text-sky-600" />
      <span className="mt-3 text-base font-black text-slate-950">Drop files or browse</span>
      <span className="mt-1 text-xs font-bold text-slate-500">PDF, DOCX, PPT, ZIP, images, and videos</span>
    </button>
  )
}

function FilePreview({ file, onRemove }) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const Icon = fileTypeIcons[extension] || FileText
  return (
    <div className="rounded-2xl border border-slate-200 p-3">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-800">{file.name}</p>
          <p className="text-xs font-bold text-slate-500">{Math.max(1, Math.round(file.size / 1024))} KB</p>
        </div>
        <button type="button" onClick={onRemove} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${file.name}`}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${file.progress || 0}%` }} />
      </div>
    </div>
  )
}

function SubmissionStatus({ label }) {
  const tones = {
    Submitted: 'bg-emerald-100 text-emerald-700',
    Missing: 'bg-rose-100 text-rose-700',
    Draft: 'bg-amber-100 text-amber-800',
    Ready: 'bg-slate-100 text-slate-700',
    Graded: 'bg-violet-100 text-violet-700',
    Late: 'bg-amber-100 text-amber-800',
    Returned: 'bg-sky-100 text-sky-700',
  }
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${tones[label] || tones.Ready}`}>{label}</span>
}

function NotificationsPanel({ announcements, upcoming }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-950">Reminders</h2>
        <Bell className="h-5 w-5 text-slate-400" />
      </div>
      <div className="mt-4 space-y-3">
        {announcements.slice(0, 2).map((item) => (
          <div key={item.id} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
            <p className="text-xs font-black uppercase text-amber-700">Announcement</p>
            <p className="mt-1 text-sm font-black text-slate-800">{item.title}</p>
          </div>
        ))}
        {upcoming.map((item) => (
          <div key={`${item.id}-${item.due_at}`} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-800">{item.title} reminder</p>
              <p className="text-xs font-bold text-slate-500">Due {formatDate(item.due_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function AchievementPanel({ stats }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <h2 className="text-base font-black text-slate-950">Achievements</h2>
      <div className="mt-4 grid gap-3">
        <Achievement icon={Award} label="Course streak" value={`${Math.max(1, stats.done)} days`} active />
        <Achievement icon={Zap} label="Quiz energy" value={`${stats.completedQuizzes} done`} active={stats.completedQuizzes > 0} />
        <Achievement icon={CheckCircle2} label="Submission flow" value={`${stats.submittedAssignments} sent`} active={stats.submittedAssignments > 0} />
      </div>
    </section>
  )
}

function Achievement({ icon: Icon, label, value, active }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-3 ${active ? 'border-emerald-100 bg-emerald-50/70' : 'border-slate-100 bg-slate-50 opacity-70'}`}>
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-400'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-black text-slate-800">{label}</p>
        <p className="text-xs font-bold text-slate-500">{value}</p>
      </div>
    </div>
  )
}

function ProgressDashboard({ stats, assignments, quizzes, modules, submissions, quizResults }) {
  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
        <h2 className="text-2xl font-black text-slate-950">Grades and progress</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <ProgressCard icon={Zap} label="Completed quizzes" value={`${stats.completedQuizzes}/${quizzes.length}`} color="bg-violet-100 text-violet-700" />
          <ProgressCard icon={UploadCloud} label="Submitted assignments" value={`${stats.submittedAssignments}/${assignments.length}`} color="bg-sky-100 text-sky-700" />
          <ProgressCard icon={BookOpen} label="Module completion" value={`${stats.completedModules}/${modules.length}`} color="bg-emerald-100 text-emerald-700" />
        </div>
      </section>
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
        <h2 className="text-lg font-black text-slate-950">Activity status</h2>
        <div className="mt-4 space-y-3">
          {[...assignments.map((item) => ({ ...item, type: 'assignment' })), ...quizzes.map((item) => ({ ...item, type: 'quiz' }))].map((item) => {
            const done = item.type === 'assignment' ? ['submitted', 'late', 'graded', 'returned'].includes(submissions[item.id]?.status) : quizResults[item.id]?.submittedAt
            return (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-800">{item.title}</p>
                  <p className="text-xs font-bold text-slate-500">{item.type} - due {formatDate(item.due_at)}</p>
                </div>
                {done ? statusBadge('Complete', 'bg-emerald-100 text-emerald-700 border-emerald-200') : statusBadge('Open', 'bg-slate-100 text-slate-700 border-slate-200')}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function ProgressCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-2xl font-black text-slate-950">{value}</p>
      <p className="text-sm font-bold text-slate-500">{label}</p>
    </div>
  )
}
