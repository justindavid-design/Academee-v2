# Stream Cards Integration Guide 🔗

This guide shows how to integrate the modern Stream Cards components into your course/dashboard pages.

---

## 1. Basic Stream Component

```javascript
import React, { useState, useEffect } from 'react'
import {
  AnnouncementCard,
  AssignmentCard,
  QuizCard,
  ModuleCard,
} from '../stream/StreamCards'

export function CourseStream({ courseId, isTeacher }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStreamItems()
  }, [courseId])

  const loadStreamItems = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/courses/${courseId}/stream`)
      const data = await response.json()
      setItems(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8">Loading stream...</div>
  if (error) return <div className="text-red-600 py-8">Error: {error}</div>

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {items.length === 0 ? (
        <div className="text-center py-8 text-slate-500">No items to display</div>
      ) : (
        items.map((item) => (
          <StreamItem
            key={item.id}
            item={item}
            isTeacher={isTeacher}
            onUpdate={loadStreamItems}
          />
        ))
      )}
    </div>
  )
}

function StreamItem({ item, isTeacher, onUpdate }) {
  switch (item.type) {
    case 'announcement':
      return (
        <AnnouncementCard
          announcement={item}
          isTeacher={isTeacher}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPin={handlePin}
        />
      )

    case 'assignment':
      return (
        <AssignmentCard
          assignment={item}
          isTeacher={isTeacher}
          userSubmission={item.userSubmission}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          onViewSubmissions={handleViewSubmissions}
        />
      )

    case 'quiz':
      return (
        <QuizCard
          quiz={item}
          isTeacher={isTeacher}
          userAttempt={item.userAttempt}
          onStart={handleStartQuiz}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )

    case 'module':
      return (
        <ModuleCard
          module={item}
          isTeacher={isTeacher}
          itemCount={item.itemCount}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClick={handleModuleClick}
        />
      )

    default:
      return null
  }

  // Event handlers
  async function handleEdit(item) {
    // Open edit dialog/modal
    console.log('Edit:', item)
  }

  async function handleDelete(item) {
    if (!window.confirm('Are you sure?')) return
    try {
      await fetch(`/api/${item.type}s/${item.id}`, { method: 'DELETE' })
      onUpdate()
    } catch (err) {
      alert('Error deleting: ' + err.message)
    }
  }

  async function handlePin(announcement) {
    try {
      await fetch(`/api/announcements/${announcement.id}/pin`, { method: 'POST' })
      onUpdate()
    } catch (err) {
      alert('Error pinning: ' + err.message)
    }
  }

  async function handleSubmit(assignment) {
    // Open submission dialog
    console.log('Submit assignment:', assignment)
  }

  async function handleViewSubmissions(item) {
    // Navigate to submissions view
    console.log('View submissions:', item)
  }

  async function handleStartQuiz(quiz) {
    // Navigate to quiz
    console.log('Start quiz:', quiz)
  }

  function handleModuleClick() {
    // Navigate to module
    console.log('View module')
  }
}
```

---

## 2. With React Router Integration

```javascript
import { useNavigate, useParams } from 'react-router-dom'

export function CourseStreamWithRouter() {
  const navigate = useNavigate()
  const { courseId } = useParams()

  const handleViewSubmissions = (item) => {
    if (isTeacher) {
      navigate(`/courses/${courseId}/submissions/${item.id}`)
    } else {
      navigate(`/courses/${courseId}/submissions/my-${item.type}/${item.id}`)
    }
  }

  const handleStartQuiz = (quiz) => {
    navigate(`/courses/${courseId}/quizzes/${quiz.id}/attempt`)
  }

  const handleModuleClick = (module) => {
    navigate(`/courses/${courseId}/modules/${module.id}`)
  }

  // Rest of component...
}
```

---

## 3. With State Management (Redux/Zustand)

```javascript
import { useDispatch, useSelector } from 'react-redux'
import { courseActions } from '../store/courseSlice'

