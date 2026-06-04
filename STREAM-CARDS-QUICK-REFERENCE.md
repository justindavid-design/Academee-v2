# Modern Stream Cards - Quick Reference 🚀

## Component Quick Links

| Component | Type | File | Purpose |
|-----------|------|------|---------|
| **AnnouncementCard** | Export | [StreamCards.jsx#L47](src/components/stream/StreamCards.jsx#L47) | Course announcements with engagement |
| **AssignmentCard** | Export | [StreamCards.jsx#L224](src/components/stream/StreamCards.jsx#L224) | Assignments with submission tracking |
| **QuizCard** | Export | [StreamCards.jsx#L429](src/components/stream/StreamCards.jsx#L429) | Quizzes with attempt tracking |
| **ModuleCard** | Export | [StreamCards.jsx#L610](src/components/stream/StreamCards.jsx#L610) | Module overview cards |
| **StreamCard** | Base | [StreamCards.jsx#L26](src/components/stream/StreamCards.jsx#L26) | Wrapper with animations |

## Supporting Components

| Component | Type | File | Purpose |
|-----------|------|------|---------|
| **UserAvatar** | Common | [UserAvatar.jsx](src/components/common/UserAvatar.jsx) | Avatar display with fallback |
| **StreamDropdownMenu** | Common | [StreamDropdownMenu.jsx](src/components/common/StreamDropdownMenu.jsx) | Context menu |
| **ModernFileAttachmentList** | Common | [ModernFileAttachmentList.jsx](src/components/common/ModernFileAttachmentList.jsx) | File display |
| **ImagePreviewCard** | Common | [ImagePreviewCard.jsx](src/components/common/ImagePreviewCard.jsx) | Image preview |

---

## Card Types at a Glance

### AnnouncementCard ⭐

```javascript
<AnnouncementCard
  announcement={{ title, body, author_name, created_at, likes_count }}
  isTeacher={false}
  onEdit={(ann) => {}}
  onDelete={(ann) => {}}
  onPin={(ann) => {}}
/>
```

**Features**: User avatar, like counter, comment count, dropdown menu

---

### AssignmentCard 📋

```javascript
<AssignmentCard
  assignment={{ title, instructions, due_at, points, attachment_url }}
  isTeacher={false}
  userSubmission={{ submitted_at }}
  onEdit={(assignment) => {}}
  onDelete={(assignment) => {}}
  onSubmit={(assignment) => {}}
  onViewSubmissions={(assignment) => {}}
/>
```

**Features**: Due date, status badge, file attachments, action buttons

---

### QuizCard 📝

```javascript
<QuizCard
  quiz={{ title, description, due_at, question_count, attempts_allowed }}
  isTeacher={false}
  userAttempt={{ completed_at, attempt_number, score }}
  onStart={(quiz) => {}}
  onEdit={(quiz) => {}}
  onDelete={(quiz) => {}}
/>
```

**Features**: Attempt tracking, score display, completion badge, dynamic buttons

---

### ModuleCard 📚

```javascript
<ModuleCard
  module={{ title, description, created_at }}
  isTeacher={false}
  itemCount={5}
  onEdit={(module) => {}}
  onDelete={(module) => {}}
  onClick={() => {}}
/>
```

**Features**: Item count, clickable navigation, creation date, dropdown menu

---

## Styling Overview

### Color Scheme
- **Blue**: Assignments, primary actions
- **Purple**: Quizzes, secondary actions
- **Green**: Success, completion
- **Red**: Danger, overdue
- **Slate**: Neutral backgrounds

### Icon Reference
| Icon | Meaning | Color |
|------|---------|-------|
| 📋 Clipboard | Assignment | Blue |
| 📝 PenTool | Quiz | Purple |
| 📚 BookOpen | Module | Emerald |
| ❤️ Heart | Like | Red/Slate |
| 💬 MessageCircle | Comments | Slate |
| 🔗 Share | Share | Slate |
| ⏰ Clock | Time | Slate |
| 📅 Calendar | Date | Slate |
| ⚠️ AlertCircle | Warning | Red |

---

## Common Patterns

### Menu Items Creation

```javascript
const menuItems = [
  isTeacher && onEdit && createMenuItem({
    label: 'Edit',
    icon: 'edit',
    onClick: () => onEdit(item),
  }),
  isTeacher && onDelete && createMenuItem({
    label: 'Delete',
    icon: 'delete',
    onClick: () => onDelete(item),
    variant: 'danger',
    divider: true,
  }),
].filter(Boolean)
```

### File Attachment Parsing

```javascript
import { parseAttachments, parseContentWithAttachments } from '../../lib/fileUtils'

// Parse body content
const content = parseContentWithAttachments(announcement.body)
// { text: string, files: File[] }

// Parse attachment URLs
const files = parseAttachments(assignment.attachment_url)
// File[]
```

### Status Indicators

```javascript
{isSubmitted && <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">✓ Submitted</span>}
{isOverdue && <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" />Overdue</span>}
{isCompleted && <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">✓ Completed</span>}
```

---

## State Management

### Local State per Card

```javascript
const [showMenu, setShowMenu] = useState(false)
const [liked, setLiked] = useState(false)
const [likeCount, setLikeCount] = useState(0)
const menuRef = useRef(null)
```

### Click Outside Handler

```javascript
useEffect(() => {
  if (!showMenu) return
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowMenu(false)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [showMenu])
```

---

## Common Props Across Cards

| Prop | Type | Used By | Purpose |
|------|------|---------|---------|
| `isTeacher` | boolean | All | Show/hide edit/delete controls |
| `onEdit` | function | All | Handle edit action |
| `onDelete` | function | All | Handle delete action |
| `<Type>` | object | All | Main data object |

---

## Event Handling

### Button Interactions

```javascript
// Prevent menu from closing when clicking menu button
onClick={(e) => {
  e.stopPropagation()
  setShowMenu(!showMenu)
}}

// Handle optional callbacks
onSubmit?.(assignment)
onViewSubmissions?.(assignment)
```

### Framer Motion Events

```javascript
<motion.button
  whileHover={{ scale: 1.05 }}      // On hover
  whileTap={{ scale: 0.95 }}         // On click
  onClick={handleClick}
/>
```

---

## Responsive Breakpoints

The components use Tailwind's responsive utilities:

```javascript
// Mobile: default
// Tablet: md: (768px and above)
// Desktop: lg: (1024px and above)

className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16"
```

---

## Accessibility Checklist

- [x] Keyboard navigation support
- [x] Semantic HTML (buttons, divs with role)
- [x] ARIA labels on interactive elements
- [x] Color contrast meets WCAG AA
- [x] Focus indicators visible
- [x] Alt text for images
- [x] Escape key closes menus
- [x] Screen reader compatible

---

## Performance Tips

1. **Memoize**: Wrap in React.memo for lists
2. **Lazy Load**: Images with dynamic imports
3. **Debounce**: Click handlers with timeouts
4. **CSS**: Use Tailwind for minimal CSS
5. **Animations**: GPU-accelerated transforms

---

## Debugging

### Common Issues

**Menu not closing**
- Check `menuRef` is properly connected
- Verify click-outside handler is registered
- Check z-index conflicts

**Avatar not showing**
- Verify image URL is correct
- Check CORS headers if external image
- Fallback should show initials

**Attachments not parsing**
- Check file format in content string
- Verify `##file:` or `##attachments:` syntax
- Test with console.log

---

## Import Pattern

```javascript
import {
  AnnouncementCard,
  AssignmentCard,
  QuizCard,
  ModuleCard,
} from '../stream/StreamCards'
```

---

## Size Reference

| Property | Value | Pixels |
|----------|-------|--------|
| Icon | w-6 h-6 | 24px |
| Avatar | w-12 h-12 | 48px |
| Border radius | rounded-2xl | 16px |
| Padding | p-6 | 24px |
| Gap | gap-4 | 16px |

---

## Animation Values

```javascript
// Entry
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}

// Exit
exit={{ opacity: 0, y: -20 }}

// Duration
transition={{ duration: 0.3 }}

// Hover
whileHover={{ scale: 1.05, y: -2 }}

// Tap
whileTap={{ scale: 0.95 }}
```

---

## Testing Template

```javascript
describe('AnnouncementCard', () => {
  it('renders with title and content', () => {
    const announcement = { title: 'Test', body: 'Content', ... }
    render(<AnnouncementCard announcement={announcement} />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('calls onEdit when edit is clicked', async () => {
    const onEdit = jest.fn()
    const { getByText } = render(
      <AnnouncementCard announcement={...} onEdit={onEdit} isTeacher />
    )
    await userEvent.click(getByText('Edit'))
    expect(onEdit).toHaveBeenCalled()
  })
})
```

---

**Quick Note**: All components are production-ready with proper error handling, accessibility features, and responsive design. Refer to the full documentation for detailed information on each component.
