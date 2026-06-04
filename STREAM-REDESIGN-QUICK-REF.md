# 🎓 Stream Redesign - Quick Reference

## New Components

### Activity Cards
Perfect drop-in replacements for old stream cards with classroom-inspired design.

```jsx
import {
  AnnouncementActivityCard,
  AssignmentActivityCard,
  QuizActivityCard,
  ModuleActivityCard,
} from '@/components/stream'

// Announcement
<AnnouncementActivityCard
  announcement={data}
  isTeacher={isTeacher}
  teacherName="John Doe"
  teacherAvatar={null}
  onClick={() => {}}
  onEdit={() => {}}
  onDelete={() => {}}
/>

// Assignment
<AssignmentActivityCard
  assignment={data}
  isTeacher={isTeacher}
  userSubmission={null}
  teacherName="John Doe"
  onSubmit={() => {}}
  onEdit={() => {}}
  onDelete={() => {}}
  onViewSubmissions={() => {}}
/>

// Quiz
<QuizActivityCard
  quiz={data}
  isTeacher={isTeacher}
  userAttempt={null}
  teacherName="John Doe"
  onStart={() => {}}
  onEdit={() => {}}
  onDelete={() => {}}
/>
```

### Base Components
Build custom cards with these foundational pieces:

```jsx
import {
  ClassroomActivityCard,
  CardHeader,
  CardContent,
  CardMetadata,
  CardAction,
  ActionButton,
  StatusBadge,
} from '@/components/stream'

<ClassroomActivityCard variant="assignment">
  <CardHeader teacherName="John" actionLabel="Posted" timestamp="2h ago" />
  <CardContent title="Title" description="Description" />
  <CardMetadata items={[{ icon: Calendar, label: 'Due tomorrow' }]} />
  <CardAction>
    <ActionButton label="Open" variant="primary" onClick={() => {}} />
  </CardAction>
</ClassroomActivityCard>
```

### Active Learning Dashboard
Quick status overview for students:

```jsx
import { ActiveLearningDashboard } from '@/components/stream'

<ActiveLearningDashboard
  modules={modules}
  assignments={assignments}
  quizzes={quizzes}
  userSubmissions={userSubmissions}
  userAttempts={userAttempts}
  onNavigateModule={(m) => {}}
  onNavigateAssignment={(a) => {}}
  onNavigateQuiz={(q) => {}}
/>
```

## Variants

### Card Variants
```
'default'      - Slate theme
'announcement' - Amber theme
'assignment'   - Blue theme
'quiz'         - Purple theme
'reviewer'     - Emerald theme
```

### Status Variants
```
'pending'      - Blue background
'due-soon'     - Amber background
'completed'    - Green background
'in-progress'  - Purple background
'default'      - Slate background
```

### Button Variants
```
'primary'   - Blue filled button
'secondary' - Border button
'danger'    - Red border button
```

## Updated Panels

### CourseStreamPanel
Now uses new activity cards automatically. Located in `CourseWorkspacePanels.jsx`.

```jsx
<CourseStreamPanel
  announcements={announcements}
  assignments={assignments}
  quizzes={quizzes}
  isTeacher={isTeacher}
  onAddAnnouncement={() => {}}
/>
```

## Design Highlights

✅ **Classroom-Inspired**: Google Classroom-style activity feed
✅ **Interactive**: Fully clickable cards with hover states
✅ **Clean**: Minimalist design with subtle accents
✅ **Accessible**: Keyboard navigation, screen reader friendly
✅ **Responsive**: Mobile-first design
✅ **Fast**: Smooth animations (GPU accelerated)
✅ **Educational**: Professional LMS appearance
✅ **Flexible**: Reusable components, easy to customize

## Key Styling

- **Rounded corners**: `rounded-2xl` for cards, `rounded-xl` for elements
- **Borders**: Subtle `border-slate-200` with colored left accent (4px)
- **Shadows**: `shadow-sm` normal, `shadow-md` on hover
- **Spacing**: Consistent `px-6 py-4` padding
- **Typography**: `text-sm` body, `text-lg font-bold` titles
- **Colors**: Slate neutral, accent colors by type

## Example: Complete Stream

```jsx
function CourseStream() {
  const [announcements, setAnnouncements] = useState([])
  const [assignments, setAssignments] = useState([])
  const [quizzes, setQuizzes] = useState([])
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main stream */}
      <div className="lg:col-span-2">
        <CourseStreamPanel
          announcements={announcements}
          assignments={assignments}
          quizzes={quizzes}
          isTeacher={false}
          onAddAnnouncement={() => {}}
        />
      </div>
      
      {/* Active learning sidebar */}
      <aside>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-bold mb-4">Active Learning</h3>
          <ActiveLearningDashboard
            modules={modules}
            assignments={assignments}
            quizzes={quizzes}
            userSubmissions={userSubmissions}
            userAttempts={userAttempts}
            onNavigateAssignment={(a) => navigate(`/assignments/${a.id}`)}
          />
        </div>
      </aside>
    </div>
  )
}
```

## Migration Path

1. **Old way** → **New way**:
   - `StreamCard` → `ClassroomActivityCard`
   - `AnnouncementCard` → `AnnouncementActivityCard`
   - `AssignmentCard` → `AssignmentActivityCard`
   - `QuizCard` → `QuizActivityCard`
   - `ModuleCard` → `ModuleActivityCard`

2. **Add teacher info** to all cards:
   ```jsx
   teacherName={course.teacher_name}
   teacherAvatar={course.teacher_avatar}
   ```

3. **Make cards clickable**:
   ```jsx
   onClick={() => navigate(`/item/${data.id}`)}
   ```

## Color Reference

```
Announcement:  Amber   #FBBF24
Assignment:    Blue    #60A5FA
Quiz:          Purple  #A78BFA
Reviewer:      Emerald #10B981
Status Good:   Green   #22C55E
Status Warn:   Amber   #F59E0B
Status Bad:    Red     #EF4444
```

## Exported Symbols

```jsx
// From @/components/stream

// Base components
export ClassroomActivityCard
export CardHeader
export CardContent
export CardMetadata
export CardAction
export ActionButton
export StatusBadge

// Activity cards
export AnnouncementActivityCard
export AssignmentActivityCard
export QuizActivityCard
export ModuleActivityCard
export ReviewerActivityCard
export ReminderActivityCard

// Active learning
export ActiveLearningCard
export ContinueLearningCard
export PendingAssignmentCard
export UpcomingQuizCard
export ActiveLearningDashboard

// Legacy (still available)
export StreamCard
export AnnouncementCard
export AssignmentCard
export QuizCard
export ModuleCard
export StreamContainer
export StreamHeader
export QuickActionBar
```

## Tips & Tricks

💡 **Tip 1**: Use `variant` prop to color-code different card types
💡 **Tip 2**: Pass `onClick` to make entire card clickable
💡 **Tip 3**: Use `StatusBadge` for quick status at a glance
💡 **Tip 4**: Teacher avatars improve visual recognition
💡 **Tip 5**: Metadata icons help with quick scanning

## Need Help?

- See `STREAM-REDESIGN-GUIDE.md` for detailed documentation
- Check component prop types in JSDoc comments
- Review example usage in `CourseWorkspacePanels.jsx`
- Test with `StorybookBook` for isolated development
