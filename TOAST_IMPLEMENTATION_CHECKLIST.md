# Toast Implementation Checklist

Use this checklist when adding modern toast notifications to any component in the application.

## Pre-Implementation

- [ ] Component identified that needs notification updates
- [ ] All feedback mechanisms currently used: (`setMessage`, `alert()`, inline banners, etc.)
- [ ] Build the project to ensure current state works: `npm run build`
- [ ] Have an understanding of the component's error handling flow

## Step 1: Import Toast

```jsx
import { toast } from '../../lib/ToastProvider'
```

- [ ] Toast imported at top of component file
- [ ] Path is relative to component location (adjust `../../` based on folder depth)
- [ ] No circular import issues (toast should be available to all components)

## Step 2: Remove Message State

Identify and remove all message-related state variables:

```jsx
// REMOVE:
const [message, setMessage] = useState('')
const [error, setError] = useState('')
const [successMsg, setSuccessMsg] = useState('')

// REMOVE:
const clearMessage = () => setMessage('')
```

- [ ] All `setMessage` state variables removed
- [ ] All clear/reset message functions removed
- [ ] No orphaned references to removed state

## Step 3: Replace Inline Banners from JSX

Remove all message display elements from your component's JSX:

```jsx
// REMOVE:
{message && <div className="...banner...">{message}</div>}
{error && <ErrorAlert message={error} />}
{successMsg && <SuccessAlert message={successMsg} />}
```

- [ ] All message display blocks removed from JSX
- [ ] No CSS classes left for styling removed banners
- [ ] Component JSX is cleaner and simpler

## Step 4: Replace alert() Calls

Find and replace all `alert()` statements:

```jsx
// REPLACE:
alert('Please enter a value')
alert('Operation successful')

// WITH:
toast.warning('Validation error', 'Please enter a value')
toast.success('Success', 'Operation completed successfully')
```

- [ ] All `alert()` calls replaced with appropriate toast type
- [ ] Messages split into title and details where appropriate
- [ ] Tone of message matches toast type

## Step 5: Replace setMessage with Toast - Success Cases

For successful operations:

```jsx
// BEFORE:
try {
  await doSomething()
  setMessage('Operation successful')
}

// AFTER:
try {
  await doSomething()
  toast.success('Success', 'Operation completed successfully')
}
```

- [ ] All success `setMessage()` calls replaced with `toast.success()`
- [ ] Success messages use clear, user-friendly language
- [ ] Past tense used for completed actions

## Step 6: Replace setMessage with Toast - Error Cases

For error handling:

```jsx
// BEFORE:
catch (err) {
  setMessage('Failed: ' + err.message)
}

// AFTER:
catch (err) {
  toast.error('Operation failed', err.message)
}
```

- [ ] All error `setMessage()` calls replaced with `toast.error()`
- [ ] Error messages include helpful context
- [ ] User-friendly error messages (not technical jargon)
- [ ] No `setMessage('')` (clearing) needed

## Step 7: Update Async/Loading States

Replace loading feedback:

```jsx
// BEFORE:
setMessage('Saving...')
await save()
setMessage('Saved successfully')

// AFTER:
const toastId = toast.loading('Saving your work...')
try {
  await save()
  toast.dismiss(toastId)
  toast.success('Saved', 'Your work has been saved')
} catch (err) {
  toast.dismiss(toastId)
  toast.error('Save failed', err.message)
}
```

- [ ] Loading toast shown before async operation
- [ ] Loading toast dismissed before success/error toast
- [ ] All code paths dismiss loading toast (try/catch/finally)
- [ ] No lingering loading spinners after operation completes

## Step 8: Handle Clipboard Operations

Update any clipboard operations:

```jsx
// BEFORE:
await navigator.clipboard.writeText(code)
setMessage('Copied')

// AFTER:
toast.copy(code, 'Code copied to clipboard')
```

- [ ] All `navigator.clipboard.writeText()` replaced with `toast.copy()`
- [ ] Copy operation shows feedback automatically
- [ ] Error handling is built-in

## Step 9: Test the Component

- [ ] Happy path: All success cases show correct toast
- [ ] Error path: All error cases show error toast
- [ ] Validation: Warning toasts appear for invalid input
- [ ] Loading states: Loading toast appears and disappears correctly
- [ ] Multiple operations: Toasts appear in correct order (not overlapping incorrectly)
- [ ] Rapid clicks: Component handles multiple quick actions without duplicates
- [ ] Dismiss: User can close toast manually
- [ ] Auto-dismiss: Toasts auto-dismiss after appropriate duration

## Step 10: Verify Cleanup

