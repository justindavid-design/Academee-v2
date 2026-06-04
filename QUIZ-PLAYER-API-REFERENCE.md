# 📘 Student Quiz Player - API Reference

## Component Library

All components are in `src/components/student-quiz/` and exported from `index.js`.

---

## QuizPlayer

**Main fullscreen quiz orchestrator component.**

### Props

```typescript
interface QuizPlayerProps {
  quiz: QuizObject
  onSubmit?: (result: SubmissionResult) => void
  onExit?: () => void
  initialAnswers?: Record<number, number | number[]>
}
```

### Props Detail

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| quiz | QuizObject | Yes | Quiz data with questions, meta, etc |
| onSubmit | Function | No | Callback after submission with result |
| onExit | Function | No | Callback when student exits quiz |
| initialAnswers | Object | No | Pre-filled answers for resume |

### Example

```jsx
<QuizPlayer
  quiz={{
    id: "1",
    title: "Chapter 5",
    meta: { questions: [...], duration: 30 }
  }}
  onSubmit={(result) => console.log('Score:', result.score)}
  onExit={() => navigate('/courses')}
/>
```

### Emitted Events

```javascript
// On submission
onSubmit({
  answers: [{questionId, text, options, correct, chosen, isCorrect}, ...],
  score: 9,
  total: 10,
  percentage: 90,
  timestamp: "2026-05-21T..."
})

// On exit
onExit()
```

---

## QuizHeader

**Sticky header with quiz title, timer, and progress.**

### Props

```typescript
interface QuizHeaderProps {
  quizTitle?: string
  currentQuestion?: number
  totalQuestions?: number
  answered?: number
  duration?: number  // minutes
  isActive?: boolean
  onTimeUp?: () => void
  onExit?: () => void
  showProgress?: boolean
}
```

### Example

```jsx
<QuizHeader
  quizTitle="Chapter 5 Assessment"
  currentQuestion={2}
  totalQuestions={10}
  answered={5}
  duration={30}
  isActive={true}
  onTimeUp={() => handleSubmit()}
  onExit={() => handleExit()}
  showProgress={true}
/>
```

### Display Format

```
[← Exit] Quiz Title          [Timer]
[=====•------] Progress bar
Question 3 of 10  |  5 answered
```

---

## QuestionCard

**Displays quiz question with optional media.**

### Props

```typescript
interface QuestionCardProps {
  questionNumber?: number
  totalQuestions?: number
  text?: string
  imageUrl?: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'audio'
  hint?: string
  showHint?: boolean
  children?: ReactNode
}
```

### Example

```jsx
<QuestionCard
  questionNumber={3}
  totalQuestions={10}
  text="What is the capital of France?"
  imageUrl="https://..."
  mediaType="image"
  hint="Think about Western Europe"
  showHint={false}
>
  {/* Answer options go here */}
  <AnswerOption text="Paris" />
</QuestionCard>
```

### Media Types Supported

```
mediaType="image"       → <img> tag
mediaType="video"       → <video> with controls
mediaType="audio"       → <audio> with controls
null                    → No media displayed
```

---

## AnswerOption

**Individual answer choice card.**

### Props

```typescript
interface AnswerOptionProps {
  text?: string
  index?: number
  isSelected?: boolean
  isCorrect?: null | boolean
  isDisabled?: boolean
  isShowing?: boolean
  onSelect?: (index: number) => void
  type?: 'single' | 'multiple' | 'true-false'
  showFeedback?: boolean
}
```

### Example

```jsx
<AnswerOption
  text="Paris"
  index={1}
  isSelected={selectedIndex === 1}
  isCorrect={null}  // null before submit, true/false after
  onSelect={(index) => setSelected(index)}
  showFeedback={false}
/>
```

### Visual States

```
// Before selection
border-slate-200 bg-white
  ☐ Answer text

// Selected (before submit)
border-blue-400 bg-blue-50
  ✓ Answer text

// Correct (after submit)
border-green-300 bg-green-50
  ✓ Answer text

// Incorrect (after submit)
border-red-300 bg-red-50
  ✗ Answer text

// Showing correct answer (after submit)
border-green-300 bg-green-50
  ✓ Answer text
```

### Accessibility

```
Role: option
Aria-selected: true/false
Aria-label: "Answer A: Option text"
Keyboard: Enter/Space to select
```

---

## QuizNavigator

**Sidebar question navigator with status indicators.**

### Props

```typescript
interface QuizNavigatorProps {
  totalQuestions?: number
  currentQuestion?: number
  answeredQuestions?: number[]
  flaggedQuestions?: number[]
  onSelectQuestion?: (index: number) => void
  isOpen?: boolean
  onToggle?: () => void
}
```

