import React, { useState } from 'react'
import { Users, LayoutDashboard } from 'lucide-react'
import StudentStreamPanel from './StudentStreamPanel'
import StudentClassworkPanel from './StudentClassworkPanel'
import StudentGradesPanel from './StudentGradesPanel'
import { CourseWorkspaceHeader, CourseStreamPanel, CourseClassworkWorkspace, CoursePeoplePanel, CourseGradesPanel } from './CourseWorkspacePanels'

/**
 * UnifiedCourseWorkspace
 * 
 * Unified workspace component that serves both teacher and student views.
 * 
 * - Teacher: Full access to CourseStreamPanel, CourseClassworkWorkspace, CourseGradesPanel, CoursePeoplePanel
 * - Student: Access to StudentStreamPanel, StudentClassworkPanel, StudentGradesPanel, CoursePeoplePanel
 * 
 * Uses role-based conditional rendering to show appropriate content and actions.
 * Maintains consistent UI styling across both experiences.
 */
export default function UnifiedCourseWorkspace({
  course,
  isTeacher,
  activeTab = 'stream',
  onTabChange,
  // Stream data
  announcements = [],
  assignments = [],
  quizzes = [],
  modules = [],
  // Student-specific data
  userSubmissions = {},
  userQuizAttempts = {},
  studentGrades = [],
  loadingGrades = false,
  // Callbacks
  onAddAnnouncement,
  onAddModule,
  onAddAssignment,
  onAddReviewer,
  onAddQuiz,
  onEditItem,
  onDeleteItem,
  onViewSubmissions,
  onViewAssignment,
  onStartQuiz,
  onShare,
  onCustomize,
}) {
  const courseId = course?.id

  // Tab items - teacher sees more options
  const tabs = isTeacher
    ? [
        { id: 'stream', label: 'Stream', icon: '📢' },
        { id: 'classwork', label: 'Classwork', icon: '📚' },
        { id: 'grades', label: 'Grades', icon: '📊' },
        { id: 'people', label: 'People', icon: '👥' },
      ]
    : [
        { id: 'stream', label: 'Stream', icon: '📢' },
        { id: 'classwork', label: 'Classwork', icon: '📚' },
        { id: 'grades', label: 'Grades', icon: '📊' },
        { id: 'people', label: 'People', icon: '👥' },
      ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <CourseWorkspaceHeader
        course={course}
        isTeacher={isTeacher}
        onCustomize={onCustomize}
        onShare={onShare}
      />

      {/* Tab Navigation */}
      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-token bg-surface p-2 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`
              flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition
              ${
                activeTab === tab.id
                  ? 'bg-emerald-700 text-white'
                  : 'text-main hover:bg-surface-alt'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Stream Tab */}
        {activeTab === 'stream' ? (
          isTeacher ? (
            <CourseStreamPanel
              courseId={courseId}
              announcements={announcements}
              assignments={assignments}
              quizzes={quizzes}
              isTeacher={true}
              onAddAnnouncement={onAddAnnouncement}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
              onViewSubmissions={onViewSubmissions}
            />
          ) : (
            <StudentStreamPanel
              courseId={courseId}
              announcements={announcements}
              assignments={assignments}
              quizzes={quizzes}
              userSubmissions={userSubmissions}
              userQuizAttempts={userQuizAttempts}
              onViewAssignment={onViewAssignment}
            />
          )
        ) : null}

        {/* Classwork Tab */}
        {activeTab === 'classwork' ? (
          isTeacher ? (
            <CourseClassworkWorkspace
              modules={modules}
              assignments={assignments}
              quizzes={quizzes}
              isTeacher={true}
              onAddModule={onAddModule}
              onAddAssignment={onAddAssignment}
              onAddReviewer={onAddReviewer}
              onAddQuiz={onAddQuiz}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
              onViewSubmissions={onViewSubmissions}
            />
          ) : (
            <StudentClassworkPanel
              modules={modules}
              assignments={assignments}
              quizzes={quizzes}
              userSubmissions={userSubmissions}
              userQuizAttempts={userQuizAttempts}
              onViewAssignment={onViewAssignment}
              onStartQuiz={onStartQuiz}
            />
          )
        ) : null}

        {/* Grades Tab */}
        {activeTab === 'grades' ? (
          <CourseGradesPanel
            isTeacher={isTeacher}
            courseId={courseId}
            loadingGrades={loadingGrades}
            studentGrades={isTeacher ? [] : studentGrades}
          />
        ) : null}

        {/* People Tab */}
        {activeTab === 'people' ? <CoursePeoplePanel courseId={courseId} /> : null}
      </div>
    </div>
  )
}