- [ ] No `setMessage` references remain
- [ ] No `alert()` calls remain
- [ ] No inline message banners in JSX
- [ ] No unused imports (especially removed ones)
- [ ] Component still functions identically to before
- [ ] No console errors or warnings

## Step 11: Build and Run

```bash
# Build to check for issues
npm run build

# Run dev server to test in browser
npm run dev
```

- [ ] Build completes successfully with no new errors
- [ ] No TypeScript errors if using TS
- [ ] Application runs without console errors
- [ ] Toasts appear correctly in the browser
- [ ] Toast positioning works on all screen sizes

## Step 12: Final Code Review Checklist

- [ ] Imported toast from correct path
- [ ] Used appropriate toast type for each message
- [ ] Messages are clear and actionable
- [ ] Error messages help user understand what went wrong
- [ ] Loading states properly managed
- [ ] No console warnings or errors
- [ ] No accessibility issues
- [ ] Code follows component's existing style
- [ ] No regressions in functionality

## Common Issues and Solutions

### Issue: Toast not showing
**Solution:**
1. Check that `ToastProvider` wraps app in `src/App.jsx`
2. Verify import path is correct relative to component
3. Check browser console for errors
4. Ensure `react-hot-toast` is installed: `npm list react-hot-toast`

### Issue: Multiple toasts appearing
**Solution:**
1. Check for duplicate function calls
2. Verify loading toast is dismissed before showing success/error
3. Look for toast calls in both parent and child components
4. Check for unintended re-renders causing multiple calls

### Issue: Toast dismissed too quickly
**Solution:**
1. Increase duration parameter: `toast.success('Title', 'Message', 5000)`
2. Don't use `toast.dismiss()` before user should see it
3. For loading operations, ensure you dismiss loading before showing result

### Issue: Styling looks wrong
**Solution:**
1. Verify Tailwind CSS is working globally
2. Check that `lucide-react` package is installed
3. Clear browser cache and rebuild: `npm run build`
4. Check if custom CSS is overriding toast styles

### Issue: TypeScript errors with toast
**Solution:**
```jsx
// Ensure proper typing
import { toast } from '../../lib/ToastProvider'

// If still have issues, can use type assertion
(toast as any).success('Title', 'Message')
```

## Helpful Tips

**Tip 1:** Use consistent message patterns
```jsx
// Consistent pattern:
toast.success('Action completed', 'What was done and/or next steps')
toast.error('Action failed', 'Why it failed and how to fix')
```

**Tip 2:** Group related toast calls
```jsx
// Good: Related operations grouped
const handleSubmit = async () => {
  try {
    // ... validation ...
    const toastId = toast.loading('Submitting...')
    // ... submit ...
    toast.dismiss(toastId)
    toast.success('Submitted', 'Your work has been received')
  } catch (err) {
    toast.error('Submission failed', err.message)
  }
}
```

**Tip 3:** Test error states
```jsx
// Don't just test happy path, also test:
// - Network failures
// - Validation errors
// - Permission errors
// - Timeout scenarios
```

**Tip 4:** Keep messages user-centric
```jsx
// ❌ Avoid:
toast.error('400 Bad Request', 'Validation error in field names')

// ✅ Prefer:
toast.error('Invalid input', 'Please enter your full name')
```

## Example Component Template

Here's a template for a fully updated component:

```jsx
import React, { useState } from 'react'
import { toast } from '../../lib/ToastProvider'
import { apiFetch } from '../../lib/apiClient'

export default function MyComponent() {
  const [loading, setLoading] = useState(false)
  // ✓ NO message state

  const handleAction = async () => {
    try {
      setLoading(true)
      // Optionally show loading toast
      // const toastId = toast.loading('Processing...')
      
      const res = await apiFetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify({ /* data */ })
      })
      
      if (!res.ok) {
        throw new Error('Failed to perform action')
      }
      
      toast.success('Success', 'Action completed successfully')
      // ✓ Await refresh if needed
      // await refreshData()
    } catch (err) {
      toast.error('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleAction} disabled={loading}>
        {loading ? 'Processing...' : 'Perform Action'}
      </button>
      {/* ✓ NO message banner JSX */}
    </div>
  )
}
```

## Documentation References

- **Full Toast API**: See `TOAST_SYSTEM_GUIDE.md`
- **Code Examples**: See `TOAST_EXAMPLES.md`
- **Toast Source Code**: `src/lib/ToastProvider.jsx`
- **React Hot Toast Docs**: https://hot-toast.com

## Sign Off

- [ ] Component fully migrated to toast system
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Ready for production
