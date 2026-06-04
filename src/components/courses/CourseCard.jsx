import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MoreHoriz,
  AssignmentInd,
  FolderOpen,
  CopyAll,
  ArchiveOutlined,
  ShareOutlined,
  VisibilityOffOutlined,
  LogoutOutlined,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { getCourseImage } from './utils'

function getInitials(name) {
  return String(name || 'Student')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'S'
}

function StudentAvatar({ student, offset = false }) {
  const name = student?.display_name || 'Student'

  return (
    <div
      className={`flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border border-surface bg-primary-token text-[9px] font-black text-white shadow-sm ${offset ? '-ml-2' : ''}`}
      title={name}
    >
      {student?.avatar_url ? (
        <img src={student.avatar_url} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}

export default function CourseCard({
  course,
  isTeacher,
  onCopyCode,
  onEdit,
  onArchive,
  onShare,
  onHide,
  onUnenroll,
}) {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const imageUrl = useMemo(() => {
    return course.cover_image || getCourseImage(course.id || course.slug || course.title)
  }, [course])

  const learnerCount = useMemo(() => {
    if (typeof course.learner_count === 'number') return course.learner_count
    if (typeof course.student_count === 'number') return course.student_count
    return Array.isArray(course.enrolled_students) ? course.enrolled_students.length : 0
  }, [course])

  const visibleStudents = useMemo(() => {
    return Array.isArray(course.enrolled_students) ? course.enrolled_students.slice(0, 3) : []
  }, [course.enrolled_students])

  const openCourse = () => {
    navigate(`/courses/${course.id}`)
  }

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const actionItems = [
    {
      label: 'Share',
      icon: ShareOutlined,
      onClick: () => onShare?.(course),
      show: isTeacher,
    },
    {
      label: 'Edit course',
      icon: AssignmentInd,
      onClick: () => onEdit(course),
      show: isTeacher,
    },
    {
      label: 'Copy code',
      icon: CopyAll,
      onClick: () => onCopyCode(course.course_code),
      show: isTeacher && course.course_code,
    },
    {
      label: course.isArchived ? 'Restore' : 'Archive',
      icon: ArchiveOutlined,
      onClick: () => onArchive(course.id),
      show: isTeacher,
    },
    {
      label: 'Hide',
      icon: VisibilityOffOutlined,
      onClick: () => onHide?.(course.id),
      show: !isTeacher,
    },
    {
      label: 'Unenroll',
      icon: LogoutOutlined,
      onClick: () => onUnenroll?.(course.id),
      show: !isTeacher,
      danger: true,
    },
  ]

  return (
    <motion.article
      layout
      whileHover={{ y: -2, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="group w-[300px]"
    >
      <div className="relative overflow-visible rounded-[10px] border border-token bg-surface p-2 shadow-card transition-shadow duration-300 group-hover:shadow-[0_28px_60px_rgba(15,23,42,0.14)]">
        <button
          type="button"
          onClick={openCourse}
          className="block w-full text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
        >
          <div className="relative h-[156px] overflow-hidden rounded-[8px] rounded-br-[48px] bg-surface-alt">
            <img
              src={imageUrl}
              alt={course.title || 'Course thumbnail'}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />

            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-surface/95 px-1.5 py-1 shadow-card backdrop-blur">
              <div className="flex">
                {visibleStudents.length > 0 ? (
                  visibleStudents.map((student, index) => (
                    <StudentAvatar key={student.id || index} student={student} offset={index > 0} />
                  ))
                ) : (
                  <StudentAvatar student={{ display_name: course.author_name || 'Teacher' }} />
                )}
              </div>
              <span className="min-w-[22px] pr-1 text-center text-[11px] font-black text-main">
                {learnerCount}
              </span>
            </div>
          </div>

          <div className="px-3 pb-5 pt-6">
            <p className="mb-1 text-[12px] font-extrabold text-muted">
              By: {course.author_name || 'Teacher name'}
            </p>
            <h2 className="line-clamp-2 min-h-[56px] text-[24px] font-black leading-[1.05] tracking-tight text-main">
              {course.title || 'Subject name'}
            </h2>
            <div className="mt-4 flex items-center justify-between text-[12px] font-bold text-muted">
              <span className="rounded-full bg-success-soft px-3 py-1 text-success-token">Active course</span>
              {course.course_code && <span className="tracking-[0.08em]">{course.course_code}</span>}
            </div>
          </div>
        </button>

        <div ref={menuRef} className="absolute right-5 top-[134px] z-30">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setMenuOpen((prev) => !prev)
            }}
            className="grid h-12 w-14 place-items-center rounded-full bg-surface text-main shadow-card ring-1 ring-token transition-all duration-300 hover:-translate-y-0.5 hover:bg-surface-alt hover:text-primary-token"
            aria-label="Course actions"
            aria-expanded={menuOpen}
          >
            <MoreHoriz fontSize="medium" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-[58px] z-50 w-48 overflow-hidden rounded-[22px] border border-token bg-surface p-1.5 shadow-card"
              >
                {actionItems.filter((item) => item.show).map(({ label, icon: Icon, onClick, danger }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setMenuOpen(false)
                      onClick()
                    }}
                    className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm font-bold transition ${
                      danger ? 'text-danger-token hover:bg-danger-soft' : 'text-main hover:bg-surface-alt hover:text-primary-token'
                    }`}
                  >
                    <Icon fontSize="small" />
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  )
}
