# Stream Redesign - Integration Examples

## Complete Course Stream Page

This example shows how to implement the complete classroom-inspired stream with all interactive features.

```jsx
import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthProvider'
import {
  AnnouncementActivityCard,
  AssignmentActivityCard,
  QuizActivityCard,
  ModuleActivityCard,
  ActiveLearningDashboard,
} from '@/components/stream'

function CourseStreamPage({ courseId }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [assignments, setAssignments] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [modules, setModules] = useState([])
  const [userSubmissions, setUserSubmissions] = useState({})
  const [userAttempts, setUserAttempts] = useState({})

  const course = {
    id: courseId,
    teacher_name: 'John Doe',
    teacher_avatar: 'https://avatar.example.com/johndoe.jpg',
  }

  // Handle Announcement Click
  const handleAnnouncementClick = useCallback((announcement) => {
    navigate(`/courses/${courseId}/announcements/${announcement.id}`)
  }, [courseId, navigate])

  // Handle Assignment Click
  const handleAssignmentClick = useCallback((assignment) => {
    navigate(`/courses/${courseId}/assignments/${assignment.id}`)
  }, [courseId, navigate])

  // Handle Quiz Click
  const handleQuizClick = useCallback((quiz) => {
    navigate(`/courses/${courseId}/quizzes/${quiz.id}`)
  }, [courseId, navigate])

  // Handle Module Click
  const handleModuleClick = useCallback((module) => {
    navigate(`/courses/${courseId}/modules/${module.id}`)
  }, [courseId, navigate])

  // Handle Assignment Submission Click
  const handleSubmitAssignment = useCallback((assignment) => {
    navigate(`/courses/${courseId}/assignments/${assignment.id}/submit`)
  }, [courseId, navigate])

  // Handle Quiz Start Click
  const handleStartQuiz = useCallback((quiz) => {
    navigate(`/courses/${courseId}/quizzes/${quiz.id}/start`)
  }, [courseId, navigate])

  // Handle View Submissions (Teacher)
  const handleViewSubmissions = useCallback((assignment) => {
    navigate(`/courses/${courseId}/assignments/${assignment.id}/submissions`)
  }, [courseId, navigate])

  const isTeacher = user?.role === 'teacher'

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Stream - 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Stream</h2>

          {/* Announcements */}
          {announcements.map((announcement) => (
            <AnnouncementActivityCard
              key={announcement.id}
              announcement={announcement}
              isTeacher={isTeacher}
              teacherName={course.teacher_name}
              teacherAvatar={course.teacher_avatar}
              onClick={() => handleAnnouncementClick(announcement)}
              onEdit={() => {
                // Navigate to edit page or open modal
                navigate(`/courses/${courseId}/announcements/${announcement.id}/edit`)
              }}
              onDelete={() => {
                // Show delete confirmation
                if (confirm('Delete this announcement?')) {
                  // Call delete API
                  deleteAnnouncement(announcement.id)
                }
              }}
              onPin={() => {
                // Call pin/unpin API
                togglePinAnnouncement(announcement.id)
              }}
            />
          ))}

          {/* Assignments */}
          {assignments.map((assignment) => (
            <AssignmentActivityCard
              key={assignment.id}
              assignment={assignment}
              isTeacher={isTeacher}
              userSubmission={userSubmissions[assignment.id]}
              teacherName={course.teacher_name}
              teacherAvatar={course.teacher_avatar}
              onClick={() => handleAssignmentClick(assignment)}
              onSubmit={() => handleSubmitAssignment(assignment)}
              onEdit={() => {
                navigate(`/courses/${courseId}/assignments/${assignment.id}/edit`)
              }}
              onDelete={() => {
                if (confirm('Delete this assignment?')) {
                  deleteAssignment(assignment.id)
                }
              }}
              onViewSubmissions={() => handleViewSubmissions(assignment)}
            />
          ))}

          {/* Quizzes */}
          {quizzes.map((quiz) => (
            <QuizActivityCard
              key={quiz.id}
              quiz={quiz}
              isTeacher={isTeacher}
              userAttempt={userAttempts[quiz.id]}
              teacherName={course.teacher_name}
              teacherAvatar={course.teacher_avatar}
              onClick={() => handleQuizClick(quiz)}
              onStart={() => handleStartQuiz(quiz)}
              onEdit={() => {
                navigate(`/courses/${courseId}/quizzes/${quiz.id}/edit`)
              }}
              onDelete={() => {
                if (confirm('Delete this quiz?')) {
                  deleteQuiz(quiz.id)
                }
              }}
            />
          ))}

          {/* Modules */}
          {modules.map((module) => (
            <ModuleActivityCard
              key={module.id}
              module={module}
              isTeacher={isTeacher}
              teacherName={course.teacher_name}
              teacherAvatar={course.teacher_avatar}
              onClick={() => handleModuleClick(module)}
              onOpen={() => handleModuleClick(module)}
              onEdit={() => {
                navigate(`/courses/${courseId}/modules/${module.id}/edit`)
              }}
              onDelete={() => {
                if (confirm('Delete this module?')) {
                  deleteModule(module.id)
                }
              }}
            />
          ))}
        </div>

        {/* Active Learning Sidebar - 1 column */}
        <aside className="space-y-4">
          {/* Active Learning Dashboard */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">
              📚 Active Learning
            </h3>
            
            <ActiveLearningDashboard
              modules={modules}
              assignments={assignments}
              quizzes={quizzes}
              userSubmissions={userSubmissions}
              userAttempts={userAttempts}
              onNavigateModule={handleModuleClick}
              onNavigateAssignment={handleAssignmentClick}
              onNavigateQuiz={handleQuizClick}
            />
          </div>

          {/* Course Info Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Course Info</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <p><strong>Teacher:</strong> {course.teacher_name}</p>
              <p><strong>Code:</strong> {course.course_code}</p>
              <p><strong>Students:</strong> {course.student_count || 0}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CourseStreamPage
```

