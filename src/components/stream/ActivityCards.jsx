import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit2,
  Trash2,
  Megaphone,
  Clipboard,
  PenTool,
  Users,
  ArrowRight,
} from 'lucide-react'
import {
  ClassroomActivityCard,
  CardHeader,
  CardContent,
  CardMetadata,
  CardAction,
  ActionButton,
  StatusBadge,
} from './ClassroomActivityCard'
import { getSubmissionStatus } from '../../lib/submissionStatus.js'

function safeDistanceToNow(value, fallback = 'Recently') {
  const date = new Date(value || Date.now())
  return Number.isNaN(date.getTime()) ? fallback : formatDistanceToNow(date, { addSuffix: true })
}

/**
 * AnnouncementActivityCard - Clean announcement card inspired by Google Classroom
 */
export function AnnouncementActivityCard({
  announcement,
  isTeacher,
  onEdit,
  onDelete,
  onPin,
  onClick,
  teacherName,
  teacherAvatar,
}) {
  const timestamp = safeDistanceToNow(announcement.created_at)

  const menuItems = isTeacher
    ? [
        {
          label: 'Edit',
          icon: Edit2,
          onClick: () => onEdit?.(announcement),
        },
        {
          label: 'Pin',
          icon: Megaphone,
          onClick: () => onPin?.(announcement),
        },
        {
          label: 'Delete',
          icon: Trash2,
          isDanger: true,
          onClick: () => onDelete?.(announcement),
        },
      ]
    : []

  return (
    <ClassroomActivityCard
      variant="announcement"
      isClickable={true}
      onClick={onClick}
      className="hover:shadow-md"
    >
      <CardHeader
        teacherName={teacherName}
        teacherAvatar={teacherAvatar}
        actionLabel="Posted an announcement"
        timestamp={timestamp}
        isPinned={announcement.is_pinned}
        menuItems={menuItems}
      />

      <CardContent
        title={announcement.title}
        description={announcement.body}
      />

      {!isTeacher && (
        <CardAction>
          <ActionButton
            label="View Details"
            icon={ArrowRight}
            variant="secondary"
            onClick={onClick}
          />
        </CardAction>
      )}
    </ClassroomActivityCard>
  )
}

/**
 * AssignmentActivityCard - Assignment card with submission status
 */
export function AssignmentActivityCard({
  assignment,
  isTeacher,
  userSubmission,
  onSubmit,
  onEdit,
  onDelete,
  onViewSubmissions,
  onClick,
  teacherName,
  teacherAvatar,
}) {
  const dueDate = assignment.due_at ? new Date(assignment.due_at) : null
  const now = new Date()
  const submissionStatus = getSubmissionStatus(userSubmission, assignment.due_at)
  const isSubmitted = ['submitted', 'late', 'graded', 'returned'].includes(submissionStatus)
  const isOverdue = dueDate && dueDate < now && !isSubmitted
  const timestamp = safeDistanceToNow(assignment.created_at)

  // Calculate time until due
  const timeUntilDue = dueDate && !Number.isNaN(dueDate.getTime()) ? formatDistanceToNow(dueDate, { addSuffix: true }) : 'No due date'

  const menuItems = isTeacher
    ? [
        {
          label: 'Edit',
          icon: Edit2,
          onClick: () => onEdit?.(assignment),
        },
        {
          label: 'View Submissions',
          icon: Clipboard,
          onClick: () => onViewSubmissions?.(assignment),
        },
        {
          label: 'Delete',
          icon: Trash2,
          isDanger: true,
          onClick: () => onDelete?.(assignment),
        },
      ]
    : []

  const getStatus = () => {
    if (submissionStatus === 'draft') return { label: 'Draft', type: 'draft' }
    if (submissionStatus === 'missing') return { label: 'Missing', type: 'pending' }
    if (submissionStatus === 'late') return { label: 'Late', type: 'overdue' }
    if (submissionStatus === 'returned') return { label: 'Returned', type: 'completed' }
    if (submissionStatus === 'graded') return { label: 'Graded', type: 'completed' }
    if (submissionStatus === 'submitted') return { label: 'Submitted', type: 'submitted' }
    if (isOverdue) return { label: 'Overdue', type: 'overdue' }
    return null
  }

  const status = getStatus()

  return (
    <ClassroomActivityCard
      variant="assignment"
      isClickable={true}
      onClick={onClick}
      className="hover:shadow-md"
    >
      <CardHeader
        teacherName={teacherName}
        teacherAvatar={teacherAvatar}
        actionLabel="Posted an assignment"
        timestamp={timestamp}
        menuItems={menuItems}
      />

      <CardContent
        title={assignment.title}
        description={assignment.instructions}
      >
        {status && (
          <div className="mt-3 flex items-center gap-2">
            <StatusBadge label={status.label} type={status.type} />
          </div>
        )}
      </CardContent>

      <CardMetadata
        items={[
          {
            icon: Calendar,
            label: `Due ${timeUntilDue}`,
            bold: isOverdue,
          },
          ...(assignment.points
            ? [
                {
                  icon: Clipboard,
                  label: `${assignment.points} points`,
                },
              ]
            : []),
        ]}
      />

      <CardAction>
        {!isTeacher && !isSubmitted && (
          <ActionButton
            label="Submit Work"
            icon={Clipboard}
            variant="primary"
            onClick={onSubmit}
          />
        )}
        {!isTeacher && isSubmitted && (
          <ActionButton
            label="View Submission"
            icon={CheckCircle}
            variant="secondary"
            onClick={onClick}
          />
        )}
        {isTeacher && (
          <>
            <ActionButton
              label="View Submissions"
              icon={Users}
              variant="primary"
              onClick={() => onViewSubmissions?.(assignment)}
            />
            <ActionButton
              label="Edit"
              icon={Edit2}
              variant="secondary"
              onClick={() => onEdit?.(assignment)}
            />
          </>
        )}
      </CardAction>
    </ClassroomActivityCard>
  )
}

