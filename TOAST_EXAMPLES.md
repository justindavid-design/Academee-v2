## Toast Notification System - Quick Examples

### Common Patterns

#### 1. Simple API Call with Success/Error

```jsx
import { toast } from '../../lib/ToastProvider'

const publishAssignment = async (assignmentData) => {
  try {
    const res = await apiFetch('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    })
    
    if (!res.ok) throw new Error('Failed to publish')
    
    toast.success('Assignment published', 'Your assignment is now visible to students')
    await refreshAssignments() // Reload data
  } catch (err) {
    toast.error('Failed to publish', err.message)
  }
}
```

#### 2. Form Submission with Validation

```jsx
const submitQuiz = async (quizData) => {
  // Validation
  if (!quizData.title.trim()) {
    toast.warning('Missing title', 'Please enter a quiz title')
    return
  }
  
  if (quizData.questions.length === 0) {
    toast.warning('No questions', 'Add at least one question to the quiz')
    return
  }
  
  // Submit
  try {
    const res = await apiFetch('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    })
    toast.success('Quiz created', `"${quizData.title}" has been added to your course`)
  } catch (err) {
    toast.error('Failed to create quiz', err.message)
  }
}
```

#### 3. Delete with Confirmation

```jsx
const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, itemId: null })

const openDeleteDialog = (itemId) => {
  setDeleteConfirm({ isOpen: true, itemId })
}

const confirmDelete = async () => {
  try {
    const res = await apiFetch(`/api/assignments/${deleteConfirm.itemId}`, {
      method: 'DELETE'
    })
    
    if (!res.ok) throw new Error('Failed to delete')
    
    setDeleteConfirm({ isOpen: false, itemId: null })
    toast.success('Deleted', 'The assignment has been removed')
    await refreshAssignments()
  } catch (err) {
    toast.error('Failed to delete', err.message)
  }
}

// In JSX:
return (
  <>
    <button onClick={() => openDeleteDialog(itemId)}>Delete</button>
    
    {deleteConfirm.isOpen && (
      <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-bold">Confirm deletion?</h2>
          <p className="text-sm text-slate-600 mt-2">This cannot be undone.</p>
          <div className="flex gap-3 mt-6 justify-end">
            <button onClick={() => setDeleteConfirm({ isOpen: false })}>Cancel</button>
            <button onClick={confirmDelete} className="bg-red-600 text-white">Delete</button>
          </div>
        </div>
      </div>
    )}
  </>
)
```

#### 4. Bulk Operations with Progress

```jsx
const gradeAllSubmissions = async (submissions) => {
  const toastId = toast.loading(`Grading submissions...`, `0 of ${submissions.length}`)
  
  try {
    for (let i = 0; i < submissions.length; i++) {
      const submission = submissions[i]
      
      // Grade individual submission
      await apiFetch(`/api/submissions/${submission.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ score: submission.score })
      })
      
      // Update toast message (visual feedback)
      if ((i + 1) % 5 === 0) {
        // Update happens in background, toast stays visible
      }
    }
    
    toast.dismiss(toastId)
    toast.success('All graded', `Successfully graded ${submissions.length} submissions`)
  } catch (err) {
    toast.dismiss(toastId)
    toast.error('Grading failed', err.message)
  }
}
```

#### 5. Copy Clipboard Operations

```jsx
// Single action
const handleCopyCode = (courseCode) => {
  toast.copy(courseCode, `Course code copied - share with your class`)
}

// With custom message
const handleCopyLink = (shareUrl) => {
  toast.copy(shareUrl, 'Class link copied to clipboard')
}

// Export data
const handleExportJSON = (jsonData) => {
  toast.copy(
    JSON.stringify(jsonData, null, 2),
    'JSON exported to clipboard'
  )
}

// In JSX:
<button onClick={() => handleCopyCode('ABC123')}>
  📋 Copy Code