## Stream with Edit Modals

Example showing how to handle editing with modals:

```jsx
function CourseStreamWithModals() {
  const [editingItem, setEditingItem] = useState(null)
  const [editType, setEditType] = useState(null) // 'announcement', 'assignment', 'quiz', 'module'
  const [showEditModal, setShowEditModal] = useState(false)

  const handleEditClick = useCallback((type, item) => {
    setEditType(type)
    setEditingItem(item)
    setShowEditModal(true)
  }, [])

  const handleSaveEdit = useCallback(async (updatedData) => {
    // Call API to update
    const endpoint = {
      announcement: `/api/announcements/${editingItem.id}`,
      assignment: `/api/assignments/${editingItem.id}`,
      quiz: `/api/quizzes/${editingItem.id}`,
      module: `/api/modules/${editingItem.id}`,
    }[editType]

    await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    })

    // Refresh data
    loadCourseData()
    setShowEditModal(false)
  }, [editingItem, editType])

  return (
    <>
      <AnnouncementActivityCard
        onEdit={(item) => handleEditClick('announcement', item)}
        {...props}
      />

      {showEditModal && editType === 'announcement' && (
        <AnnouncementEditModal
          item={editingItem}
          onSave={handleSaveEdit}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  )
}
```

## Stream with Inline Comments

Example showing how to add inline comments to the stream:

```jsx
function CourseStreamWithComments() {
  const [comments, setComments] = useState({})

  return (
    <>
      <AnnouncementActivityCard
        onClick={(announcement) => {
          // Show comment thread
          navigate(`/announcements/${announcement.id}`)
        }}
        {...props}
      />

      {/* Or render inline comments */}
      <div className="mt-4 space-y-2 ml-4 pl-4 border-l-2 border-slate-200">
        {(comments[announcement.id] || []).map((comment) => (
          <div key={comment.id} className="text-sm text-slate-600">
            <strong>{comment.author}</strong>: {comment.text}
          </div>
        ))}
      </div>
    </>
  )
}
```