/**
 * QuizActivityCard - Interactive quiz card
 */
export function QuizActivityCard({
  quiz,
  isTeacher,
  userAttempt,
  onStart,
  onEdit,
  onDelete,
  onClick,
  teacherName,
  teacherAvatar,
}) {
  const dueDate = quiz.due_at ? new Date(quiz.due_at) : null
  const isOverdue = dueDate && dueDate < new Date() && !userAttempt?.completed_at
  const isCompleted = !!userAttempt?.completed_at
  const attempts_left = Math.max(0, (quiz.attempts_allowed || 1) - (userAttempt?.attempt_number || 0))
  const timestamp = safeDistanceToNow(quiz.created_at)

  const timeUntilDue = dueDate && !Number.isNaN(dueDate.getTime()) ? formatDistanceToNow(dueDate, { addSuffix: true }) : null

  const menuItems = isTeacher
    ? [
        {
          label: 'Edit',
          icon: Edit2,
          onClick: () => onEdit?.(quiz),
        },
        {
          label: 'Delete',
          icon: Trash2,
          isDanger: true,
          onClick: () => onDelete?.(quiz),
        },
      ]
    : []

  const getStatus = () => {
    if (isCompleted) return { label: 'Completed', type: 'completed' }
    if (isOverdue) return { label: 'Overdue', type: 'overdue' }
    return null
  }

  const status = getStatus()

  return (
    <ClassroomActivityCard
      variant="quiz"
      isClickable={true}
      onClick={onClick}
      className="hover:shadow-md"
    >
      <CardHeader
        teacherName={teacherName}
        teacherAvatar={teacherAvatar}
        actionLabel="Posted a quiz"
        timestamp={timestamp}
        menuItems={menuItems}
      />

      <CardContent
        title={quiz.title}
        description={quiz.description}
      >
        {status && (
          <div className="mt-3 flex items-center gap-2">
            <StatusBadge label={status.label} type={status.type} />
          </div>
        )}
        
        {!isTeacher && userAttempt && (
          <div className="mt-3 p-3 bg-purple-50 border border-purple-100 rounded-lg">
            <p className="text-sm font-semibold text-purple-900">
              Your Score: <span className="text-lg">{userAttempt.score}%</span>
            </p>
          </div>
        )}
      </CardContent>

      <CardMetadata
        items={[
          ...(quiz.question_count
            ? [
                {
                  icon: Clipboard,
                  label: `${quiz.question_count} questions`,
                },
              ]
            : []),
          ...(dueDate
            ? [
                {
                  icon: Calendar,
                  label: `Due ${timeUntilDue}`,
                  bold: isOverdue,
                },
              ]
            : []),
          ...(!isTeacher && attempts_left > 0
            ? [
                {
                  icon: Clock,
                  label: `${attempts_left} attempt${attempts_left !== 1 ? 's' : ''} left`,
                },
              ]
            : []),
        ]}
      />

      <CardAction>
        {!isTeacher && !isCompleted && attempts_left > 0 && (
          <ActionButton
            label="Submit Quiz"
            icon={PenTool}
            variant="primary"
            onClick={onStart}
          />
        )}
        {!isTeacher && isCompleted && attempts_left > 0 && (
          <ActionButton
            label="Retake Quiz"
            icon={PenTool}
            variant="secondary"
            onClick={onStart}
          />
        )}
        {!isTeacher && attempts_left === 0 && (
          <ActionButton
            label="View Results"
            icon={CheckCircle}
            variant="secondary"
            onClick={onClick}
          />
        )}
      </CardAction>
    </ClassroomActivityCard>
  )
}