### Example

```jsx
<QuizNavigator
  totalQuestions={10}
  currentQuestion={2}
  answeredQuestions={[0, 1, 2, 5]}
  flaggedQuestions={[3]}
  onSelectQuestion={(index) => goToQuestion(index)}
  isOpen={navigatorOpen}
  onToggle={() => setNavigatorOpen(!navigatorOpen)}
/>
```

### Question Status

```
Blue background:    Current question
Green background:   Answered question
Gray background:    Unanswered question
Orange ring:        Flagged question
```

### Display States

**Open (w-64):**
```
Questions  ✕
3 of 10 answered

[1] [2] [3] [4] [5]
[6] [7] [8] [9] [10]

Legend shown
```

**Closed (w-16):**
```
✕

[1] [2] [3]
[4] [5] [6]
...

Status dot indicators
```

---

## QuizTimer

**Countdown timer with warning state.**

### Props

```typescript
interface QuizTimerProps {
  duration?: number  // minutes
  isActive?: boolean
  onTimeUp?: () => void
}
```

### Example

```jsx
<QuizTimer
  duration={30}
  isActive={!submitted}
  onTimeUp={() => autoSubmit()}
/>
```

### Display Format

```
Normal (> 5 min):   ⏱ MM:SS    (gray)
Warning (≤ 5 min):  ⚠ MM:SS    (red)
Expired (0:00):     ⏱ 00:00    (then call onTimeUp)
```

### Color States

```
Normal:   bg-slate-100 text-slate-700
Warning:  bg-red-50 text-red-700 border-red-200
```

---

## QuizProgressBar

**Visual progress indicator showing completion.**

### Props

```typescript
interface QuizProgressBarProps {
  currentQuestion?: number
  totalQuestions?: number
  answered?: number
}
```

### Example

```jsx
<QuizProgressBar
  currentQuestion={3}
  totalQuestions={10}
  answered={7}
/>
```

### Display Components

1. **Text** - "Question 4 of 10" and "7 answered"
2. **Main bar** - Shows progress (0-100%)
3. **Answered overlay** - Green tint showing answered %
4. **Mini grid** - Max 20 question indicators

### Color Coding

```
Blue:   Current position (filled)
Green:  Answered questions (overlaid)
Gray:   Unanswered questions (background)
```

---

## QuizSubmitModal

**Confirmation dialog before submitting quiz.**

### Props

```typescript
interface QuizSubmitModalProps {
  isOpen?: boolean
  totalQuestions?: number
  answeredQuestions?: number
  onConfirm?: () => void
  onCancel?: () => void
  isSubmitting?: boolean
}
```

### Example

```jsx
<QuizSubmitModal
  isOpen={showConfirm}
  totalQuestions={10}
  answeredQuestions={8}
  isSubmitting={false}
  onConfirm={() => handleSubmit()}
  onCancel={() => setShowConfirm(false)}
/>
```

### Display States

**With unanswered questions:**
```
⚠ Unanswered Questions
You have 2 questions that are not answered.

Total: 10
Answered: 8 ✓
Unanswered: 2

[Keep Reviewing] [Submit Quiz]
```

**All answered:**
```
📤 Ready to Submit?
All 10 questions answered.

[Continue] [Submit Quiz]
```

---

## QuizResults

**Results display with score and answer review.**

### Props

```typescript
interface QuizResultsProps {
  score?: number
  totalQuestions?: number
  passThreshold?: number  // 0.7 = 70%
  answers?: AnswerReview[]
  showExplanations?: boolean
  onReview?: () => void
  onRetry?: () => void
}
```

### Example

```jsx
<QuizResults
  score={9}
  totalQuestions={10}
  passThreshold={0.7}
  answers={submittedAnswers}
  showExplanations={true}
  onReview={() => reviewAnswers()}
  onRetry={() => retakeQuiz()}
/>
```

### Display Sections

1. **Score Card** - Large percentage, grade, pass/fail
2. **Breakdown** - Correct/Incorrect/Accuracy stats
3. **Answer Review** - Question-by-question feedback
4. **Action Buttons** - Review/Retry options

### Grading Scale

```
90-100% → A → Green    → Excellent work
80-89%  → B → Blue     → Good work
70-79%  → C → Yellow   → Satisfactory
60-69%  → D → Orange   → Needs improvement
0-59%   → F → Red      → Review material
```

---

## QuizPlayer (Advanced Props)

### Usage with Resume

```jsx
// Load autosaved answers
const saved = localStorage.getItem(`quiz_attempt_${quizId}`)
const initialAnswers = saved ? JSON.parse(saved).answers : {}

<QuizPlayer
  quiz={quiz}
  initialAnswers={initialAnswers}
  onSubmit={handleSubmit}
  onExit={handleExit}
/>
```

