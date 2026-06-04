/**
 * REFACTORED CourseDetails.jsx - Architecture improvements
 * 
 * This is a refactored version of CourseDetails that extracts business logic into hooks
 * while maintaining 100% UI fidelity with the original component.
 * 
 * Key improvements:
 * - Uses service layer (courseService, assignmentService, etc.) for all API calls
 * - Extracts hooks: useCourseWorkspace, useCourseMutations, useAssignmentSubmissions, useGradeManager
 * - Parallel API requests with Promise.all()
 * - Better state management with hooks
 * - Proper UTF-8 encoding
 * - Synchronized submission state
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Loading from '../Loading'
import CourseTabs from '../CourseTabs'
import StudentProgress from './StudentProgress'
import TeacherStudentProgress from './TeacherStudentProgress'
import Classwork from './Classwork'
import SimpleClasswork from './SimpleClasswork'
import SubmissionsPanel from './SubmissionsPanel'
import NotificationCenter from './NotificationCenter'
import CourseSettings from './CourseSettings'
import PeopleList from './PeopleList'
import { StreamContainer } from '../stream'
import {
  CourseClassworkWorkspace,
  CourseGradesPanel,
  CoursePeoplePanel,
  CourseStreamPanel,
  CourseWorkspaceHeader,
  SelectedSubmissionOverlay,
} from './CourseWorkspacePanels'
import { useAuth } from '../../lib/AuthProvider'
import { useCourseName } from '../../lib/CourseNameContext'
import { getApiErrorMessage, safeJson } from '../courses/utils'
import { getRandomColor, copyToClipboard } from './dashboardUtils'
import { toast } from '../../lib/ToastProvider'
import { parseAttachments, parseContentWithAttachments, serializeContentWithAttachments, uploadFiles } from '../../lib/fileUtils'
import QuizComposer, { createEmptyQuizDraft } from '../quizzes/QuizComposer'
import QuizAttemptCard from '../quizzes/QuizAttemptCard'
import { normalizeQuizQuestions } from '../quizzes/quizUtils'
import ConfirmDialog from './ConfirmDialog'
import EditModuleModal from './EditModuleModal'
import EditAssignmentModal from './EditAssignmentModal'
import EditQuizModal from './EditQuizModal'
import AnnouncementModal from '../modals/AnnouncementModal'
import ModuleModal from '../modals/ModuleModal'
import AssignmentModal from '../modals/AssignmentModal'
import QuizList from '../quiz/QuizList'
import StudentCourseExperience from '../student/StudentCourseExperience'
import { useModal } from '../../hooks/useModal'

// NEW: Import refactored hooks
import { useCourseWorkspace } from '../../hooks/useCourseWorkspace'
import { useCourseMutations } from '../../hooks/useCourseMutations'
import { useAssignmentSubmissions } from '../../hooks/useAssignmentSubmissions'
import { useGradeManager } from '../../hooks/useGradeManager'
import { useStudentSubmission } from '../../hooks/useStudentSubmission'

import {
  AssignmentOutlined,
  ChangeHistoryOutlined,
  Delete,
  Edit,
  EditOutlined,
  FullscreenOutlined,
  InfoOutlined,
  MoreVert,
  SettingsOutlined,
  SwapHoriz,
} from '@mui/icons-material'

const emptyModule = { title: '', description: '' }
const emptyAssignment = { title: '', instructions: '', due_at: '', module_id: '', status: 'published' }
const emptyAnnouncement = { title: '', body: '' }

function formatDateTime(value) {
  if (!value) return 'No due date'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'No due date' : date.toLocaleString()
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-[28px] border border-token bg-surface p-5 shadow-sm md:p-6">
      <h2 className="text-2xl font-black tracking-[-0.03em] text-main">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-7 text-muted">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Badge({ children, tone = 'bg-slate-100 text-slate-700 border-slate-300' }) {
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>{children}</span>
}

function EmptyState({ children }) {
  return <div className="rounded-2xl border border-token bg-app p-4 text-sm text-muted">{children}</div>
}

export default function CourseDetails() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const courseNameContext = useCourseName() || {}
  const { setCurrentCourseName = () => {} } = courseNameContext
  const userId = user?.id

  // NEW: Use refactored hooks for state management
  const courseWorkspace = useCourseWorkspace(id, userId)
  const courseMutations = useCourseMutations(id, userId, () => courseWorkspace.refresh())
  const assignmentSubmissions = useAssignmentSubmissions(userId)
  const gradeManager = useGradeManager(id, userId)
  const studentSubmission = useStudentSubmission(userId)

  // Local state for UI interactions
  const [message, setMessage] = useState('')
  const [activeComposer, setActiveComposer] = useState('')
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'stream')
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState(null)
  const [headerColor, setHeaderColor] = useState(null)
  const [copiedCodeFeedback, setCopiedCodeFeedback] = useState(false)

  const [moduleForm, setModuleForm] = useState(emptyModule)
  const [assignmentForm, setAssignmentForm] = useState(emptyAssignment)
  const [quizForm, setQuizForm] = useState(createEmptyQuizDraft())
  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncement)

  // Edit modal states
  const [editingModule, setEditingModule] = useState(null)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [editModuleModalOpen, setEditModuleModalOpen] = useState(false)
  const [editAssignmentModalOpen, setEditAssignmentModalOpen] = useState(false)
  const [editQuizModalOpen, setEditQuizModalOpen] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Delete confirmation states
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: '', item: null })
  const [isDeleting, setIsDeleting] = useState(false)

  // Modal states for create operations
  const announcementModal = useModal(false)
  const moduleModal = useModal(false)
  const assignmentModal = useModal(false)

  // Set header color on course load
  useEffect(() => {
    if (courseWorkspace.course) {
      setCurrentCourseName(courseWorkspace.course?.title || 'Course Details')
      setHeaderColor(getRandomColor(courseWorkspace.course?.id))
    }
  }, [courseWorkspace.course, setCurrentCourseName])

  // Load student grades when grades tab is active
  useEffect(() => {
    if (activeTab === 'grades' && !gradeManager.loadingGrades && gradeManager.studentGrades.length === 0) {
      gradeManager.loadStudentGrades()
    }
  }, [activeTab, gradeManager.loadingGrades, gradeManager.studentGrades.length, gradeManager])

  const isTeacher = useMemo(
    () => Boolean(courseWorkspace.course) && (courseWorkspace.course.viewer_role === 'teacher' || String(courseWorkspace.course.author) === String(userId)),
    [courseWorkspace.course, userId]
  )

  const activityFeed = useMemo(() => {
    const items = []

    courseWorkspace.announcements.forEach((item) => {
      items.push({
        id: `ann-${item.id}`,
        type: 'announcement',
        title: item.title,
        body: item.body,
        timestamp: item.created_at,
        iconType: 'announcement',
        color: 'landing-accent-yellow',
        data: item,
      })
    })

    courseWorkspace.modules.forEach((item) => {
      items.push({
        id: `mod-${item.id}`,
        type: 'module',
        title: item.title,
        description: item.description,
        timestamp: item.created_at,
        iconType: 'module',
        color: 'landing-accent-green',
        data: item,
      })
    })

    courseWorkspace.assignments.forEach((item) => {
      items.push({
        id: `asg-${item.id}`,
        type: 'assignment',
        title: item.title,
        instructions: item.instructions,
        timestamp: item.created_at,
        dueAt: item.due_at,
        iconType: 'assignment',
        color: 'landing-accent-blue',
        data: item,
      })
    })

    courseWorkspace.quizzes.forEach((item) => {
      items.push({
        id: `quiz-${item.id}`,
        type: 'quiz',
        title: item.title,
        description: item.description,
        timestamp: item.created_at,
        dueAt: item.due_at,
        iconType: 'quiz',
        color: 'landing-accent-yellow',
        data: item,
      })
    })

    return items.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
  }, [courseWorkspace.announcements, courseWorkspace.modules, courseWorkspace.assignments, courseWorkspace.quizzes])

  const nextDueItem = useMemo(() => {
    const datedItems = [...courseWorkspace.assignments, ...courseWorkspace.quizzes]
      .filter((item) => item.due_at)
      .sort((a, b) => new Date(a.due_at) - new Date(b.due_at))
    return datedItems[0] || null
  }, [courseWorkspace.assignments, courseWorkspace.quizzes])

  // Form handlers
  const createModule = async () => {
    if (!moduleForm.title.trim()) throw new Error('Add a module title before saving.')
    await courseMutations.createModule(moduleForm)
    setModuleForm(emptyModule)
    setActiveComposer('')
  }

  const createAssignment = async () => {
    if (!assignmentForm.title.trim()) throw new Error('Add an assignment title before publishing.')
    await courseMutations.createAssignment(assignmentForm)
    setAssignmentForm(emptyAssignment)
    setActiveComposer('')
  }

  const createQuiz = async () => {
    if (!quizForm.title.trim()) throw new Error('Add a quiz title before publishing.')
    const normalizedQuestions = quizForm.questions
      .map((question) => ({
        id: question.id,
        question: String(question.question || question.text || '').trim(),
        text: String(question.text || '').trim(),
        options: Array.isArray(question.options) ? question.options.map((option) => String(option || '').trim()) : [],
        correct: Number.isInteger(question.correct) ? question.correct : 0,
        correctAnswer: String(question.correctAnswer || question.options?.[question.correct] || '').trim(),
        difficulty: question.difficulty || 'Medium',
        conceptTags: Array.isArray(question.conceptTags) ? question.conceptTags : [],
        explanation: String(question.explanation || '').trim(),
        trivia: String(question.trivia || '').trim(),
        learningTip: String(question.learningTip || '').trim(),
      }))
      .filter((question) => question.text && question.options.every(Boolean))

    if (!normalizedQuestions.length) throw new Error('Add at least one complete question before publishing.')
    await courseMutations.createQuiz({ ...quizForm, questions: normalizedQuestions })
    setQuizForm(createEmptyQuizDraft())
    setActiveComposer('')
  }

  const createAnnouncement = async () => {
    if (!announcementForm.title.trim()) throw new Error('Add an announcement title before publishing.')
    await courseMutations.createAnnouncement(announcementForm)
    setAnnouncementForm(emptyAnnouncement)
    setActiveComposer('')
  }

  const submitWork = async (activityId, contentOverride = null) => {
    await studentSubmission.submitWork(activityId, contentOverride)
    await courseWorkspace.refresh()
  }

  // Edit handlers
  const updateModule = async (updates) => {
    setIsSavingEdit(true)
    try {
      const result = await courseMutations.updateModule(updates)
      courseWorkspace.setModules((prev) => prev.map((m) => (m.id === result.id ? result : m)))
      setEditModuleModalOpen(false)
      setEditingModule(null)
      toast.success('Module updated', 'Your lesson has been saved successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update module', err.message)
    } finally {
      setIsSavingEdit(false)
    }
  }

  const updateAssignment = async (updates) => {
    setIsSavingEdit(true)
    try {
      const result = await courseMutations.updateAssignment(updates)
      courseWorkspace.setAssignments((prev) => prev.map((a) => (a.id === result.id ? result : a)))
      setEditAssignmentModalOpen(false)
      setEditingAssignment(null)
      toast.success('Assignment updated', 'Your assignment has been saved successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update assignment', err.message)
    } finally {
      setIsSavingEdit(false)
    }
  }

  const updateQuiz = async (updates) => {
    setIsSavingEdit(true)
    try {
      const result = await courseMutations.updateQuiz(updates)
      courseWorkspace.setQuizzes((prev) => prev.map((q) => (q.id === result.id ? result : q)))
      setEditQuizModalOpen(false)
      setEditingQuiz(null)
      toast.success('Quiz updated', 'Your quiz has been saved successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update quiz', err.message)
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Delete handlers
  const deleteModule = async (moduleId) => {
    setIsDeleting(true)
    try {
      await courseMutations.deleteModule(moduleId)
      courseWorkspace.setModules((prev) => prev.filter((m) => m.id !== moduleId))
      setDeleteConfirm({ isOpen: false, type: '', item: null })
      toast.success('Module deleted', 'The lesson has been removed')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete module', err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const deleteAssignment = async (assignmentId) => {
    setIsDeleting(true)
    try {
      await courseMutations.deleteAssignment(assignmentId)
      courseWorkspace.setAssignments((prev) => prev.filter((a) => a.id !== assignmentId))
      setDeleteConfirm({ isOpen: false, type: '', item: null })
      toast.success('Assignment deleted', 'The assignment has been removed')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete assignment', err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const deleteQuiz = async (quizId, assignmentId) => {
    setIsDeleting(true)
    try {
      await courseMutations.deleteQuiz(quizId, assignmentId)
      courseWorkspace.setQuizzes((prev) => prev.filter((q) => q.id !== quizId))
      setDeleteConfirm({ isOpen: false, type: '', item: null })
      toast.success('Quiz deleted', 'The quiz has been removed')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete quiz', err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const deleteAnnouncement = async (announcementId) => {
    setIsDeleting(true)
    try {
      await courseMutations.deleteAnnouncement(announcementId)
      courseWorkspace.setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId))
      setDeleteConfirm({ isOpen: false, type: '', item: null })
      toast.success('Announcement deleted', 'The announcement has been removed')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete announcement', err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  // Modal handlers
  const handleCreateAnnouncement = async (formData) => {
    try {
      const attachments = await uploadFiles(formData.files || [])
      await courseMutations.createAnnouncement({
        title: formData.title,
        body: serializeContentWithAttachments(formData.body, attachments),
      })
      announcementModal.closeModal()
      toast.success('Announcement posted', 'Your announcement has been sent to the class')
      await courseWorkspace.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Failed to create announcement', err.message)
      throw err
    }
  }

  const handleCreateModule = async (formData) => {
    try {
      const attachments = await uploadFiles(formData.files || [])
      await courseMutations.createModule({
        title: formData.title,
        description: serializeContentWithAttachments(formData.description, attachments),
      })
      moduleModal.closeModal()
      toast.success('Module created', 'Your lesson has been added to the course')
      await courseWorkspace.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Failed to create module', err.message)
      throw err
    }
  }

  const handleCreateAssignment = async (formData) => {
    try {
      const fields = formData || {}
      const attachments = await uploadFiles(fields.files || [])
      await courseMutations.createAssignment({
        title: fields.title,
        instructions: fields.instructions,
        due_at: fields.due_at ? new Date(fields.due_at).toISOString() : null,
        module_id: fields.module_id || null,
        status: fields.status,
        points: fields.points,
        attachment_url: attachments.length ? JSON.stringify({ files: attachments }) : null,
      })
      assignmentModal.closeModal()
      toast.success('Assignment created', 'Your assignment has been added to the course')
      await courseWorkspace.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Failed to create assignment', err.message)
      throw err
    }
  }

  if (courseWorkspace.loading) return <Loading message="Loading class..." />

  if (!courseWorkspace.course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md rounded-xl bg-white border border-slate-200 p-8 shadow-sm text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-slate-900">Course not found</h1>
          <p className="mt-3 text-slate-600">{message || 'This class could not be loaded.'}</p>
          <Link to="/courses" className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Back to courses</Link>
        </div>
      </div>
    )
  }

  if (!isTeacher) {
    return (
      <StudentCourseExperience
        courseId={courseWorkspace.course.id}
        course={courseWorkspace.course}
        modules={courseWorkspace.modules}
        assignments={courseWorkspace.assignments}
        quizzes={courseWorkspace.quizzes}
        announcements={courseWorkspace.announcements}
        message={message}
        onMessage={setMessage}
        onSubmitAssignment={(activityId, payload) => submitWork(activityId, payload)}
      />
    )
  }

  const changeTab = (tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const shareCourse = () => {
    if (courseWorkspace.course.course_code) {
      const text = `Join my class: ${courseWorkspace.course.title} (Code: ${courseWorkspace.course.course_code})`
      if (navigator.share) {
        navigator.share({ title: courseWorkspace.course.title, text })
      } else {
        toast.copy(text, 'Course code copied to clipboard')
      }
    }
  }

  return (
    <div className="-mx-4 -my-6 min-h-screen bg-slate-50 text-slate-950 md:-mx-8 lg:-mx-10">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <CourseWorkspaceHeader
            course={courseWorkspace.course}
            isTeacher={isTeacher}
            onCustomize={() => setSettingsOpen(true)}
            onShare={shareCourse}
          />
          <div className="mt-5">
            <CourseTabs activeTab={activeTab} onChange={changeTab} isTeacher={isTeacher} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'stream' ? (
          <CourseStreamPanel
            courseId={id}
            announcements={courseWorkspace.announcements}
            assignments={courseWorkspace.assignments}
            quizzes={courseWorkspace.quizzes}
            isTeacher={isTeacher}
            onAddAnnouncement={() => announcementModal.openModal()}
            onEditItem={(type, item) => {
              if (type === 'module') { setEditingModule(item); setEditModuleModalOpen(true) }
              if (type === 'assignment') { setEditingAssignment(item); setEditAssignmentModalOpen(true) }
              if (type === 'quiz') { setEditingQuiz(item); setEditQuizModalOpen(true) }
            }}
            onDeleteItem={(type, item) => setDeleteConfirm({ isOpen: true, type, item })}
            onViewSubmissions={(assignment) => setSelectedAssignmentForGrading(assignment)}
          />
        ) : null}

        {activeTab === 'classwork' ? (
          <CourseClassworkWorkspace
            modules={courseWorkspace.modules}
            assignments={courseWorkspace.assignments}
            quizzes={courseWorkspace.quizzes}
            isTeacher={isTeacher}
            onAddModule={() => moduleModal.openModal()}
            onAddAssignment={() => assignmentModal.openModal()}
            onAddReviewer={() => (window.location.href = `/dashboard/course/${id}/reviewer/types`)}
            onAddQuiz={() => (window.location.href = `/dashboard/course/${id}/quiz/types`)}
            onEditItem={(type, item) => {
              if (type === 'module') { setEditingModule(item); setEditModuleModalOpen(true) }
              if (type === 'assignment') { setEditingAssignment(item); setEditAssignmentModalOpen(true) }
              if (type === 'quiz') { setEditingQuiz(item); setEditQuizModalOpen(true) }
            }}
            onDeleteItem={(type, item) => setDeleteConfirm({ isOpen: true, type, item })}
            onViewSubmissions={(assignment) => setSelectedAssignmentForGrading(assignment)}
          />
        ) : null}

        {activeTab === 'people' ? <CoursePeoplePanel courseId={id} /> : null}

        {activeTab === 'grades' ? (
          <CourseGradesPanel
            isTeacher={isTeacher}
            courseId={id}
            loadingGrades={gradeManager.loadingGrades}
            studentGrades={gradeManager.studentGrades}
          />
        ) : null}
      </div>

      <SelectedSubmissionOverlay
        assignment={selectedAssignmentForGrading}
        courseId={id}
        onClose={() => setSelectedAssignmentForGrading(null)}
      />

      {/* Create Modals */}
      <AnnouncementModal
        isOpen={announcementModal.isOpen}
        onClose={announcementModal.closeModal}
        onSubmit={handleCreateAnnouncement}
        isLoading={false}
        title="Create Announcement"
      />

      <ModuleModal
        isOpen={moduleModal.isOpen}
        onClose={moduleModal.closeModal}
        onSubmit={handleCreateModule}
        isLoading={false}
        title="Create Module"
      />

      <AssignmentModal
        isOpen={assignmentModal.isOpen}
        onClose={assignmentModal.closeModal}
        onSubmit={handleCreateAssignment}
        isLoading={false}
        title="Create Assignment"
        modules={courseWorkspace.modules}
      />

      {/* Edit Modals */}
      <EditModuleModal
        isOpen={editModuleModalOpen}
        module={editingModule}
        onSave={updateModule}
        onCancel={() => { setEditModuleModalOpen(false); setEditingModule(null) }}
        isLoading={isSavingEdit}
      />

      <EditAssignmentModal
        isOpen={editAssignmentModalOpen}
        assignment={editingAssignment}
        modules={courseWorkspace.modules}
        onSave={updateAssignment}
        onCancel={() => { setEditAssignmentModalOpen(false); setEditingAssignment(null) }}
        isLoading={isSavingEdit}
      />

      <EditQuizModal
        isOpen={editQuizModalOpen}
        quiz={editingQuiz}
        onSave={updateQuiz}
        onCancel={() => { setEditQuizModalOpen(false); setEditingQuiz(null) }}
        isLoading={isSavingEdit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={`Delete ${deleteConfirm.type}`}
        message={`Are you sure you want to delete "${deleteConfirm.item?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous={true}
        onConfirm={() => {
          if (deleteConfirm.type === 'module') {
            deleteModule(deleteConfirm.item.id)
          } else if (deleteConfirm.type === 'assignment') {
            deleteAssignment(deleteConfirm.item.id)
          } else if (deleteConfirm.type === 'quiz') {
            deleteQuiz(deleteConfirm.item.id, deleteConfirm.item.assignment_id)
          } else if (deleteConfirm.type === 'announcement') {
            deleteAnnouncement(deleteConfirm.item.id)
          }
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: '', item: null })}
        isLoading={isDeleting}
      />

      {/* Notification Center */}
      <NotificationCenter
        userId={user?.id}
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />

      {/* Course Settings Modal */}
      {settingsOpen && (
        <CourseSettings
          course={courseWorkspace.course}
          onClose={() => setSettingsOpen(false)}
          onUpdate={(updatedCourse) => courseWorkspace.setCourse(updatedCourse)}
        />
      )}
    </div>
  )
}

function Composer({ children, onCancel, onSubmit, submitLabel }) {
  return (
    <div className="mt-6 rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
      <div className="space-y-4">
        {children}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">Cancel</button>
          <button type="button" onClick={onSubmit} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">{submitLabel}</button>
        </div>
      </div>
    </div>
  )
}

function SubmissionPanel({
  activityId,
  submissions,
  loading,
  gradingDrafts,
  onLoad,
  onDraftChange,
  onGrade,
}) {
  const hasLoaded = Array.isArray(submissions)

  return (
    <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Student submissions</h4>
          <p className="mt-0.5 text-xs text-slate-600">
            {hasLoaded ? `${submissions.length} student${submissions.length !== 1 ? 's' : ''} submitted` : 'Load submitted work for this item.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onLoad}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Loading...' : hasLoaded ? 'Refresh' : 'View submissions'}
        </button>
      </div>

      {hasLoaded && submissions.length === 0 ? (
        <div className="mt-3 rounded-lg bg-white border border-slate-200 p-3 text-sm text-slate-600">
          No submissions yet.
        </div>
      ) : null}

      {hasLoaded && submissions.length > 0 ? (
        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
          {submissions.map((submission) => {
            const draft = gradingDrafts[submission.id] || {}
            const submittedText = submission.content || submission.attachment_url || 'No written response.'

            return (
              <div key={submission.id} className="rounded-lg bg-white border border-slate-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                  <div>
                    <div className="font-semibold text-slate-900">{submission.student_name || 'Student'}</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {submission.submitted_at ? `Submitted ${formatDateTime(submission.submitted_at)}` : 'Not submitted'}
                    </div>
                  </div>
                  <Badge tone={submission.status === 'graded' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300'}>
                    {submission.status || 'submitted'}
                  </Badge>
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm leading-6 text-slate-700 font-mono whitespace-pre-wrap">
                  {submittedText}
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-[120px_1fr_100px]">
                  <input
                    className="input-base text-sm"
                    type="number"
                    min="0"
                    placeholder="Score"
                    value={draft.score ?? submission.score ?? ''}
                    onChange={(e) => onDraftChange(submission.id, { score: e.target.value })}
                  />
                  <input
                    className="input-base text-sm"
                    placeholder="Add feedback..."
                    value={draft.feedback ?? submission.feedback ?? ''}
                    onChange={(e) => onDraftChange(submission.id, { feedback: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => onGrade(submission.id)}
                    className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function ClassroomHeroArt() {
  return (
    <div className="relative h-full w-full" aria-hidden="true">
      <div className="absolute -right-10 bottom-0 h-[148px] w-[116px] -rotate-12 rounded-lg bg-primary-token shadow-card" />
      <div className="absolute right-[84px] top-0 h-[188px] w-[140px] -rotate-12 rounded-[6px] landing-accent-yellow shadow-card">
        <div className="absolute left-3 top-0 h-full w-2 bg-primary-token" />
        <div className="absolute left-11 top-[45px] h-16 w-16 rounded-lg landing-accent-yellow" />
        <div className="absolute left-16 top-16 h-16 w-16 rotate-45 rounded-lg landing-accent-yellow" />
        <div className="absolute bottom-9 left-20 h-14 w-24 rounded-md landing-accent-yellow" />
      </div>
      <div className="absolute bottom-0 left-10 h-[118px] w-[96px] rounded-t-full border-l-2 border-token" />
      <div className="absolute bottom-0 left-20 h-[104px] w-[86px] rounded-t-full border-l-2 border-token" />
      <div className="absolute bottom-20 left-8 h-20 w-4 rounded-full bg-primary-token shadow-card" />
      <div className="absolute bottom-16 left-12 h-2 w-2 rounded-full landing-accent-yellow shadow-card" />
    </div>
  )
}