/**
 * ModuleActivityCard - Learning module/lesson card
 */
export function ModuleActivityCard({
  module,
  isTeacher,
  onOpen,
  onEdit,
  onDelete,
  onClick,
  teacherName,
  teacherAvatar,
}) {
  const timestamp = safeDistanceToNow(module.created_at)

  const menuItems = isTeacher
    ? [
        {
          label: 'Edit',
          icon: Edit2,
          onClick: () => onEdit?.(module),
        },
        {
          label: 'Delete',
          icon: Trash2,
          isDanger: true,
          onClick: () => onDelete?.(module),
        },
      ]
    : []

  return (
    <ClassroomActivityCard
      variant="default"
      isClickable={true}
      onClick={onClick}
      className="hover:shadow-md"
    >
      <CardHeader
        teacherName={teacherName}
        teacherAvatar={teacherAvatar}
        actionLabel="Created a module"
        timestamp={timestamp}
        menuItems={menuItems}
      />

      <CardContent
        title={module.title}
        description={module.description}
      />

      <CardAction>
        <ActionButton
          label="Open Module"
          icon={ArrowRight}
          variant="primary"
          onClick={onOpen}
        />
      </CardAction>
    </ClassroomActivityCard>
  )
}

/**
 * ReviewerActivityCard - Peer review/reviewer card
 */
export function ReviewerActivityCard({
  reviewer,
  isTeacher,
  onOpen,
  onEdit,
  onDelete,
  onClick,
  teacherName,
  teacherAvatar,
}) {
  const timestamp = formatDistanceToNow(new Date(reviewer.created_at), { addSuffix: true })

  const menuItems = isTeacher
    ? [
        {
          label: 'Edit',
          icon: Edit2,
          onClick: () => onEdit?.(reviewer),
        },
        {
          label: 'Delete',
          icon: Trash2,
          isDanger: true,
          onClick: () => onDelete?.(reviewer),
        },
      ]
    : []

  return (
    <ClassroomActivityCard
      variant="reviewer"
      isClickable={true}
      onClick={onClick}
      className="hover:shadow-md"
    >
      <CardHeader
        teacherName={teacherName}
        teacherAvatar={teacherAvatar}
        actionLabel="Started a reviewer"
        timestamp={timestamp}
        menuItems={menuItems}
      />

      <CardContent
        title={reviewer.title}
        description={reviewer.description}
      >
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <Users className="w-4 h-4" />
          <span>Peer review activity</span>
        </div>
      </CardContent>

      <CardAction>
        <ActionButton
          label="Open Reviewer"
          icon={ArrowRight}
          variant="primary"
          onClick={onOpen}
        />
      </CardAction>
    </ClassroomActivityCard>
  )
}

/**
 * ReminderActivityCard - Reminder/notification card
 */
export function ReminderActivityCard({
  reminder,
  onClick,
  teacherName,
  teacherAvatar,
}) {
  const timestamp = formatDistanceToNow(new Date(reminder.created_at), { addSuffix: true })

  return (
    <ClassroomActivityCard
      variant="default"
      isClickable={true}
      onClick={onClick}
      className="hover:shadow-md border-dashed"
    >
      <CardHeader
        teacherName={teacherName}
        teacherAvatar={teacherAvatar}
        actionLabel="Sent a reminder"
        timestamp={timestamp}
        menuItems={[]}
      />

      <CardContent
        title={reminder.title}
        description={reminder.message}
      />

      <CardAction>
        <ActionButton
          label="View"
          icon={ArrowRight}
          variant="secondary"
          onClick={onClick}
        />
      </CardAction>
    </ClassroomActivityCard>
  )
}