</button>
```

#### 6. Long-running Async Operation

```jsx
const generateReport = async (courseId) => {
  const toastId = toast.loading(
    'Generating report...',
    'This may take a few minutes'
  )
  
  try {
    const res = await apiFetch(`/api/courses/${courseId}/report/generate`, {
      method: 'POST'
    })
    
    const data = await res.json()
    
    if (!res.ok) throw new Error(data.error)
    
    toast.dismiss(toastId)
    
    toast.success(
      'Report ready',
      'Your report is ready to download'
    )
    
    // Trigger download
    downloadReport(data.reportUrl)
    
  } catch (err) {
    toast.dismiss(toastId)
    toast.error(
      'Report generation failed',
      err.message || 'Please try again'
    )
  }
}
```

#### 7. Multiple Async Operations in Sequence

```jsx
const publishCourse = async (courseId) => {
  try {
    // Step 1
    toast.info('Publishing course...', 'Step 1 of 3: Validating content')
    await validateCourseContent(courseId)
    
    // Step 2
    toast.info('Publishing course...', 'Step 2 of 3: Processing materials')
    await processMaterials(courseId)
    
    // Step 3
    toast.info('Publishing course...', 'Step 3 of 3: Notifying students')
    await notifyStudents(courseId)
    
    toast.success('Course published', 'All students have been notified')
  } catch (err) {
    toast.error('Publication failed', err.message)
  }
}
```

#### 8. Conditional Toast Logic

```jsx
const updateAssignment = async (assignmentId, updates) => {
  try {
    const hasDateChange = updates.due_at && updates.due_at !== originalDueDate
    
    const res = await apiFetch(`/api/assignments/${assignmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
    
    if (!res.ok) throw new Error('Failed to update')
    
    // Different message based on what changed
    if (hasDateChange) {
      toast.info(
        'Assignment updated',
        `Due date changed to ${new Date(updates.due_at).toLocaleDateString()}`
      )
    } else {
      toast.success('Assignment updated', 'Changes have been saved')
    }
  } catch (err) {
    toast.error('Failed to update', err.message)
  }
}
```

#### 9. Error Handling with User-Friendly Messages

```jsx
const submitGrade = async (submissionId, score, feedback) => {
  try {
    // Input validation
    if (score === '' && !feedback) {
      toast.warning('Empty submission', 'Please add a score or feedback')
      return
    }
    
    const res = await apiFetch(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ score, feedback })
    })
    
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || 'Failed to save grade')
    }
    
    toast.success('Grade saved', 'Feedback has been sent to the student')
  } catch (err) {
    // Map technical errors to user-friendly messages
    let message = err.message
    
    if (err.message.includes('network')) {
      message = 'Check your internet connection and try again'
    } else if (err.message.includes('unauthorized')) {
      message = 'You do not have permission to grade this submission'
    }
    
    toast.error('Could not save grade', message)
  }
}
```

#### 10. Notification with Action (Info only)

```jsx
const handleNewCourseCreated = () => {
  toast.info(
    'Course created',
    'Visit your courses to start adding content'
  )
  // Note: For actions, users can dismiss and navigate manually
  // Avoid in-toast action buttons for complexity
}

// Better approach: Combine toast with navigation
const handleNewCourseCreated = (courseId) => {
  toast.success('Course created', 'Opening course editor...')
  
  // Automatically navigate
  setTimeout(() => {
    navigate(`/courses/${courseId}/edit`)
  }, 500)
}
```

### Migration Guide: From setMessage to Toast

#### Before: Using setMessage

```jsx
const [message, setMessage] = useState('')

const deleteQuiz = async (quizId) => {
  try {
    setMessage('Deleting...')
    await apiFetch(`/api/quizzes/${quizId}`, { method: 'DELETE' })
    setMessage('Quiz deleted successfully')
  } catch (err) {
    setMessage('Error: ' + err.message)
  }
}

// In JSX:
{message && (
  <div className="p-4 bg-red-50 border border-red-200 rounded">
    {message}
  </div>
)}
```

#### After: Using Toast

```jsx
import { toast } from '../../lib/ToastProvider'

const deleteQuiz = async (quizId) => {
  try {
    const res = await apiFetch(`/api/quizzes/${quizId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete quiz')
    toast.success('Quiz deleted', 'The quiz has been removed from the course')
  } catch (err) {
    toast.error('Failed to delete', err.message)
  }
}

// No JSX needed - toast appears automatically!
```

### Best Practices Checklist

- [ ] Use appropriate toast type (success/error/warning/info/loading)
- [ ] Keep messages concise and actionable
- [ ] Dismiss loading toasts before showing success/error
- [ ] Always catch errors and show user-friendly messages
- [ ] Use `toast.copy()` for clipboard operations instead of manual handling
- [ ] Remove inline message banners from JSX
- [ ] Remove `setMessage` state when migrating to toast
- [ ] Test toast display on different screen sizes
- [ ] Provide context in two-part messages (title + details)
- [ ] Don't stack too many toasts at once (limit to 3-4)

### Common Mistakes to Avoid

❌ **Don't:** Forget to dismiss loading toast
```jsx
const toastId = toast.loading('Saving...')
await save()
// Missing: toast.dismiss(toastId)
```

✅ **Do:** Always dismiss loading toast
```jsx
const toastId = toast.loading('Saving...')
try {
  await save()
  toast.dismiss(toastId)
  toast.success('Saved')
} catch (err) {
  toast.dismiss(toastId)
  toast.error('Failed', err.message)
}
```

❌ **Don't:** Show generic error messages
```jsx
toast.error('Error', 'Something went wrong')
```

✅ **Do:** Provide specific, actionable errors
```jsx
toast.error('Validation failed', 'Please fill in the assignment title')
```

❌ **Don't:** Mix old and new notification systems
```jsx
setMessage('Old way')
toast.success('New way') // Confusing!
```

✅ **Do:** Use only toast system throughout component
```jsx
toast.success('Assignment saved')
```
