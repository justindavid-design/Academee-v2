import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AddTaskOutlined,
  AssignmentOutlined,
  AutoStoriesOutlined,
  CalendarTodayOutlined,
  CheckCircleOutline,
  CloudUploadOutlined,
  GroupsOutlined,
  LibraryBooksOutlined,
  PlayArrowRounded,
  QuizOutlined,
  SchoolOutlined,
  TimelineOutlined,
  TrendingUp,
} from '@mui/icons-material'
import { useAuth } from '../../lib/AuthProvider'
import { useCourseModal } from '../../lib/CourseModalContext'
import { apiFetch } from '../../lib/apiClient'
import { toast } from '../../lib/ToastProvider'
import { safeJson } from '../courses/utils'
import defaultCourseImage from '../../assets/hero_pic.png'
import CourseCard from '../courses/CourseCard'
import ThemeToggle from '../ThemeToggle'

// centralized theme tokens used via CSS variables and utility classes

function Panel({ className = '', children }) {
  return (
    <div className={`soft-card border-token bg-surface ${className}`}>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, change, tone = 'green' }) {
  const toneBg = 'bg-surface-alt'
  return (
    <div className="rounded-2xl border border-token p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.12em] text-main">{label}</p>
          <p className="mt-2 text-2xl font-extrabold text-main">{value}</p>
        </div>
        <div className={`ml-4 flex h-12 w-12 items-center justify-center rounded-lg ${toneBg}`}>
          {Icon ? <Icon sx={{ fontSize: 22 }} /> : null}
        </div>
      </div>
      {change ? <div className="mt-3 text-xs font-semibold text-subtle">{change}</div> : null}
    </div>
  )
}

function formatDue(value, fallback = 'No deadline') {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getCourseProgress(course, index) {
  const explicit = Number(course.progress ?? course.completion_rate ?? course.percent_complete)
  if (Number.isFinite(explicit)) return Math.max(0, Math.min(100, explicit))
  return [72, 48, 86, 34][index % 4]
}



function TaskItem({ task, index }) {
  const title = task?.title || ['Submit lesson reflection', 'Complete quiz review', 'Upload activity sheet'][index % 3]
  const due = task?.due_at || task?.deadline
  const urgent = index === 0 || task?.status === 'late'

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.015, boxShadow: 'var(--shadow-card)' }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex items-center gap-3 rounded-2xl border border-token bg-surface p-3.5 cursor-pointer"
    >
      <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-surface-alt text-main">
        <AssignmentOutlined sx={{ fontSize: 21 }} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-main">{title}</p>
        <p className="mt-0.5 text-xs font-bold text-muted">{urgent ? 'Due soon' : 'Upcoming'} · {formatDue(due, 'This week')}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        type="button"
        className="grid h-9 w-9 place-items-center rounded-xl bg-surface text-primary-token shadow-sm transition hover:bg-surface-alt"
        aria-label={`Open ${title}`}
      >
        <PlayArrowRounded sx={{ fontSize: 20 }} />
      </motion.button>
    </motion.div>
  )
}

function EmptyTaskState({ onCreate }) {
  return (
    <div className="grid min-h-[240px] place-items-center rounded-3xl border border-dashed border-token bg-surface-alt p-6 text-center">
      <div>
        <div className="mx-auto flex h-20 w-24 items-end justify-center gap-1 rounded-[28px] bg-surface shadow-card">
          <span className="mb-4 h-8 w-3 rounded-full bg-token-muted" />
          <span className="mb-4 h-12 w-3 rounded-full bg-primary-token" />
          <span className="mb-4 h-6 w-3 rounded-full bg-token-muted" />
        </div>
        <h3 className="mt-5 text-lg font-black text-main">No tasks yet</h3>
        <p className="mx-auto mt-2 max-w-xs text-sm font-bold leading-6 text-muted">Create a task or publish an assignment to help learners know what comes next.</p>
        <button type="button" onClick={onCreate} className="mt-5 primary-btn">
          Create Task
        </button>
      </div>
    </div>
  )
}

