import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Megaphone } from 'lucide-react'
import {
  AnnouncementActivityCard,
  AssignmentActivityCard,
  QuizActivityCard,
} from '../stream/ActivityCards'

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

/**
 * StudentStreamPanel
 * 
 * Student-friendly view of course stream showing:
 * - Class announcements
 * - Assignment updates
 * - Quiz availability
 * - Upcoming deadlines sidebar
 * 
 * Removes teacher-only actions (edit, delete, pin).
 * Maintains consistent teacher UI styling.
 */
export default function StudentStreamPanel({
  courseId,
  announcements = [],
  assignments = [],
  quizzes = [],
  userSubmissions = {},
  userQuizAttempts = {},
  onViewAssignment,
}) {
  const navigate = useNavigate()

  // Get teacher name and avatar from localStorage or default
  const teacherName = localStorage.getItem('userName') || 'Teacher'
  const teacherAvatar = localStorage.getItem('userAvatar') || null

  // Build combined feed sorted by date
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
      description="Class updates, reminders, and recently posted work."
      aside={
        <div className="rounded-2xl border border-token bg-surface p-4 shadow-sm">
          <p className="text-sm font-semibold text-main">📋 Upcoming</p>
          <div className="mt-3 space-y-2 text-sm text-muted">
            {upcomingItems.length > 0 ? (
              upcomingItems.map((item) => (
                <div
                  key={`${item.id}-${item.due_at}`}
                  className="rounded-xl bg-surface p-3 border border-token hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer"
                  onClick={() => {
                    if (item.type === 'assignment') {
                      onViewAssignment?.(item)
                    } else if (item.type === 'quiz') {
                      navigate(`/courses/${courseId}/quiz/${item.id}/take`)
                    }
                  }}
                >
                  <p className="font-semibold text-main line-clamp-1">{item.title}</p>
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
      <div className="space-y-4">
        {feedItems.length > 0 ? (
          feedItems.map((item) => {
            const { id, type, data } = item

            if (type === 'announcement') {
              return (
                <AnnouncementActivityCard
                  key={id}
                  announcement={data}
                  isTeacher={false}
                  teacherName={teacherName}
                  teacherAvatar={teacherAvatar}
                  onClick={() => {}}
                />
              )
            }

            if (type === 'assignment') {
              const submission = userSubmissions[data.id]
              return (
                <AssignmentActivityCard
                  key={id}
                  assignment={data}
                  isTeacher={false}
                  userSubmission={submission}
                  teacherName={teacherName}
                  teacherAvatar={teacherAvatar}
                  onSubmit={() => onViewAssignment?.(data)}
                  onClick={() => onViewAssignment?.(data)}
                />
              )
            }

            if (type === 'quiz') {
              const attempt = userQuizAttempts[data.id]
              return (
                <QuizActivityCard
                  key={id}
                  quiz={data}
                  isTeacher={false}
                  userAttempt={attempt}
                  teacherName={teacherName}
                  teacherAvatar={teacherAvatar}
                  onStart={() => navigate(`/courses/${courseId}/quiz/${data.id}/take`)}
                  onClick={() => navigate(`/courses/${courseId}/quiz/${data.id}/take`)}
                />
              )
            }

            return null
          })
        ) : (
          <EmptyPanel
            title="No stream activity yet"
            description="Announcements and newly posted work will appear here."
          />
        )}
      </div>
    </WorkspaceShell>
  )
}
