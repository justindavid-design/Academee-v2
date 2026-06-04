import React, { useState, useRef, useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  MessageCircle,
  Heart,
  Share2,
  Pin,
  MoreVertical,
  Clipboard,
  PenTool,
  BookOpen,
  RotateCcw,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import UserAvatar from '../common/UserAvatar'
import StreamDropdownMenu, { createMenuItem } from '../common/StreamDropdownMenu'
import { ModernFileAttachmentList } from '../common/ModernFileAttachmentList'
import SubmissionStatusBadge from '../common/SubmissionStatusBadge'
import UnsubmitConfirmationModal from '../common/UnsubmitConfirmationModal'
import { parseAttachments, parseContentWithAttachments } from '../../lib/fileUtils'
import { canUnsubmitSubmission } from '../../lib/submissionStatus'
import TextToSpeechButton from '../accessibility/TextToSpeechButton'

function buildSpeechText(...parts) {
  return parts.flat().filter(Boolean).join(' ')
}

/**
 * Base StreamCard wrapper component with modern styling
 */
function StreamCard({ children, isHoverable = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={isHoverable ? { y: -2 } : {}}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div
        className={`relative rounded-2xl border border-slate-200 bg-surface overflow-hidden shadow-sm transition-all duration-300 ${
          isHoverable ? 'hover:shadow-md hover:border-slate-300' : ''
        }`}
      >
        {children}
      </div>
    </motion.div>
  )
}

/**
 * Modern AnnouncementCard with dynamic user avatar
 */
export function AnnouncementCard({ announcement, isTeacher, onEdit, onDelete, onPin }) {
  const [showMenu, setShowMenu] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(announcement.likes_count || 0)
  const menuRef = useRef(null)
  const content = parseContentWithAttachments(announcement.body || announcement.content)

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  const menuItems = [
    isTeacher && onEdit && createMenuItem({
      label: 'Edit',
      icon: 'edit',
      onClick: () => onEdit(announcement),
    }),
    isTeacher && onPin && createMenuItem({
      label: 'Pin',
      icon: 'pin',
      onClick: () => onPin(announcement),
    }),
    isTeacher && onDelete && createMenuItem({
      label: 'Delete',
      icon: 'delete',
      onClick: () => onDelete(announcement),
      variant: 'danger',
      divider: true,
    }),
  ].filter(Boolean)

  return (
    <StreamCard>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* User Avatar */}
            <UserAvatar
              name={announcement.author_name || 'Teacher'}
              avatar={announcement.author_avatar}
              size="md"
              showBorder={true}
            />

            {/* Meta Information */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-main text-lg line-clamp-2">
                {announcement.title}
              </h3>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-block px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                  Announcement
                </span>
                <span className="text-xs text-muted">
                  {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="mt-3">
                <TextToSpeechButton
                  compact
                  label="Read announcement"
                  text={buildSpeechText(announcement.title, content.text, content.files.map((file) => file.name))}
                />
              </div>
            </div>
          </div>

          {/* Action Menu */}
          {isTeacher && (
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-surface-alt rounded-lg transition-colors"
                title="Actions"
              >
                <MoreVertical className="w-5 h-5 text-muted" />
              </motion.button>

              <StreamDropdownMenu
                isOpen={showMenu}
                onClose={() => setShowMenu(false)}
                items={menuItems}
                align="right"
              />
            </div>
          )}
        </div>

        {/* Content */}
        {content.text && (
          <div className="mb-4 text-main text-sm leading-relaxed line-clamp-3">
            {content.text}
          </div>
        )}

        {/* Attachments */}
        {content.files.length > 0 && (
          <div className="mb-4">
            <ModernFileAttachmentList files={content.files} />
          </div>
        )}

        {/* Engagement Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all font-medium text-sm ${
                liked
                  ? 'bg-red-50 text-red-600'
                  : 'text-muted hover:bg-surface-alt'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-muted hover:bg-surface-alt transition-all font-medium text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{announcement.comment_count || 0}</span>
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-muted hover:bg-surface-alt transition-all font-medium text-sm"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </StreamCard>
  )
}

/**
 * Modern AssignmentCard with submission state sync and unsubmit support
 */
export function AssignmentCard({
  assignment,
  isTeacher,
  userSubmission,
  onEdit,
  onDelete,
  onSubmit,
  onUnsubmit,
  onViewSubmissions,
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showUnsubmitModal, setShowUnsubmitModal] = useState(false)
  const [isUnsubmitting, setIsUnsubmitting] = useState(false)
  const menuRef = useRef(null)

  const dueDate = new Date(assignment.due_at)
  const now = new Date()
  
  // Determine submission status
  const submissionStatus = userSubmission?.status || 'assigned'
  const isSubmitted = ['submitted', 'late', 'graded'].includes(submissionStatus)
  const isOverdue = dueDate < now && !isSubmitted
  const isGraded = submissionStatus === 'graded'
  const canUnsubmit = !isTeacher && Boolean(onUnsubmit) && canUnsubmitSubmission(userSubmission, assignment, assignment?.submission_settings || {})
  
  const assignmentFiles = parseAttachments(assignment.attachment_url)

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handleUnsubmitClick = () => {
    setShowUnsubmitModal(true)
  }

  const handleConfirmUnsubmit = async () => {
    setIsUnsubmitting(true)
    try {
      await onUnsubmit?.(assignment, userSubmission)
      setShowUnsubmitModal(false)
    } finally {
      setIsUnsubmitting(false)
    }
  }

  const menuItems = [
    isTeacher && onEdit && createMenuItem({
      label: 'Edit',
      icon: 'edit',
      onClick: () => {
        setShowMenu(false)
        onEdit(assignment)
      },
    }),
    isTeacher && onDelete && createMenuItem({
      label: 'Delete',
      icon: 'delete',
      onClick: () => {
        setShowMenu(false)
        onDelete(assignment)
      },
      variant: 'danger',
      divider: true,
    }),
  ].filter(Boolean)

  return (
    <>
      <StreamCard>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="flex items-start gap-4 flex-1">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <Clipboard className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h3 className="font-bold text-main text-lg line-clamp-2">
                    {assignment.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <SubmissionStatusBadge
                      status={submissionStatus}
                      isOverdue={isOverdue}
                      score={userSubmission?.score}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-muted font-medium">
                    <Calendar className="w-4 h-4" />
                    Due {formatDistanceToNow(dueDate, { addSuffix: true })}
                  </div>
                  {assignment.points && (
                    <span className="text-xs font-semibold text-main">
                      • {assignment.points} pts
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <TextToSpeechButton
                    compact
                    label="Read assignment"
                    text={buildSpeechText(
                      assignment.title,
                      assignment.instructions || assignment.description || assignment.prompt,
                      assignment.due_at ? `Due ${new Date(assignment.due_at).toLocaleDateString()}.` : '',
                      assignmentFiles.map((file) => file.name),
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Action Menu */}
            {isTeacher && (
              <div className="relative" ref={menuRef}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-surface-alt rounded-lg transition-colors"
                  title="Actions"
                >
                  <MoreVertical className="w-5 h-5 text-muted" />
                </motion.button>

                <StreamDropdownMenu
                  isOpen={showMenu}
                  onClose={() => setShowMenu(false)}
                  items={menuItems}
                  align="right"
                />
              </div>
            )}
          </div>

          {/* Description */}
          {assignment.instructions && (
            <p className="mb-4 text-main text-sm line-clamp-2">{assignment.instructions}</p>
          )}

          {/* Attachments */}
          {assignmentFiles.length > 0 && (
            <div className="mb-4">
              <ModernFileAttachmentList files={assignmentFiles} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 flex-wrap">
            {!isTeacher && !isSubmitted && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSubmit?.(assignment)}
                className="flex-1 min-w-[120px] px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm"
              >
                Submit Work
              </motion.button>
            )}
            {!isTeacher && isSubmitted && !isGraded && canUnsubmit && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewSubmissions?.(assignment)}
                  className="flex-1 min-w-[120px] px-4 py-2.5 rounded-lg bg-surface text-main font-semibold text-sm hover:bg-surface-alt transition-colors"
                >
                  View Submission
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUnsubmitClick}
                  className="px-4 py-2.5 rounded-lg border border-orange-200 text-orange-700 font-semibold text-sm hover:bg-orange-50 transition-colors flex items-center gap-2"
                  title="Unsubmit Work"
                >
                  <RotateCcw className="w-4 h-4" />
                  Unsubmit
                </motion.button>
              </>
            )}
            {!isTeacher && isSubmitted && !isGraded && !canUnsubmit ? (
              <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-500">
                Unsubmit is unavailable after the due date unless your teacher allows late edits.
              </div>
            ) : null}
            {!isTeacher && isGraded && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewSubmissions?.(assignment)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors"
              >
                View Feedback
              </motion.button>
            )}
            {isTeacher && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewSubmissions?.(assignment)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors"
              >
                View Submissions
              </motion.button>
            )}
          </div>
        </div>
      </StreamCard>

      {/* Unsubmit Confirmation Modal */}
      <UnsubmitConfirmationModal
        isOpen={showUnsubmitModal}
        assignmentTitle={assignment.title}
        onConfirm={handleConfirmUnsubmit}
        onCancel={() => setShowUnsubmitModal(false)}
        isLoading={isUnsubmitting}
      />
    </>
  )
}

/**
 * Modern QuizCard with enhanced design
 */
export function QuizCard({ quiz, isTeacher, userAttempt, onStart, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const dueDate = quiz.due_at ? new Date(quiz.due_at) : null
  const isOverdue = dueDate && dueDate < new Date() && !userAttempt?.completed_at
  const isCompleted = !!userAttempt?.completed_at
  const attempts_left = Math.max(0, (quiz.attempts_allowed || 1) - (userAttempt?.attempt_number || 0))

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const menuItems = [
    isTeacher && onEdit && createMenuItem({
      label: 'Edit',
      icon: 'edit',
      onClick: () => onEdit(quiz),
    }),
    isTeacher && onDelete && createMenuItem({
      label: 'Delete',
      icon: 'delete',
      onClick: () => onDelete(quiz),
      variant: 'danger',
      divider: true,
    }),
  ].filter(Boolean)

  return (
    <StreamCard>
      <div className="p-6">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-purple-600" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-4 pl-3">
          <div className="flex items-start gap-4 flex-1">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <PenTool className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-main text-lg line-clamp-2">{quiz.title}</h3>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {quiz.question_count && (
                  <span className="text-xs text-muted flex items-center gap-1 font-medium">
                    <span className="font-semibold">{quiz.question_count}</span> questions
                  </span>
                )}
                {dueDate && (
                  <span className="text-xs text-muted flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    Due {formatDistanceToNow(dueDate, { addSuffix: true })}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <TextToSpeechButton
                  compact
                  label="Read quiz"
                  text={buildSpeechText(
                    quiz.title,
                    quiz.description,
                    quiz.instructions,
                    quiz.due_at ? `Due ${new Date(quiz.due_at).toLocaleDateString()}.` : '',
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && (
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold whitespace-nowrap">
                âœ“ Completed
              </span>
            )}

            {isTeacher && (
              <div className="relative" ref={menuRef}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-surface-alt rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-muted" />
                </motion.button>

                <StreamDropdownMenu
                  isOpen={showMenu}
                  onClose={() => setShowMenu(false)}
                  items={menuItems}
                  align="right"
                />
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {quiz.description && (
          <p className="mb-4 text-main text-sm line-clamp-2 pl-3">{quiz.description}</p>
        )}

        {/* Stats */}
        {!isTeacher && (
          <div className="mb-4 pl-3 grid grid-cols-2 gap-3">
            {attempts_left > 0 && (
              <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold">{attempts_left} Attempts Left</p>
              </div>
            )}
            {userAttempt?.score !== undefined && (
              <div className="px-3 py-2 rounded-lg bg-purple-50 border border-purple-200">
                <p className="text-xs text-purple-600 font-semibold">Score: {userAttempt.score}%</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 pl-3">
          {!isTeacher && !isCompleted && attempts_left > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStart?.(quiz)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold text-sm transition-all shadow-sm"
            >
              Start Quiz
            </motion.button>
          )}
          {!isTeacher && isCompleted && attempts_left > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStart?.(quiz)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-purple-300 text-purple-700 font-semibold text-sm hover:bg-purple-50 transition-colors"
            >
              Retake Quiz
            </motion.button>
          )}
        </div>
      </div>
    </StreamCard>
  )
}

/**
 * Modern ModuleCard with enhanced interaction
 */
export function ModuleCard({ module, isTeacher, itemCount, onEdit, onDelete, onClick }) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const content = parseContentWithAttachments(module.description)

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const menuItems = [
    isTeacher && onEdit && createMenuItem({
      label: 'Edit',
      icon: 'edit',
      onClick: () => onEdit(module),
    }),
    isTeacher && onDelete && createMenuItem({
      label: 'Delete',
      icon: 'delete',
      onClick: () => onDelete(module),
      variant: 'danger',
      divider: true,
    }),
  ].filter(Boolean)

  return (
    <StreamCard isHoverable={true}>
      <motion.div
        onClick={onClick}
        className="p-6 cursor-pointer"
        whileHover={{ backgroundColor: '#f9fafb' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <BookOpen className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-main text-lg line-clamp-2">{module.title}</h3>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-block px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  Module
                </span>
                {itemCount !== undefined && (
                  <span className="text-xs text-muted">â€¢ {itemCount} items</span>
                )}
              </div>
              <div className="mt-3">
                <TextToSpeechButton
                  compact
                  label="Read module"
                  text={buildSpeechText(module.title, content.text, content.files.map((file) => file.name))}
                />
              </div>
            </div>
          </div>

          {/* Action Menu */}
          {isTeacher && (
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className="p-2 hover:bg-surface-alt rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-main" />
              </motion.button>

              <StreamDropdownMenu
                isOpen={showMenu}
                onClose={() => setShowMenu(false)}
                items={menuItems}
                align="right"
              />
            </div>
          )}
        </div>

        {/* Description */}
        {content.text && (
          <p className="mt-3 text-main text-sm line-clamp-2">{content.text}</p>
        )}

        {/* Attachments */}
        {content.files.length > 0 && (
          <div className="mt-4">
            <ModernFileAttachmentList files={content.files} />
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-muted font-medium">
            Created {formatDistanceToNow(new Date(module.created_at), { addSuffix: true })}
          </span>
          {!isTeacher && (
            <motion.span
              whileHover={{ x: 4 }}
              className="flex text-xs font-semibold text-blue-600 items-center gap-1"
            >
              View module â†’
            </motion.span>
          )}
        </div>
      </motion.div>
    </StreamCard>
  )
}

export default StreamCard
