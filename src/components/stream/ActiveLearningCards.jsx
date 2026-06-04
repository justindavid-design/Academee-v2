import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Clipboard,
  ArrowRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

/**
 * ActiveLearningCard - Compact classroom-style card for active learning dashboard
 */
export function ActiveLearningCard({
  title,
  subtitle,
  icon: Icon,
  status,
  metadata,
  onClick,
  variant = 'default', // 'pending', 'due-soon', 'completed', 'in-progress'
  progress,
}) {
  const variantStyles = {
    pending: 'bg-blue-50 border-blue-100 hover:border-blue-300',
    'due-soon': 'bg-amber-50 border-amber-100 hover:border-amber-300',
    completed: 'bg-green-50 border-green-100 hover:border-green-300',
    'in-progress': 'bg-purple-50 border-purple-100 hover:border-purple-300',
    default: 'bg-slate-50 border-slate-200 hover:border-slate-300',
  }

  const statusColors = {
    pending: 'text-blue-700 bg-blue-100',
    'due-soon': 'text-amber-700 bg-amber-100',
    completed: 'text-green-700 bg-green-100',
    'in-progress': 'text-purple-700 bg-purple-100',
    default: 'text-slate-700 bg-slate-100',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 ${variantStyles[variant]}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-lg ${statusColors[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{title}</h4>
          {subtitle && (
            <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{subtitle}</p>
          )}

          {/* Metadata */}
          {metadata && (
            <p className="text-xs text-slate-500 mt-1">{metadata}</p>
          )}

          {/* Progress bar if provided */}
          {progress !== undefined && (
            <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${statusColors[variant].split(' ')[1]}`}
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </div>

        {/* Arrow */}
        <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
      </div>

      {/* Status badge */}
      {status && (
        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/50 text-xs font-semibold">
          {status}
        </div>
      )}
    </motion.div>
  )
}

/**
 * ContinueLearningCard - Card for continuing previous work
 */
export function ContinueLearningCard({ module, onClick }) {
  return (
    <ActiveLearningCard
      icon={BookOpen}
      title={module.title}
      subtitle="Continue learning"
      metadata={`${module.progress || 0}% complete`}
      variant="in-progress"
      progress={module.progress || 0}
      onClick={onClick}
    />
  )
}

/**
 * PendingAssignmentCard - Upcoming assignment card
 */
export function PendingAssignmentCard({ assignment, userSubmission, onClick }) {
  const dueDate = new Date(assignment.due_at)
  const now = new Date()
  const isOverdue = dueDate < now && !userSubmission?.submitted_at
  const isSubmitted = !!userSubmission?.submitted_at
  const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))

  let variant = 'pending'
  let statusText = `${daysUntilDue} days left`

  if (isSubmitted) {
    variant = 'completed'
    statusText = 'Submitted'
  } else if (isOverdue) {
    variant = 'due-soon'
    statusText = 'Overdue'
  } else if (daysUntilDue <= 1) {
    variant = 'due-soon'
    statusText = 'Due today'
  }

  return (
    <ActiveLearningCard
      icon={Clipboard}
      title={assignment.title}
      subtitle={`${assignment.points || 0} points`}
      metadata={`Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`}
      variant={variant}
      status={statusText}
      onClick={onClick}
    />
  )
}

/**
 * UpcomingQuizCard - Upcoming quiz card
 */
export function UpcomingQuizCard({ quiz, userAttempt, onClick }) {
  const dueDate = quiz.due_at ? new Date(quiz.due_at) : null
  const now = new Date()
  const isCompleted = !!userAttempt?.completed_at
  const isOverdue = dueDate && dueDate < now && !isCompleted
  const attempts_left = Math.max(0, (quiz.attempts_allowed || 1) - (userAttempt?.attempt_number || 0))

  let variant = 'pending'
  let statusText = attempts_left > 0 ? `${attempts_left} attempts left` : 'Completed'

  if (isCompleted) {
    variant = 'completed'
    statusText = `Score: ${userAttempt.score}%`
  } else if (isOverdue) {
    variant = 'due-soon'
    statusText = 'Overdue'
  }

  return (
    <ActiveLearningCard
      icon={Clock}
      title={quiz.title}
      subtitle={`${quiz.question_count || 0} questions`}
      metadata={dueDate ? `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}` : 'No due date'}
      variant={variant}
      status={statusText}
      onClick={onClick}
    />
  )
}

/**
 * ActiveLearningDashboard - Dashboard showing active learning cards
 */
export function ActiveLearningDashboard({
  modules = [],
  assignments = [],
  quizzes = [],
  userSubmissions = {},
  userAttempts = {},
  onNavigateModule,
  onNavigateAssignment,
  onNavigateQuiz,
}) {
  // Get continue learning modules (partially completed)
  const continueLearning = useMemo(
    () =>
      modules
        .filter((m) => m.progress > 0 && m.progress < 100)
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 3),
    [modules]
  )

  // Get pending assignments (not submitted, due soon)
  const pendingAssignments = useMemo(
    () =>
      assignments
        .filter((a) => !userSubmissions[a.id]?.submitted_at)
        .sort((a, b) => new Date(a.due_at) - new Date(b.due_at))
        .slice(0, 3),
    [assignments, userSubmissions]
  )

  // Get upcoming quizzes
  const upcomingQuizzes = useMemo(
    () =>
      quizzes
        .filter((q) => !userAttempts[q.id]?.completed_at)
        .sort((a, b) => {
          const dateA = a.due_at ? new Date(a.due_at) : new Date(9999, 0, 0)
          const dateB = b.due_at ? new Date(b.due_at) : new Date(9999, 0, 0)
          return dateA - dateB
        })
        .slice(0, 3),
    [quizzes, userAttempts]
  )

  return (
    <div className="space-y-6">
      {/* Continue Learning */}
      {continueLearning.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600">
            📖 Continue Learning
          </h3>
          <div className="space-y-2">
            {continueLearning.map((module) => (
              <ContinueLearningCard
                key={module.id}
                module={module}
                onClick={() => onNavigateModule?.(module)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600">
            ✓ Pending Assignments
          </h3>
          <div className="space-y-2">
            {pendingAssignments.map((assignment) => (
              <PendingAssignmentCard
                key={assignment.id}
                assignment={assignment}
                userSubmission={userSubmissions[assignment.id]}
                onClick={() => onNavigateAssignment?.(assignment)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Quizzes */}
      {upcomingQuizzes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600">
            ⚡ Upcoming Quizzes
          </h3>
          <div className="space-y-2">
            {upcomingQuizzes.map((quiz) => (
              <UpcomingQuizCard
                key={quiz.id}
                quiz={quiz}
                userAttempt={userAttempts[quiz.id]}
                onClick={() => onNavigateQuiz?.(quiz)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {continueLearning.length === 0 &&
        pendingAssignments.length === 0 &&
        upcomingQuizzes.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm font-semibold text-slate-900">All caught up!</p>
            <p className="text-xs text-slate-600 mt-1">
              You're on top of your coursework. Check back soon for new assignments.
            </p>
          </div>
        )}
    </div>
  )
}

export default ActiveLearningCard
