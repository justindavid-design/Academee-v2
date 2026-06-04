# Stream Redesign - Component API Reference

## Base Components

### ClassroomActivityCard

**Props:**
```typescript
interface ClassroomActivityCardProps {
  children: React.ReactNode              // Card content
  onClick?: () => void                   // Click handler
  onHover?: () => void                   // Hover handler
  className?: string                     // Additional CSS classes
  isClickable?: boolean                  // Default: true
  variant?: 'default' | 'announcement'   // Card variant for styling
         | 'assignment' | 'quiz' 
         | 'reviewer'
}
```

**Example:**
```jsx
<ClassroomActivityCard
  variant="assignment"
  onClick={() => navigate('/assignment/123')}
  isClickable={true}
>
  {/* Card content */}
</ClassroomActivityCard>
```

### CardHeader

**Props:**
```typescript
interface CardHeaderProps {
  teacherName?: string                   // Teacher/Author name
  teacherAvatar?: string                 // Avatar image URL
  actionLabel: string                    // e.g., "Posted an assignment"
  timestamp?: string                     // e.g., "2 hours ago"
  isPinned?: boolean                     // Show pinned badge
  onMenu?: () => void                    // Menu button click
  menuItems?: Array<{                    // Menu options
    label: string
    icon?: React.ComponentType           // Lucide icon
    onClick?: () => void
    isDanger?: boolean                   // Red color for dangerous actions
  }>
}
```

### CardContent

**Props:**
```typescript
interface CardContentProps {
  title?: string                         // Content title
  description?: string                   // Brief description
  children?: React.ReactNode             // Additional content
  className?: string                     // Additional CSS classes
}
```

### CardMetadata

**Props:**
```typescript
interface CardMetadataProps {
  items?: Array<{
    icon?: React.ComponentType           // Lucide icon
    label: string                        // Metadata text
    bold?: boolean                       // Bold text
  }>
  className?: string                     // Additional CSS classes
}
```

### CardAction

**Props:**
```typescript
interface CardActionProps {
  children: React.ReactNode              // Action buttons
  className?: string                     // Additional CSS classes
}
```

### ActionButton

**Props:**
```typescript
interface ActionButtonProps {
  label: string                          // Button text
  onClick?: () => void                   // Click handler
  variant?: 'primary' | 'secondary'      // Button style
           | 'danger'
  className?: string                     // Additional CSS classes
  icon?: React.ComponentType             // Lucide icon
}
```

### StatusBadge

**Props:**
```typescript
interface StatusBadgeProps {
  label: string                          // Badge text
  type?: 'submitted' | 'pending'         // Badge variant
       | 'overdue' | 'completed' 
       | 'draft' | 'default'
}
```

## Activity Cards

### AnnouncementActivityCard

**Props:**
```typescript
interface AnnouncementActivityCardProps {
  announcement: {                        // Announcement data
    id: string
    title: string
    body: string
    created_at: string                   // ISO date
    is_pinned?: boolean
    likes_count?: number
    comment_count?: number
  }
  isTeacher: boolean                     // Show teacher controls
  onEdit?: (announcement) => void
  onDelete?: (announcement) => void
  onPin?: (announcement) => void
  onClick?: () => void
  teacherName?: string
  teacherAvatar?: string
}
```

### AssignmentActivityCard

**Props:**
```typescript
interface AssignmentActivityCardProps {
  assignment: {                          // Assignment data
    id: string
    title: string
    instructions: string
    due_at: string                       // ISO date
    points?: number
    created_at: string
  }
  isTeacher: boolean
  userSubmission?: {                     // User's submission
    id: string
    submitted_at?: string                // ISO date
    score?: number
  }
  onSubmit?: () => void
  onEdit?: (assignment) => void
  onDelete?: (assignment) => void
  onViewSubmissions?: (assignment) => void
  onClick?: () => void
  teacherName?: string
  teacherAvatar?: string
}
```

### QuizActivityCard

