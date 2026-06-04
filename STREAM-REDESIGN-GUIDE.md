# 🎓 Classroom-Inspired Stream & Active Learning UI Redesign

## Overview

This redesign transforms Academee's Course Stream and Active sections into a modern, Google Classroom-inspired activity feed system. The new design prioritizes clean, educational-focused interactions while maintaining full functionality.

## Key Components

### 1. **ClassroomActivityCard** (`ClassroomActivityCard.jsx`)

The foundational card component that provides:
- Clean, minimalist design with subtle left border accents
- Variant support (default, announcement, assignment, quiz, reviewer)
- Full keyboard and mouse interactivity
- Smooth animations and hover states

**Usage:**
```jsx
import { ClassroomActivityCard, CardHeader, CardContent, CardMetadata, CardAction, ActionButton } from '@/components/stream'

<ClassroomActivityCard variant="assignment" onClick={() => {}}>
  <CardHeader teacherName="John Doe" actionLabel="Posted an assignment" timestamp="2 hours ago" />
  <CardContent title="Assignment Title" description="Brief description" />
  <CardMetadata items={[{ icon: Calendar, label: 'Due tomorrow' }]} />
  <CardAction>
    <ActionButton label="Submit Work" variant="primary" onClick={() => {}} />
  </CardAction>
</ClassroomActivityCard>
```

### 2. **Activity Cards** (`ActivityCards.jsx`)

Pre-built, fully-featured cards for different content types:

#### `AnnouncementActivityCard`
Displays class announcements with teacher info, title, description, and timestamps.
- Teacher avatar and name
- Posted action label
- Announcement content
- Menu options (Edit, Pin, Delete)
- Optional "View Details" button for students

#### `AssignmentActivityCard`
Shows assignments with submission status and due dates.
- Status badges (Submitted, Overdue, Pending)
- Due date with relative time
- Points value
- Metadata display
- Context-aware action buttons

#### `QuizActivityCard`
Displays quizzes with completion status and score.
- Question count
- Due date
- Completion status
- User score (if completed)
- Attempts remaining
- Start/Retake/View Results buttons

#### `ModuleActivityCard`
Shows learning modules/lessons.
- Module title and description
- Teacher info
- Open module action

#### `ReviewerActivityCard`
Displays peer review activities.
- Reviewer title
- Peer review indicator
- Open reviewer action

**Example Usage:**
```jsx
import {
  AnnouncementActivityCard,
  AssignmentActivityCard,
  QuizActivityCard,
} from '@/components/stream'

// Announcement
<AnnouncementActivityCard
  announcement={announcementData}
  isTeacher={false}
  teacherName="John Doe"
  teacherAvatar={null}
  onClick={() => navigate('/announcements/123')}
/>

// Assignment
<AssignmentActivityCard
  assignment={assignmentData}
  isTeacher={false}
  userSubmission={submissionData}
  teacherName="John Doe"
  onSubmit={() => showSubmissionModal()}
  onClick={() => navigate('/assignments/123')}
/>
```

### 3. **Active Learning Cards** (`ActiveLearningCards.jsx`)

Compact cards for the "Active Learning" sidebar dashboard:

#### `ContinueLearningCard`
Shows partially completed modules.
- Progress percentage
- Progress bar visualization
- Module title

#### `PendingAssignmentCard`
Displays upcoming assignments.
- Days until due
- Status (Pending, Due Soon, Overdue, Submitted)
- Points value
- Color-coded variant

#### `UpcomingQuizCard`
Shows upcoming quizzes.
- Question count
- Due date
- Attempts remaining or score
- Color-coded status

#### `ActiveLearningDashboard`
Complete dashboard showing all active learning items organized by type.

**Example Usage:**
```jsx
import { ActiveLearningDashboard } from '@/components/stream'

<ActiveLearningDashboard
  modules={modules}
  assignments={assignments}
  quizzes={quizzes}
  userSubmissions={userSubmissions}
  userAttempts={userAttempts}
  onNavigateModule={(module) => navigate(`/modules/${module.id}`)}
  onNavigateAssignment={(assignment) => navigate(`/assignments/${assignment.id}`)}
  onNavigateQuiz={(quiz) => navigate(`/quizzes/${quiz.id}`)}
/>
```

