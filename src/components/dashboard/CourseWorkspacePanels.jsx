import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  ChevronDown,
  ClipboardList,
  FileText,
  GraduationCap,
  Layers,
  Megaphone,
  MoreVertical,
  PenLine,
  Plus,
  Settings,
  Share2,
  Users,
} from 'lucide-react'
import Loading from '../Loading'
import PeopleList from './PeopleList'
import SubmissionsPanel from './SubmissionsPanel'
import TeacherStudentProgress from './TeacherStudentProgress'
import AdaptiveInsightPanel from '../adaptive/AdaptiveInsightPanel'
import {
  AnnouncementActivityCard,
  AssignmentActivityCard,
  QuizActivityCard,
  ModuleActivityCard,
} from '../stream/ActivityCards'

function formatDate(value) {
  if (!value) return 'No due date'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'No due date' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(value) {
  if (!value) return 'Recently'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function EmptyPanel({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-2xl border border-dashed border-token bg-surface p-8 text-center">
      <p className="text-sm font-semibold text-mian">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="mt-5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">
          {actionLabel}
        </button>
      ) : null}
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

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-token bg-w p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-main">{value}</p>
    </div>
  )
}

export function CourseWorkspaceHeader({ course, isTeacher, onCustomize, onShare }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-token bg-surface shadow-sm">
      <div className="border-b border-token bg-surface px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Course workspace</p>
            <h1 className="mt-2 truncate text-3xl font-bold tracking-tight text-main">{course?.title || 'Course'}</h1>
            {course?.description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{course.description}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onShare} className="inline-flex items-center gap-2 rounded-xl border border-token bg-surface px-3.5 py-2 text-sm font-semibold text-main transition hover:bg-surface-alt">
              <Share2 className="h-4 w-4" /> Share
            </button>
            {isTeacher ? (
              <button type="button" onClick={onCustomize} className="inline-flex items-center gap-2 rounded-xl border border-token bg-surface px-3.5 py-2 text-sm font-semibold text-main transition hover:bg-surface-alt">
                <Settings className="h-4 w-4" /> Settings
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
        <SummaryCard label="Modules" value={course?.module_count ?? '-'} />
        <SummaryCard label="Class code" value={course?.course_code || 'Private'} />
        <SummaryCard label="Role" value={isTeacher ? 'Teacher' : 'Student'} />
      </div>
    </section>
  )
}

export function CourseStreamPanel({ 
  courseId, 
  announcements = [], 
  assignments = [], 
  quizzes = [], 
  isTeacher, 
  onAddAnnouncement,
  onEditItem,
  onDeleteItem,
  onViewSubmissions
}) {
  const navigate = useNavigate()
  
  // Get teacher name and avatar from localStorage or default
  const teacherName = localStorage.getItem('userName') || 'Teacher'
  const teacherAvatar = localStorage.getItem('userAvatar') || null

  const feedItems = useMemo(() => {
    const items = [
      ...announcements.map((item) => ({
        id: `ann-${item.id}`,
        type: 'announcement',
        data: item,
        timestamp: item.created_at,
      })),
      ...assignments.map((item) => ({
        id: `asg-${item.id}`,
        type: 'assignment',
        data: item,
        timestamp: item.created_at,
      })),
      ...quizzes.map((item) => ({
        id: `quiz-${item.id}`,
        type: 'quiz',
        data: item,
        timestamp: item.created_at,
      })),
    ]
    return items.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
  }, [announcements, assignments, quizzes])

  // Get upcoming items for sidebar
  const upcomingItems = useMemo(() => {
    return [...assignments, ...quizzes]
      .filter((item) => item.due_at)
      .sort((a, b) => new Date(a.due_at) - new Date(b.due_at))
      .slice(0, 5)
  }, [assignments, quizzes])

  return (
    <WorkspaceShell
      title="Stream"
      description="Class updates, reminders, and recently posted work. Keep discussion lightweight here; build learning content in Classwork."
      aside={
        <div className="rounded-2xl border border-token bg-surface p-4 shadow-sm">
          <p className="text-sm font-semibold text-main">📋 Upcoming</p>
          <div className="mt-3 space-y-2 text-sm text-muted">
            {upcomingItems.length > 0 ? (
              upcomingItems.map((item) => (
                <div key={`${item.id}-${item.due_at}`} className="rounded-xl bg-surface p-3 border border-token hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer">
                  <p className="font-semibold text-main line-clamp-1">{item.title} deadline</p>
                  <p className="mt-1 text-xs text-muted">{formatDate(item.due_at)}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted">No due dates yet.</p>
            )}
          </div>
        </div>
      }
    >
      {isTeacher ? (
        <button
          type="button"
          onClick={onAddAnnouncement}
          className="flex w-full items-center gap-3 rounded-2xl border border-token bg-surface p-4 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/40"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-700">
            <Megaphone className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-main">Share an announcement</span>
            <span className="block text-xs text-muted">Post a reminder or class update.</span>
          </span>
        </button>
      ) : null}

      <div className="space-y-4">
        {feedItems.length > 0 ? (
          feedItems.map((item) => {
            const { id, type, data } = item

            if (type === 'announcement') {
              return (
                <AnnouncementActivityCard
                  key={id}
                  announcement={data}
                  isTeacher={isTeacher}
                  teacherName={teacherName}
                  teacherAvatar={teacherAvatar}
                  onEdit={onEditItem ? () => onEditItem('announcement', data) : undefined}
                  onDelete={onDeleteItem ? () => onDeleteItem('announcement', data) : undefined}
                  onPin={() => {}}
                  onClick={() => {}} // Could be used to navigate to a thread
                />
              )
            }

            if (type === 'assignment') {
              return (
                <AssignmentActivityCard
                  key={id}
                  assignment={data}
                  isTeacher={isTeacher}
                  userSubmission={null}
                  teacherName={teacherName}
                  teacherAvatar={teacherAvatar}
                  onEdit={onEditItem ? () => onEditItem('assignment', data) : undefined}
                  onDelete={onDeleteItem ? () => onDeleteItem('assignment', data) : undefined}
                  onSubmit={() => {}}
                  onViewSubmissions={onViewSubmissions ? () => onViewSubmissions(data) : undefined}
                  onClick={onViewSubmissions ? () => onViewSubmissions(data) : undefined}
                />
              )
            }

            if (type === 'quiz') {
              return (
                <QuizActivityCard
                  key={id}
                  quiz={data}
                  isTeacher={isTeacher}
                  userAttempt={null}
                  teacherName={teacherName}
                  teacherAvatar={teacherAvatar}
                  onStart={() => !isTeacher && navigate(`/courses/${courseId}/quiz/${data.id}/take`)}
                  onEdit={onEditItem ? () => onEditItem('quiz', data) : undefined}
                  onDelete={onDeleteItem ? () => onDeleteItem('quiz', data) : undefined}
                  onClick={() => !isTeacher && navigate(`/courses/${courseId}/quiz/${data.id}/take`)}
                />
              )
            }

            return null
          })
        ) : (
          <EmptyPanel
            title="No stream activity yet"
            description="Announcements and newly posted work will appear here."
            actionLabel={isTeacher ? 'Post announcement' : ''}
            onAction={isTeacher ? onAddAnnouncement : undefined}
          />
        )}
      </div>
    </WorkspaceShell>
  )
}

function ItemRow({ icon: Icon, title, meta, description, badge, onEdit, onDelete, onViewSubmissions }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-token bg-surface p-4 transition hover:border-token sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-surface text-muted"><Icon className="h-5 w-5" /></span>
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
        {onViewSubmissions ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onViewSubmissions()
            }}
            className="rounded-xl border border-token px-3 py-2 text-xs font-semibold text-main hover:bg-surface-alt"
          >
            Submissions
          </button>
        ) : null}
        {onEdit ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEdit()
            }}
            className="rounded-xl border border-token px-3 py-2 text-xs font-semibold text-main hover:bg-surface-alt"
          >
            Edit
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete()
            }}
            className="rounded-xl border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        ) : null}
      </div>
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
        <ChevronDown className={`h-5 w-5 text-muted transition ${open ? '' : '-rotate-90'}`} />
      </button>
      {open ? <div className="space-y-3 p-4 sm:p-5">{children}</div> : null}
    </section>
  )
}

