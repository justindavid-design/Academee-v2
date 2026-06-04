import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Loading from '../Loading'
import { useAuth } from '../../lib/AuthProvider'
import { useCourseModal } from '../../lib/CourseModalContext'
import { apiFetch } from '../../lib/apiClient'
import { toast } from '../../lib/ToastProvider'

import MessageBanner from '../courses/MessageBanner'
import EmptyCoursesState from '../courses/EmptyCoursesState'
import CourseSection from '../courses/CourseSection'

import {
  getApiErrorMessage,
  safeJson,
} from '../courses/utils'

function SummaryCard({ label, value, tone = 'bg-surface' }) {
  return (
    <div className={`rounded-lg border border-token p-4 shadow-sm ${tone}`}>
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-subtle">{label}</div>
      <div className="mt-3 text-3xl font-extrabold text-main">{value}</div>
    </div>
  )
}

export default function Courses() {
  const { user, profileName } = useAuth()
  const { openCreate, openEnroll } = useCourseModal()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, courseId: null })

  const load = useCallback(async () => {
    if (!user?.id) {
      setCourses([])
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const res = await apiFetch(`/api/courses?user_id=${encodeURIComponent(user.id)}`)
      const data = await safeJson(res)

      if (!res.ok) {
        const errorMsg = getApiErrorMessage(data, 'We could not load your courses.')
        toast.error('Failed to load courses', errorMsg)
        setCourses([])
      } else {
        setCourses(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error(err)
      toast.error('Error', 'We could not load your courses. Please try again.')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const refreshCourses = () => load()
    window.addEventListener('academee:courses-updated', refreshCourses)
    return () => window.removeEventListener('academee:courses-updated', refreshCourses)
  }, [load])

  const copyCode = async (code) => {
    if (!code) return
    toast.copy(code, `Course code copied. Share it with learners to enroll.`)
  }

  const removeCourse = async (id) => {
    setDeleteConfirm({ isOpen: true, courseId: id })
  }

  const confirmDelete = async () => {
    const id = deleteConfirm.courseId
    if (!id) return

    try {
      const res = await apiFetch(`/api/courses/${id}?user_id=${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
      })

      const data = await safeJson(res)

      if (!res.ok) {
        const errorMsg = getApiErrorMessage(data, 'We could not delete the course.')
        toast.error('Failed to delete', errorMsg)
        setDeleteConfirm({ isOpen: false, courseId: null })
        return
      }

      setCourses((prev) => prev.filter((c) => String(c.id) !== String(id)))
      setDeleteConfirm({ isOpen: false, courseId: null })
      toast.success('Course deleted', 'The course has been removed successfully')
    } catch (err) {
      console.error(err)
      toast.error('Error', 'Failed to delete course. Please try again.')
      setDeleteConfirm({ isOpen: false, courseId: null })
    }
  }

  const enrollToCourse = async () => {
    // Enrollment is now handled on the separate page
    // This function can be removed
  }

  const hideCourse = async (courseId) => {
    try {
      const res = await apiFetch(`/api/courses/${courseId}/hide?user_id=${encodeURIComponent(user.id)}`, {
        method: 'POST',
      })

      if (!res.ok) {
        toast.error('Failed to hide', 'Could not hide the course. Please try again.')
        return
      }

      setCourses((prev) => prev.filter((c) => String(c.id) !== String(courseId)))
      toast.success('Course hidden', 'The course has been hidden from your dashboard')
    } catch (err) {
      console.error(err)
      toast.error('Error', 'Failed to hide course. Please try again.')
    }
  }

  const unenrollCourse = async (courseId) => {
    try {
      const res = await apiFetch(`/api/courses/${courseId}/unenroll?user_id=${encodeURIComponent(user.id)}`, {
        method: 'POST',
      })

      if (!res.ok) {
        toast.error('Failed to unenroll', 'Could not unenroll from the course. Please try again.')
        return
      }

      setCourses((prev) => prev.filter((c) => String(c.id) !== String(courseId)))
      toast.success('Unenrolled', 'You have been unenrolled from the course')
    } catch (err) {
      console.error(err)
      toast.error('Error', 'Failed to unenroll. Please try again.')
    }
  }

  const teachingCourses = useMemo(
    () => courses.filter((c) => String(c.author) === String(user?.id)),
    [courses, user?.id]
  )

  const enrolledCourses = useMemo(
    () => courses.filter((c) => String(c.author) !== String(user?.id)),
    [courses, user?.id]
  )

  return (
    <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">

      {loading ? (
        <Loading message="Loading courses...">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-lg border border-token bg-surface" />
            ))}
          </div>
        </Loading>
      ) : courses.length === 0 ? (
        <EmptyCoursesState />
      ) : (
        <div className="space-y-10">
          <CourseSection
            title="Teaching"
            items={teachingCourses}
            emptyText="You are not teaching any classes yet."
            user={user}
            profileName={profileName}
            onCopyCode={copyCode}
            onEdit={(course) => {
              openCreate(course)
            }}
            onDelete={removeCourse}
            onHide={hideCourse}
            onUnenroll={unenrollCourse}
          />

          <CourseSection
            title="Enrolled"
            items={enrolledCourses}
            emptyText="You have not enrolled in any classes yet."
            user={user}
            profileName={profileName}
            onCopyCode={copyCode}
            onEdit={(course) => {
              openCreate(course)
            }}
            onDelete={removeCourse}
            onHide={hideCourse}
            onUnenroll={unenrollCourse}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-sm shadow-lg">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Delete course?</h2>
            <p className="text-sm text-slate-600 mb-6">This action cannot be undone. The course and all its contents will be permanently deleted.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, courseId: null })}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