## Stream Design Principles

### 1. **Clean Hierarchy**
- Teacher info (avatar + name) at top
- Action label (e.g., "Posted an assignment")
- Content title in large, readable font
- Brief description/preview
- Metadata and status at bottom
- Action buttons in footer

### 2. **Visual Differentiation**
- Subtle left borders (4px) color-coded by type
- Announcement: Amber (#FBBF24)
- Assignment: Blue (#60A5FA)
- Quiz: Purple (#A78BFA)
- Reviewer: Emerald (#10B981)
- Default: Slate (#94A3B8)

### 3. **Interactive Behavior**
- Entire card is clickable
- Smooth hover elevation (shadow-md)
- Keyboard accessible (Enter/Space to activate)
- Full-width layout for emphasis
- Subtle cursor changes

### 4. **Metadata Display**
Uses icons and text for secondary information:
- Due dates with relative time (Calendar icon)
- Point values (Clipboard icon)
- Question counts (Clock icon)
- Status badges (inline)

### 5. **Status Indicators**
Color-coded badges for quick scanning:
- **Submitted**: Green with checkmark
- **Pending**: Blue with neutral tone
- **Overdue**: Red with alert
- **Completed**: Green with checkmark
- **In Progress**: Purple with progress

## Integration Guide

### Step 1: Update Stream Container

The new `CourseStreamPanel` in `CourseWorkspacePanels.jsx` automatically uses the new activity cards. No changes needed to existing code.

### Step 2: Add Active Learning Dashboard

To add the active learning sidebar to your course detail page:

```jsx
import { ActiveLearningDashboard } from '@/components/stream'
import { useNavigate } from 'react-router-dom'

function CourseDetailPage() {
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [assignments, setAssignments] = useState([])
  const [quizzes, setQuizzes] = useState([])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main stream */}
      <div className="lg:col-span-2">
        <CourseStreamPanel {...props} />
      </div>

      {/* Active learning sidebar */}
      <aside className="lg:col-span-1">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Active Learning</h3>
            <ActiveLearningDashboard
              modules={modules}
              assignments={assignments}
              quizzes={quizzes}
              userSubmissions={userSubmissions}
              userAttempts={userAttempts}
              onNavigateModule={(m) => navigate(`/modules/${m.id}`)}
              onNavigateAssignment={(a) => navigate(`/assignments/${a.id}`)}
              onNavigateQuiz={(q) => navigate(`/quizzes/${q.id}`)}
            />
          </div>
        </div>
      </aside>
    </div>
  )
}
```

### Step 3: Make Cards Fully Clickable

Each activity card is already fully clickable. To handle clicks:

```jsx
<AnnouncementActivityCard
  announcement={data}
  onClick={() => navigate(`/announcements/${data.id}`)}
  onEdit={() => showEditModal()}
  onDelete={() => showDeleteConfirm()}
/>
```

### Step 4: Add Teacher Names to Cards

The cards support teacher names and avatars. Pass these as props:

```jsx
const teacherName = course.teacher_name || 'Teacher'
const teacherAvatar = course.teacher_avatar || null

<AssignmentActivityCard
  assignment={assignment}
  teacherName={teacherName}
  teacherAvatar={teacherAvatar}
/>
```

## Styling Details

### TailwindCSS Utilities Used
- Rounded corners: `rounded-2xl`, `rounded-xl`, `rounded-lg`
- Borders: `border`, `border-l`, border colors by variant
- Shadows: `shadow-sm`, `shadow-md` on hover
- Spacing: `px-6`, `py-4`, `gap-3`
- Colors: Slate for neutral, with accent colors for variants
- Typography: `text-sm`, `font-semibold`, `line-clamp`

### Color Palette
```
Announcements:  bg-amber-50    border-amber-100    bg-amber-400   (left border)
Assignments:    bg-blue-50     border-blue-100     bg-blue-400    (left border)
Quizzes:        bg-purple-50   border-purple-100   bg-purple-400  (left border)
Reviewers:      bg-emerald-50  border-emerald-100  bg-emerald-400 (left border)
Status Badges:  Green/Red/Amber as appropriate
```

### Responsive Design
- Full-width cards on mobile
- Consistent layout on all screen sizes
- Touch-friendly tap targets (min 44px)
- Readable text sizing

## Animation Details

- **Card Entry**: Fade in + slide up (0.3s)
- **Hover**: Scale to 1.02, shadow elevation
- **Tap**: Scale to 0.98
- **Status Updates**: Progress bar animations
- **Menu Open**: Scale + fade (0.2s)

## Keyboard Navigation

- **Tab**: Navigate between cards and buttons
- **Enter/Space**: Activate card action
- **Escape**: Close menus
- Fully accessible to screen readers

## API Integration

### Expected Data Structures

**Announcement:**
```js
{
  id: string,
  title: string,
  body: string,
  created_at: string (ISO),
  is_pinned: boolean,
  created_by: {
    name: string,
    avatar?: string
  }
}
```

**Assignment:**
```js
{
  id: string,
  title: string,
  instructions: string,
  due_at: string (ISO),
  points: number,
  created_at: string (ISO),
  created_by: {
    name: string,
    avatar?: string
  }
}
```

**Quiz:**
```js
{
  id: string,
  title: string,
  description: string,
  question_count: number,
  due_at: string (ISO),
  attempts_allowed: number,
  created_at: string (ISO),
  created_by: {
    name: string,
    avatar?: string
  }
}
```

**User Submission:**
```js
{
  id: string,
  assignment_id: string,
  user_id: string,
  submitted_at?: string (ISO),
  score?: number
}
```

**User Attempt:**
```js
{
  id: string,
  quiz_id: string,
  user_id: string,
  completed_at?: string (ISO),
  score?: number,
  attempt_number: number
}
```

## Migration from Old Cards

The old `StreamCard`, `AnnouncementCard`, `AssignmentCard`, `QuizCard`, and `ModuleCard` are still available for backward compatibility. To migrate:

**Before:**
```jsx
import { AnnouncementCard } from '@/components/stream'
<AnnouncementCard announcement={data} />
```

**After:**
```jsx
import { AnnouncementActivityCard } from '@/components/stream'
<AnnouncementActivityCard 
  announcement={data}
  teacherName={data.created_by.name}
  teacherAvatar={data.created_by.avatar}
/>
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-first responsive
- Touch-friendly interactions
- Smooth animations (60fps target)

## Performance Considerations

- Cards use React memoization for heavy content
- Framer Motion animations are GPU-accelerated
- Lazy-loaded content where applicable
- Minimal re-renders with proper dependency management

## Accessibility Checklist

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Screen reader friendly (semantic HTML, aria labels)
- ✅ Color contrast meets WCAG AA standards
- ✅ Focus indicators visible
- ✅ Touch targets min 44px
- ✅ Alternative text for icons
- ✅ Status updates announced

## Future Enhancements

- Drag-and-drop card ordering
- Filtering/search within stream
- Activity card templates customization
- Real-time update indicators
- Inline commenting on cards
- Card pinning/archiving
- Advanced filtering options
- Dark mode support

## Troubleshooting

### Cards not appearing
- Check that data is being passed correctly
- Verify imports from `@/components/stream`
- Check browser console for errors

### Clicks not working
- Ensure `onClick` handler is provided
- Check that card is not inside a disabled state
- Verify event propagation isn't stopped elsewhere

### Styling looks off
- Ensure TailwindCSS is properly configured
- Check for CSS conflicts with other components
- Verify dark mode isn't interfering

### Performance issues
- Reduce number of cards rendered at once
- Use virtualization for long lists
- Check for unnecessary re-renders

## Support & Questions

For questions or issues with the new stream design, refer to the component documentation or contact the development team.