export function CourseClassworkWorkspace({
  modules = [],
  assignments = [],
  quizzes = [],
  isTeacher,
  onAddModule,
  onAddAssignment,
  onAddReviewer,
  onAddQuiz,
  onEditItem,
  onDeleteItem,
  onViewSubmissions,
}) {
  return (
    <WorkspaceShell
      title="Classwork"
      description="The organized learning workspace for modules, reviewers, assignments, quizzes, and resources."
      aside={(
        <div className="rounded-2xl border border-token bg-surface p-4 shadow-sm">
          <p className="text-sm font-semibold text-muted">Create</p>
          <div className="mt-3 grid gap-2">
            {isTeacher ? (
              <>
                <button type="button" onClick={onAddModule} className="inline-flex items-center gap-2 rounded-xl border border-token px-3 py-2 text-sm font-semibold text-main hover:bg-surface-alt"><Layers className="h-4 w-4" /> Module</button>
                <button type="button" onClick={onAddReviewer} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"><BookOpen className="h-4 w-4" /> Reviewer</button>
                <button type="button" onClick={onAddQuiz} className="inline-flex items-center gap-2 rounded-xl border border-token px-3 py-2 text-sm font-semibold text-main hover:bg-surface-alt"><PenLine className="h-4 w-4" /> Quiz</button>
                <button type="button" onClick={onAddAssignment} className="inline-flex items-center gap-2 rounded-xl border border-token px-3 py-2 text-sm font-semibold text-main hover:bg-surface-alt"><ClipboardList className="h-4 w-4" /> Assignment</button>
              </>
            ) : <p className="text-sm text-muted">Your class materials are organized by topic.</p>}
          </div>
        </div>
      )}
    >
      <TopicSection title="Topics / Modules" count={modules.length}>
        {modules.map((item) => (
          <ItemRow key={item.id} icon={Layers} title={item.title} description={item.description} badge="Module" onEdit={isTeacher ? () => onEditItem('module', item) : undefined} onDelete={isTeacher ? () => onDeleteItem('module', item) : undefined} />
        ))}
        {modules.length === 0 ? <EmptyPanel title="No modules yet" description="Create topics to group classwork into a clear learning path." actionLabel={isTeacher ? 'Create module' : ''} onAction={isTeacher ? onAddModule : undefined} /> : null}
      </TopicSection>

      <TopicSection title="Reviewers" count={0}>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="font-semibold text-emerald-950">Modern reviewer sets</h4>
              <p className="mt-1 text-sm leading-6 text-emerald-800">Create flashcards, practice quizzes, mock tests, matching activities, identification, and study notes.</p>
            </div>
            {isTeacher ? <button type="button" onClick={onAddReviewer} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"><Plus className="h-4 w-4" /> Create Reviewer</button> : null}
          </div>
        </div>
      </TopicSection>

      <TopicSection title="Assignments" count={assignments.length}>
        {assignments.map((item) => (
          <ItemRow key={item.id} icon={ClipboardList} title={item.title} description={item.instructions} meta={formatDate(item.due_at)} badge="Assignment" onViewSubmissions={isTeacher ? () => onViewSubmissions?.(item) : undefined} onEdit={isTeacher ? () => onEditItem('assignment', item) : undefined} onDelete={isTeacher ? () => onDeleteItem('assignment', item) : undefined} />
        ))}
        {assignments.length === 0 ? <EmptyPanel title="No assignments yet" description="Assignments will appear here once created." actionLabel={isTeacher ? 'Create assignment' : ''} onAction={isTeacher ? onAddAssignment : undefined} /> : null}
      </TopicSection>

      <TopicSection title="Quizzes" count={quizzes.length}>
        {quizzes.map((item) => (
          <ItemRow key={item.id} icon={PenLine} title={item.title} description={item.description} meta={formatDate(item.due_at)} badge="Quiz" onEdit={isTeacher ? () => onEditItem('quiz', item) : undefined} onDelete={isTeacher ? () => onDeleteItem('quiz', item) : undefined} />
        ))}
        {quizzes.length === 0 ? <EmptyPanel title="No quizzes yet" description="Formal assessments will appear here once created." actionLabel={isTeacher ? 'Create quiz' : ''} onAction={isTeacher ? onAddQuiz : undefined} /> : null}
      </TopicSection>

      <TopicSection title="Resources" count={0} defaultOpen={false}>
        <EmptyPanel title="No resources yet" description="Files, references, and links can be grouped here as the course grows." />
      </TopicSection>
    </WorkspaceShell>
  )
}

export function CoursePeoplePanel({ courseId }) {
  return (
    <WorkspaceShell title="People" description="Instructors and students enrolled in this course." aside={null}>
      <div className="rounded-2xl border border-token bg-surface p-5 shadow-sm">
        <PeopleList courseId={courseId} />
      </div>
    </WorkspaceShell>
  )
}

export function CourseGradesPanel({ isTeacher, courseId, loadingGrades, studentGrades = [] }) {
  if (isTeacher) {
    return (
      <WorkspaceShell
        title="Grades"
        description="Review submissions, learner progress, and course analytics."
        aside={<AdaptiveInsightPanel courseId={courseId} role="teacher" compact />}
      >
        <div className="rounded-2xl border border-token bg-surface p-5 shadow-sm">
          <TeacherStudentProgress courseId={courseId} />
        </div>
      </WorkspaceShell>
    )
  }

  return (
    <WorkspaceShell
      title="Grades"
      description="Track your scores, feedback, submission status, and reviewer progress."
      aside={<AdaptiveInsightPanel courseId={courseId} role="student" compact />}
    >
      {loadingGrades ? <Loading message="Loading your grades..." /> : null}
      {!loadingGrades && studentGrades.length === 0 ? <EmptyPanel title="No grades yet" description="Scores and teacher feedback will appear after work is submitted and reviewed." /> : null}
      {!loadingGrades && studentGrades.length > 0 ? (
        <div className="space-y-3">
          {studentGrades.map((item) => (
            <article key={`${item.type}-${item.id}`} className="rounded-2xl border border-token bg-surface p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{item.type}</p>
                  <h3 className="mt-1 text-lg font-semibold text-main">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted">Due: {formatDate(item.dueAt)}</p>
                </div>
                <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-main">
                  {item.submission ? (item.submission.score !== null && item.submission.score !== undefined ? 'Graded' : 'Submitted') : 'Not submitted'}
                </span>
              </div>
              {item.submission?.feedback ? (
                <div className="mt-4 rounded-2xl bg-surface p-4 text-sm leading-6 text-muted">
                  <p className="font-semibold text-main">Feedback</p>
                  <p className="mt-1 whitespace-pre-wrap">{item.submission.feedback}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </WorkspaceShell>
  )
}

export function SelectedSubmissionOverlay({ assignment, courseId, onClose }) {
  if (!assignment) return null
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface p-4">
      <div className="mx-auto my-8 max-w-5xl">
        <SubmissionsPanel assignment={assignment} courseId={courseId} onClose={onClose} />
      </div>
    </div>
  )
}