## Stream with Drag & Drop Reordering

Example showing how to add drag-and-drop card ordering:

```jsx
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function DraggableActivityCard(props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AnnouncementActivityCard {...props} />
    </div>
  )
}

function CourseStreamWithDragDrop() {
  const [items, setItems] = useState([])

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      // Reorder items
      const newItems = [...items]
      const activeIndex = items.findIndex((i) => i.id === active.id)
      const overIndex = items.findIndex((i) => i.id === over.id)
      ;[newItems[activeIndex], newItems[overIndex]] = [
        newItems[overIndex],
        newItems[activeIndex],
      ]
      setItems(newItems)
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.map((item) => (
            <DraggableActivityCard key={item.id} item={item} {...props} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

## Stream with Filtering

Example showing how to add filter controls:

```jsx
function CourseStreamWithFilters() {
  const [selectedTypes, setSelectedTypes] = useState({
    announcements: true,
    assignments: true,
    quizzes: true,
    modules: true,
  })

  const filteredItems = useMemo(() => {
    const all = [
      ...announcements.map((a) => ({ ...a, type: 'announcements' })),
      ...assignments.map((a) => ({ ...a, type: 'assignments' })),
      ...quizzes.map((q) => ({ ...q, type: 'quizzes' })),
      ...modules.map((m) => ({ ...m, type: 'modules' })),
    ]

    return all.filter((item) => selectedTypes[item.type])
  }, [announcements, assignments, quizzes, modules, selectedTypes])

  return (
    <>
      {/* Filter Controls */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['announcements', 'assignments', 'quizzes', 'modules'].map((type) => (
          <button
            key={type}
            onClick={() =>
              setSelectedTypes((prev) => ({
                ...prev,
                [type]: !prev[type],
              }))
            }
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              selectedTypes[type]
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Filtered Stream */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          if (item.type === 'announcements') {
            return <AnnouncementActivityCard key={item.id} announcement={item} {...props} />
          }
          // ... render other types
        })}
      </div>
    </>
  )
}
```

## Stream with Real-time Updates

Example showing how to handle real-time updates:

```jsx
function CourseStreamWithRealtime() {
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = supabase
      .from('announcements')
      .on('*', (payload) => {
        if (payload.eventType === 'INSERT') {
          // New announcement added - add to top
          setAnnouncements((prev) => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          // Announcement updated
          setAnnouncements((prev) =>
            prev.map((a) => (a.id === payload.new.id ? payload.new : a))
          )
        } else if (payload.eventType === 'DELETE') {
          // Announcement deleted
          setAnnouncements((prev) => prev.filter((a) => a.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => unsubscribe.unsubscribe()
  }, [])

  return (
    <div className="space-y-4">
      {/* Unread indicator */}
      {unreadCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <span className="font-semibold text-blue-700">{unreadCount} new updates</span>
          <button
            onClick={() => loadLatestUpdates()}
            className="ml-3 text-blue-600 underline"
          >
            Load now
          </button>
        </div>
      )}

      {/* Stream with animations */}
      <AnimatePresence mode="popLayout">
        {announcements.map((announcement) => (
          <AnnouncementActivityCard
            key={announcement.id}
            announcement={announcement}
            {...props}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
```

## Stream with Keyboard Shortcuts

Example showing keyboard shortcuts for power users:

```jsx
function CourseStreamWithKeyboard() {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n': // Ctrl+N: New announcement
            e.preventDefault()
            navigate('/announcements/new')
            break
          case 'f': // Ctrl+F: Filter/Search
            e.preventDefault()
            setShowSearch(true)
            break
          case 'j': // Ctrl+J: Next item
            e.preventDefault()
            focusNextItem()
            break
          case 'k': // Ctrl+K: Previous item
            e.preventDefault()
            focusPreviousItem()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return <CourseStream {...props} />
}
```

These examples show how to leverage the new stream components with common patterns and features. Mix and match based on your needs!