### Full Event Lifecycle

```javascript
// 1. Player loads
<QuizPlayer quiz={quiz} />

// 2. Student answers questions
// Auto-saves to localStorage every change

// 3. Student navigates
onSelectQuestion(index)

// 4. Student clicks Submit
// Shows confirmation modal with warning

// 5. Student confirms
handleSubmitConfirm()

// 6. Score calculated
const score = /* calculation */

// 7. onSubmit called
onSubmit({
  answers: [...],
  score,
  total,
  percentage
})

// 8. Results shown
// Auto-redirect after 2 seconds
```

---

## Type Definitions

### QuizObject

```typescript
interface QuizObject {
  id: string
  title: string
  description?: string
  meta: {
    questions: Question[]
    duration: number  // minutes
    passThreshold: number  // 0-1
    allowReview?: boolean
    showAnswers?: boolean
    immediateGrading?: boolean
  }
  created_at?: string
  due_at?: string
}

interface Question {
  id?: string
  text: string
  options: string[]
  correct: number  // Index of correct option
  imageUrl?: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'audio'
  hint?: string
}
```

### SubmissionResult

```typescript
interface SubmissionResult {
  answers: AnswerReview[]
  score: number
  total: number
  percentage: number
  timestamp: string
}

interface AnswerReview {
  questionId: string
  text: string
  options: string[]
  correct: number
  chosen: number
  isCorrect: boolean
}
```

---

## Hooks Used

### Inside QuizPlayer

```javascript
useState()        // Manage quiz state
useCallback()     // Memoize event handlers
useMemo()         // Calculate statistics
useEffect()       // Handle autosave, timer
useNavigate()     // From react-router-dom
useParams()       // From react-router-dom
useAuth()         // From AuthProvider
```

---

## Styling System

### TailwindCSS Classes Used

```
Spacing:    px-6 py-4 gap-3 space-y-4 p-8 rounded-2xl
Colors:     bg-blue-50 text-slate-900 border-slate-200
States:     hover: focus: disabled: opacity-50
Sizing:     w-64 h-5 max-w-3xl aspect-video
Layout:     flex items-center justify-between grid-cols-4
```

### CSS-in-JS (Motion)

```javascript
import { motion, AnimatePresence } from 'framer-motion'

// Entrance animations
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}

// Staggered children
variants with staggerChildren: 0.05
```

---

## Performance Considerations

### Optimizations

- **Memoization**: useMemo for statistics
- **Lazy rendering**: AnimatePresence for questions
- **Minimal re-renders**: useCallback for handlers
- **GPU acceleration**: Framer Motion animations

### Bundle Size

- QuizPlayer: ~8KB gzipped
- All components: ~15KB gzipped
- Dependencies: Framer Motion, lucide-react, date-fns

---

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full support |
| Firefox | 88+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Edge | 90+ | ✅ Full support |
| iOS Safari | 14+ | ✅ Full support |
| Chrome Mobile | 90+ | ✅ Full support |

---

## Export Statement

```javascript
// In src/components/student-quiz/index.js
export { QuizPlayer }
export { QuizHeader }
export { QuestionCard }
export { AnswerOption }
export { QuizNavigator }
export { QuizTimer }
export { QuizProgressBar }
export { QuizSubmitModal }
export { QuizResults }
```

---

## Common Implementation Patterns

### Pattern 1: Basic Quiz

```jsx
const [quiz, setQuiz] = useState(null)

useEffect(() => {
  apiFetch(`/api/quizzes/${quizId}`).then(setQuiz)
}, [quizId])

return <QuizPlayer quiz={quiz} onSubmit={submit} onExit={exit} />
```

### Pattern 2: With Loading

```jsx
if (loading) return <Spinner />
if (error) return <ErrorScreen />
if (!quiz) return <div>Not found</div>

return <QuizPlayer {...props} />
```

### Pattern 3: With Navigation

```jsx
const navigate = useNavigate()

return (
  <QuizPlayer
    quiz={quiz}
    onSubmit={(result) => {
      saveResult(result)
      navigate(`/courses/${courseId}/results`)
    }}
    onExit={() => navigate('/courses')}
  />
)
```

---

## Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| Timer stuck | isActive false | Ensure isActive={!submitted} |
| Answers not save | localStorage full | Clear old quizzes |
| No animation | motion not imported | Import from 'framer-motion' |
| Mobile broken | viewport issues | Check meta viewport tag |
| Screen reader silent | Missing ARIA | Check role, aria-label |

---

**Last Updated:** May 21, 2026
**Version:** 1.0
**Status:** ✅ Complete