export function CourseStreamWithRedux({ courseId }) {
  const dispatch = useDispatch()
  const { items, isTeacher } = useSelector((state) => ({
    items: state.course.streamItems,
    isTeacher: state.auth.isTeacher,
  }))

  const handleDelete = async (item) => {
    await dispatch(
      courseActions.deleteStreamItem({
        type: item.type,
        id: item.id,
      })
    )
  }

  const handleEdit = (item) => {
    dispatch(
      courseActions.openEditDialog({
        type: item.type,
        item,
      })
    )
  }

  // Rest of component...
}
```

---

## 4. With Server-Side Search & Filter

```javascript
export function CourseStreamWithFiltering() {
  const [filter, setFilter] = useState('all') // 'all', 'announcements', 'assignments', 'quizzes', 'modules'
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState('newest') // 'newest', 'oldest', 'due-soon'

  const query = new URLSearchParams({
    type: filter === 'all' ? '' : filter,
    search: searchQuery,
    sort,
  }).toString()

  useEffect(() => {
    loadStreamItems(query)
  }, [filter, searchQuery, sort])

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-6 flex gap-4 items-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Items</option>
          <option value="announcements">Announcements</option>
          <option value="assignments">Assignments</option>
          <option value="quizzes">Quizzes</option>
          <option value="modules">Modules</option>
        </select>

        <input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-lg flex-1"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="due-soon">Due Soon</option>
        </select>
      </div>

      {/* Stream Items */}
      <div className="space-y-4">
        {/* Items rendered here */}
      </div>
    </>
  )
}
```

---

## 5. With Modal/Dialog for Actions

```javascript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function CourseStreamWithModals() {
  const [editDialog, setEditDialog] = useState({
    open: false,
    type: null,
    item: null,
  })

  const handleEdit = (item) => {
    setEditDialog({
      open: true,
      type: item.type,
      item,
    })
  }

  const handleSaveEdit = async (updatedItem) => {
    try {
      const response = await fetch(`/api/${editDialog.type}s/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      })

      if (response.ok) {
        setEditDialog({ open: false, type: null, item: null })
        loadStreamItems()
      }
    } catch (err) {
      alert('Error saving: ' + err.message)
    }
  }

  return (
    <>
      {/* Stream content */}

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ ...editDialog, open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editDialog.type}</DialogTitle>
          </DialogHeader>

          {editDialog.type === 'announcement' && (
            <AnnouncementEditForm
              item={editDialog.item}
              onSave={handleSaveEdit}
              onCancel={() => setEditDialog({ open: false, type: null, item: null })}
            />
          )}

          {editDialog.type === 'assignment' && (
            <AssignmentEditForm
              item={editDialog.item}
              onSave={handleSaveEdit}
              onCancel={() => setEditDialog({ open: false, type: null, item: null })}
            />
          )}

          {/* Similar for quiz and module */}
        </DialogContent>
      </Dialog>
    </>
  )
}
```

---

## 6. With Infinite Scroll

```javascript
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

export function CourseStreamWithInfiniteScroll() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { ref: loadMoreRef, inView } = useIntersectionObserver()

  useEffect(() => {
    if (inView && hasMore) {
      loadMoreItems()
    }
  }, [inView])

  const loadMoreItems = async () => {
    const response = await fetch(`/api/courses/${courseId}/stream?page=${page + 1}`)
    const data = await response.json()

    if (data.items.length === 0) {
      setHasMore(false)
    } else {
      setItems([...items, ...data.items])
      setPage(page + 1)
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <StreamItem key={item.id} item={item} />
      ))}

      {/* Load more trigger */}
      {hasMore && <div ref={loadMoreRef} className="py-8 text-center text-slate-500">Loading more...</div>}
      {!hasMore && <div className="py-8 text-center text-slate-500">No more items</div>}
    </div>
  )
}
```

---

## 7. With Real-Time Updates (WebSocket)

```javascript
import { useEffect } from 'react'

export function CourseStreamWithRealtimeUpdates({ courseId }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const ws = new WebSocket(`wss://api.example.com/courses/${courseId}/stream`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.action) {
        case 'item-created':
          setItems([data.item, ...items])
          break

        case 'item-updated':
          setItems(
            items.map((item) =>
              item.id === data.item.id && item.type === data.item.type
                ? data.item
                : item
            )
          )
          break

        case 'item-deleted':
          setItems(
            items.filter((item) =>
              !(item.id === data.id && item.type === data.type)
            )
          )
          break
      }
    }

    return () => ws.close()
  }, [courseId])

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <StreamItem key={item.id} item={item} />
      ))}
    </div>
  )
}
```

---

## 8. Teacher Dashboard Example

```javascript
export function TeacherCourseStream({ courseId }) {
  const [stats, setStats] = useState({
    announcements: 0,
    assignments: 0,
    quizzes: 0,
    submissions: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const response = await fetch(`/api/courses/${courseId}/stats`)
    const data = await response.json()
    setStats(data)
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Announcements"
          value={stats.announcements}
          icon="📢"
        />
        <StatCard
          title="Assignments"
          value={stats.assignments}
          icon="📋"
        />
        <StatCard
          title="Quizzes"
          value={stats.quizzes}
          icon="📝"
        />
        <StatCard
          title="Submissions"
          value={stats.submissions}
          icon="✓"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setDialog({ open: true, type: 'announcement' })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          + New Announcement
        </button>
        <button
          onClick={() => setDialog({ open: true, type: 'assignment' })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          + New Assignment
        </button>
        <button
          onClick={() => setDialog({ open: true, type: 'quiz' })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          + New Quiz
        </button>
      </div>

      {/* Stream */}
      <CourseStream courseId={courseId} isTeacher={true} />
    </div>
  )
}
```

---

## 9. Student Dashboard Example

```javascript
export function StudentCourseStream({ courseId }) {
  const [upcomingCount, setUpcomingCount] = useState(0)

  useEffect(() => {
    loadUpcomingCount()
  }, [])

  const loadUpcomingCount = async () => {
    const response = await fetch(`/api/courses/${courseId}/upcoming`)
    const data = await response.json()
    setUpcomingCount(data.count)
  }

  return (
    <div>
      {/* Alert for upcoming due dates */}
      {upcomingCount > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          📌 You have <strong>{upcomingCount}</strong> items due soon!
        </div>
      )}

      {/* Stream */}
      <CourseStream courseId={courseId} isTeacher={false} />
    </div>
  )
}
```

---

## 10. Performance Optimization Tips

```javascript
import React, { useMemo, useCallback } from 'react'

export function OptimizedCourseStream({ courseId, isTeacher }) {
  const [items, setItems] = useState([])

  // Memoize sorted items
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [items]
  )

  // Memoize callbacks
  const handleDelete = useCallback(async (item) => {
    await fetch(`/api/${item.type}s/${item.id}`, { method: 'DELETE' })
    setItems(items.filter((i) => !(i.id === item.id && i.type === item.type)))
  }, [items])

  const handleEdit = useCallback((item) => {
    console.log('Edit:', item)
  }, [])

  // Wrap card component in React.memo
  const MemoizedStreamItem = React.memo(StreamItem)

  return (
    <div className="space-y-4">
      {sortedItems.map((item) => (
        <MemoizedStreamItem
          key={`${item.type}-${item.id}`}
          item={item}
          isTeacher={isTeacher}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
```

---

## 11. Error Boundary Integration

```javascript
import { ErrorBoundary } from 'react-error-boundary'

export function SafeCourseStream({ courseId, isTeacher }) {
  const handleError = (error, info) => {
    console.error('Stream error:', error, info)
    // Report to error tracking service
  }

  return (
    <ErrorBoundary onError={handleError} fallback={<div>Error loading stream</div>}>
      <CourseStream courseId={courseId} isTeacher={isTeacher} />
    </ErrorBoundary>
  )
}
```

---

## 12. Accessibility Enhancements

```javascript
export function AccessibleCourseStream({ courseId, isTeacher }) {
  return (
    <div
      role="region"
      aria-label="Course stream"
      aria-live="polite"
      aria-atomic="false"
    >
      {/* Stream items */}
    </div>
  )
}
```

---

## Common Data Structures

### Announcement
```json
{
  "id": "ann_123",
  "type": "announcement",
  "title": "Welcome to the course",
  "body": "Please read the syllabus ##file:/uploads/syllabus.pdf",
  "created_at": "2024-01-15T10:00:00Z",
  "author_name": "Dr. Smith",
  "author_avatar": "/avatars/smith.jpg",
  "likes_count": 5,
  "comment_count": 2
}
```

### Assignment
```json
{
  "id": "asg_456",
  "type": "assignment",
  "title": "Chapter 1 Analysis",
  "instructions": "Write a 2-3 page summary",
  "due_at": "2024-01-22T23:59:59Z",
  "points": 100,
  "attachment_url": "##file:/uploads/chapter1.pdf",
  "userSubmission": {
    "submitted_at": "2024-01-20T15:30:00Z"
  }
}
```

### Quiz
```json
{
  "id": "quiz_789",
  "type": "quiz",
  "title": "Chapter 1 Quiz",
  "description": "Test your knowledge",
  "due_at": "2024-01-22T23:59:59Z",
  "question_count": 20,
  "attempts_allowed": 3,
  "userAttempt": {
    "attempt_number": 1,
    "completed_at": "2024-01-20T16:00:00Z",
    "score": 85
  }
}
```

### Module
```json
{
  "id": "mod_012",
  "type": "module",
  "title": "Chapter 1: Introduction",
  "description": "Learn the basics ##file:/uploads/intro.pdf",
  "created_at": "2024-01-01T09:00:00Z",
  "itemCount": 5
}
```

---

**Next Steps**: Choose the integration pattern that best fits your application architecture and customize as needed!