**Props:**
```typescript
interface QuizActivityCardProps {
  quiz: {                                // Quiz data
    id: string
    title: string
    description: string
    question_count?: number
    due_at?: string                      // ISO date
    attempts_allowed?: number
    created_at: string
  }
  isTeacher: boolean
  userAttempt?: {                        // User's quiz attempt
    id: string
    completed_at?: string                // ISO date
    score?: number
    attempt_number: number
  }
  onStart?: () => void
  onEdit?: (quiz) => void
  onDelete?: (quiz) => void
  onClick?: () => void
  teacherName?: string
  teacherAvatar?: string
}
```

### ModuleActivityCard

**Props:**
```typescript
interface ModuleActivityCardProps {
  module: {                              // Module data
    id: string
    title: string
    description: string
    created_at: string
  }
  isTeacher: boolean
  onOpen?: () => void
  onEdit?: (module) => void
  onDelete?: (module) => void
  onClick?: () => void
  teacherName?: string
  teacherAvatar?: string
}
```

### ReviewerActivityCard

**Props:**
```typescript
interface ReviewerActivityCardProps {
  reviewer: {                            // Reviewer data
    id: string
    title: string
    description: string
    created_at: string
  }
  isTeacher: boolean
  onOpen?: () => void
  onEdit?: (reviewer) => void
  onDelete?: (reviewer) => void
  onClick?: () => void
  teacherName?: string
  teacherAvatar?: string
}
```

## Active Learning Components

### ActiveLearningCard

**Props:**
```typescript
interface ActiveLearningCardProps {
  title: string                          // Card title
  subtitle?: string                      // Subtitle text
  icon: React.ComponentType              // Lucide icon
  status?: string                        // Status text
  metadata?: string                      // Metadata text
  onClick?: () => void
  variant?: 'pending' | 'due-soon'       // Card variant
           | 'completed' | 'in-progress'
           | 'default'
  progress?: number                      // 0-100 for progress bar
}
```

### ContinueLearningCard

**Props:**
```typescript
interface ContinueLearningCardProps {
  module: {
    id: string
    title: string
    progress?: number                    // 0-100
  }
  onClick?: () => void
}
```

### PendingAssignmentCard

**Props:**
```typescript
interface PendingAssignmentCardProps {
  assignment: {
    id: string
    title: string
    due_at: string                       // ISO date
    points?: number
  }
  userSubmission?: {
    submitted_at?: string                // ISO date
  }
  onClick?: () => void
}
```

### UpcomingQuizCard

**Props:**
```typescript
interface UpcomingQuizCardProps {
  quiz: {
    id: string
    title: string
    question_count?: number
    due_at?: string                      // ISO date
    attempts_allowed?: number
  }
  userAttempt?: {
    completed_at?: string                // ISO date
    score?: number
    attempt_number: number
  }
  onClick?: () => void
}
```

### ActiveLearningDashboard

**Props:**
```typescript
interface ActiveLearningDashboardProps {
  modules?: Array<{
    id: string
    title: string
    progress?: number
  }>
  assignments?: Array<{
    id: string
    title: string
    due_at: string
    points?: number
  }>
  quizzes?: Array<{
    id: string
    title: string
    question_count?: number
    due_at?: string
    attempts_allowed?: number
  }>
  userSubmissions?: Record<string, {
    submitted_at?: string
  }>
  userAttempts?: Record<string, {
    completed_at?: string
    score?: number
    attempt_number: number
  }>
  onNavigateModule?: (module) => void
  onNavigateAssignment?: (assignment) => void
  onNavigateQuiz?: (quiz) => void
}
```

## CourseStreamPanel

**Props:**
```typescript
interface CourseStreamPanelProps {
  announcements?: Array<{
    id: string
    title: string
    body: string
    created_at: string
    is_pinned?: boolean
  }>
  assignments?: Array<{
    id: string
    title: string
    instructions: string
    due_at: string
    points?: number
    created_at: string
  }>
  quizzes?: Array<{
    id: string
    title: string
    description: string
    question_count?: number
    due_at?: string
    attempts_allowed?: number
    created_at: string
  }>
  isTeacher: boolean
  onAddAnnouncement?: () => void
}
```

## Return Types

### Click Handlers
```typescript
type ClickHandler = () => void | Promise<void>
```

### Navigation Handler
```typescript
type NavigationHandler = (item: any) => void
```

### Edit Handler
```typescript
type EditHandler = (item: any) => void | Promise<void>
```