function ActivityFeed({ courses, tasks }) {
  const items = [
    { icon: CheckCircleOutline, title: 'New submission received', detail: tasks[0]?.title || 'Activity sheet submitted', time: '8 min ago', tone: 'green' },
    { icon: AutoStoriesOutlined, title: 'Announcement posted', detail: courses[0]?.title || 'Course update shared', time: '1 hr ago', tone: 'blue' },
    { icon: QuizOutlined, title: 'Quiz result available', detail: 'Adaptive feedback generated', time: 'Yesterday', tone: 'amber' },
    { icon: CloudUploadOutlined, title: 'Material uploaded', detail: courses[1]?.title || 'New reading material', time: 'May 10', tone: 'green' },
  ]

  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-main">Recent Activity</h2>
          <p className="mt-1 text-sm font-bold text-muted">Submissions, announcements, results, and uploads</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="flex gap-3 rounded-2xl p-2.5 transition hover-surface">
              <span className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-surface-alt text-main`}>
                <Icon sx={{ fontSize: 20 }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-main">{item.title}</p>
                <p className="mt-0.5 truncate text-xs font-bold text-muted">{item.detail}</p>
              </div>
              <span className="text-xs font-bold text-subtle">{item.time}</span>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { openCreate, openEnroll } = useCourseModal()
  const { user, profileName, isVisible } = useAuth()
  const displayName = profileName || user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'Justin'

  const [courses, setCourses] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      if (!user?.id) {
        setCourses([])
        setTasks([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const [courseRes, taskRes] = await Promise.all([
          apiFetch(`/api/courses?user_id=${encodeURIComponent(user.id)}`),
          apiFetch(`/api/tasks?user_id=${encodeURIComponent(user.id)}`),
        ])

        const [courseData, taskData] = await Promise.all([safeJson(courseRes), safeJson(taskRes)])

        if (!courseRes.ok) throw new Error(courseData?.error || 'Failed to load courses.')
        if (!taskRes.ok) throw new Error(taskData?.error || 'Failed to load tasks.')

        if (!active) return
        setCourses(Array.isArray(courseData) ? courseData.slice(0, 4) : [])
        setTasks(Array.isArray(taskData) ? taskData.slice(0, 5) : [])
        setError('')
      } catch (err) {
        console.error(err)
        if (!active) return
        setError(err.message || 'Failed to load dashboard.')
        setCourses([])
        setTasks([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      active = false
    }
  }, [user?.id])

  const dueSoonCount = useMemo(
    () => tasks.filter((task) => !task.is_teacher_view && (task.status === 'assigned' || task.status === 'late' || task.due_at)).length,
    [tasks]
  )
  const averageProgress = courses.length
    ? Math.round(courses.reduce((sum, course, index) => sum + getCourseProgress(course, index), 0) / courses.length)
    : 0
  const completionRate = courses.length || tasks.length ? Math.max(64, Math.min(96, averageProgress + 8)) : 0

  const onCopyCode = (code) => {
    toast.copy(code, 'Course code copied to clipboard')
  }

  const onEdit = (course) => {
    openCreate(course)
  }

  const onShare = (course) => {
    const shareUrl = `${window.location.origin}/courses/enroll?code=${course.course_code}`
    const shareText = `Join ${course.title} on Academee`
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Course',
        text: shareText,
        url: shareUrl,
      }).catch(err => console.log('Share failed:', err))
    } else {
      // Fallback: copy to clipboard
      toast.copy(shareUrl, 'Course link copied to clipboard')
    }
  }

  const onArchive = async (courseId) => {
    try {
      const response = await apiFetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to archive course')
      setCourses(courses.filter((c) => c.id !== courseId))
      toast.success('Course archived', 'The course has been moved to archived')
    } catch (err) {
      console.error('Archive failed:', err)
      toast.error('Failed to archive', 'Could not archive the course. Please try again.')
    }
  }

  const onHide = async (courseId) => {
    try {
      const response = await apiFetch(`/api/courses/${courseId}/hide?user_id=${encodeURIComponent(user.id)}`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to hide course')
      setCourses(courses.filter((c) => c.id !== courseId))
      toast.success('Course hidden', 'The course has been hidden from your dashboard')
    } catch (err) {
      console.error('Hide failed:', err)
      toast.error('Failed to hide', 'Could not hide the course. Please try again.')
    }
  }

  const onUnenroll = async (courseId) => {
    try {
      const response = await apiFetch(`/api/courses/${courseId}/unenroll?user_id=${encodeURIComponent(user.id)}`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to unenroll from course')
      setCourses(courses.filter((c) => c.id !== courseId))
      toast.success('Unenrolled', 'You have been unenrolled from the course')
    } catch (err) {
      console.error('Unenroll failed:', err)
      toast.error('Failed to unenroll', 'Could not unenroll from the course. Please try again.')
    }
  }

  const hour = new Date().getHours()

  const greeting =
    hour < 5
      ? 'Still awake'
      : hour < 12
      ? 'Good morning'
      : hour < 18
      ? 'Good afternoon'
      : hour < 22
      ? 'Good evening'
      : 'Working late'

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 25,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "show" : "hidden"}
      className="space-y-7"
    >
      <motion.section
        variants={itemVariants}
        className="overflow-hidden rounded-[32px] border border-token bg-surface p-6 shadow-card md:p-7"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-primary-token">Learning overview</p>
            <h1 className="mt-2 max-w-2xl text-1xl font-black tracking-tight text-main md:text-3xl">
              {greeting}, {String(displayName).split(/\s+/)[0] || 'Student'}
            </h1>
            <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-muted">
              Track courses, assignments, quiz progress, and upcoming events from one focused workspace.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.div variants={itemVariants} className="grid grid-cols-12 gap-6">
        <section className="col-span-12 xl:col-span-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-main">Courses</h2>
              <p className="mt-1 text-sm font-bold text-muted">Continue where you left off</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate('/courses')}
              className="secondary-btn"
            >
              View all
            </motion.button>
          </div>

          {loading ? (
            <Panel className="p-6 text-sm font-bold text-muted">Loading dashboard...</Panel>
          ) : error ? (
            <Panel className="p-6 text-sm font-bold text-red-700">{error}</Panel>
          ) : courses.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-7 sm:justify-start">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isTeacher={String(course.author) === String(user?.id)}
                  profileName={profileName}
                  userEmail={user?.email}
                  onCopyCode={onCopyCode}
                  onEdit={onEdit}
                  onArchive={onArchive}
                  onShare={onShare}
                  onHide={onHide}
                  onUnenroll={onUnenroll}
                />
              ))}
            </div>
          ) : (
            <Panel className="grid min-h-[286px] place-items-center p-6 text-center">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-surface-alt text-main">
                  <SchoolOutlined />
                </div>
                <h3 className="mt-4 text-xl font-black text-main">No courses yet</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-6 text-muted">Create or join a course and your learning cards will appear here.</p>
                <button type="button" onClick={openEnroll} className="mt-5 primary-btn">Join Course</button>
              </div>
            </Panel>
          )}
        </section>

        <section className="col-span-12 xl:col-span-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-main">Tasks</h2>
              <p className="mt-1 text-sm font-bold text-muted">Assignments and reminders</p>
            </div>
            <button type="button" onClick={() => navigate('/tasks')} className="secondary-btn">View all</button>
          </div>
          <Panel className="p-4">
            {tasks.length > 0 ? (
              <div className="grid gap-3">
                {tasks.map((task, index) => (
                  <TaskItem key={task.id || index} task={task} index={index} />
                ))}
              </div>
            ) : (
              <EmptyTaskState onCreate={() => navigate('/tasks')} />
            )}
          </Panel>
        </section>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
      </div>
    </motion.div>
  )
}