### Delete Handler
```typescript
type DeleteHandler = (item: any) => void | Promise<void>
```

## Variant Types

### ClassroomActivityCard Variants
```typescript
type CardVariant = 
  | 'default'
  | 'announcement'
  | 'assignment'
  | 'quiz'
  | 'reviewer'
```

### ActionButton Variants
```typescript
type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'danger'
```

### StatusBadge Types
```typescript
type StatusType = 
  | 'submitted'
  | 'pending'
  | 'overdue'
  | 'completed'
  | 'draft'
  | 'default'
```

### ActiveLearningCard Variants
```typescript
type ActiveVariant = 
  | 'pending'
  | 'due-soon'
  | 'completed'
  | 'in-progress'
  | 'default'
```

## Icons Used

All icons from lucide-react:
```jsx
import {
  Calendar,         // Due dates
  Clock,            // Time
  AlertCircle,      // Alerts
  CheckCircle,      // Completed/Submitted
  Edit2,            // Edit action
  Trash2,           // Delete action
  Megaphone,        // Announcements
  Clipboard,        // Assignments/Points
  PenTool,          // Quizzes
  BookOpen,         // Modules
  Users,            // Reviewers/Collaborators
  ArrowRight,       // Navigation
  MoreVertical,     // Menu
} from 'lucide-react'
```

## Usage Examples

### Basic Activity Card
```jsx
import { AnnouncementActivityCard } from '@/components/stream'

<AnnouncementActivityCard
  announcement={{
    id: '1',
    title: 'Class Update',
    body: 'Updated syllabus...',
    created_at: '2024-05-20T10:00:00Z',
  }}
  isTeacher={false}
  teacherName="John Doe"
  onClick={() => navigate('/announcements/1')}
/>
```

### With All Features
```jsx
<AssignmentActivityCard
  assignment={{
    id: '1',
    title: 'Essay Assignment',
    instructions: 'Write a 1000-word essay...',
    due_at: '2024-05-25T23:59:59Z',
    points: 50,
    created_at: '2024-05-20T10:00:00Z',
  }}
  isTeacher={false}
  userSubmission={{
    id: 'sub1',
    submitted_at: '2024-05-23T14:30:00Z',
  }}
  teacherName="John Doe"
  teacherAvatar="https://..."
  onClick={() => navigate('/assignments/1')}
  onSubmit={() => navigate('/assignments/1/submit')}
  onEdit={() => {}}
  onDelete={() => {}}
  onViewSubmissions={() => {}}
/>
```

### Active Learning Dashboard
```jsx
import { ActiveLearningDashboard } from '@/components/stream'

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
```

## Default Values

```typescript
const defaults = {
  // ClassroomActivityCard
  isClickable: true,
  variant: 'default',
  
  // ActionButton
  variant: 'primary',
  
  // StatusBadge
  type: 'default',
  
  // ActiveLearningCard
  variant: 'default',
  progress: undefined,
  
  // CardHeader
  isPinned: false,
}
```

## Accessibility Props

All components include:
- `role` attributes (button for cards)
- `tabIndex` for keyboard navigation
- `aria-label` for screen readers
- Semantic HTML
- WCAG AA color contrast
- Focus indicators
- Keyboard event handlers

## TypeScript Support

All components have proper TypeScript types via JSDoc:

```jsx
/**
 * AnnouncementActivityCard - Display classroom announcements
 * @param {AnnouncementActivityCardProps} props
 * @returns {React.ReactElement}
 */
export function AnnouncementActivityCard(props) { }
```

## Animation Props

Cards support Framer Motion props via internal configuration:
- Entry: fadeIn + slideUp (0.3s)
- Hover: scale 1.02
- Tap: scale 0.98
- Exit: fadeOut + slideDown (0.2s)

## Error Handling

Components handle gracefully:
- Missing teacher name → Shows "Teacher"
- Missing avatar → Shows initials
- Missing description → Omits description block
- Invalid dates → Shows "Invalid date"
- Missing icons → Omits icon

## Performance Considerations

- Memoized for non-changed props
- Lazy animations
- Efficient event delegation
- Minimal re-renders
- GPU-accelerated transforms

---

This API reference provides complete documentation for all stream redesign components.
