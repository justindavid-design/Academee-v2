# 🎯 Student Quiz Player - Quick Reference

## Fast Navigation

### ⚡ I Want To...

| Goal | Location |
|------|----------|
| Use quiz player | `@/components/student-quiz` |
| See component props | QUIZ-PLAYER-API-REFERENCE.md |
| Find examples | QUIZ-PLAYER-EXAMPLES.md |
| Understand UI | QUIZ-PLAYER-GUIDE.md |
| Check routes | `src/App.jsx` |
| Test locally | `npm run dev` → visit `/courses/123/quiz/456/take` |

---

## 🔧 Common Tasks

### Import Components

```jsx
// Import everything
import { QuizPlayer } from '@/components/student-quiz'

// Or specific components
import { 
  QuizHeader, 
  QuizNavigator, 
  AnswerOption 
} from '@/components/student-quiz'
```

### Create a Quiz Page

```jsx
import { QuizPlayer } from '@/components/student-quiz'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '@/lib/apiClient'

export default function StudentQuizPage() {
  const { courseId, quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)

  useEffect(() => {
    apiFetch(`/api/courses/${courseId}/quizzes/${quizId}`)
      .then(r => r.json())
      .then(setQuiz)
  }, [courseId, quizId])

  return (
    <QuizPlayer
      quiz={quiz}
      onSubmit={(result) => console.log('Score:', result.score)}
      onExit={() => navigate(`/courses/${courseId}`)}
    />
  )
}
```

### Navigate to Quiz Player

```jsx
// From quiz card
navigate(`/courses/${courseId}/quiz/${quizId}/take`)

// URL format
/courses/123/quiz/456/take
```

### Handle Autosave

Automatic! QuizPlayer handles autosave to localStorage:
```javascript
// Quiz data stored as:
localStorage.getItem('quiz_attempt_456')  // Returns autosaved answers
```

### Display Quiz Card on Stream

```jsx
import { QuizActivityCard } from '@/components/stream/ActivityCards'

<QuizActivityCard
  quiz={quizData}
  isTeacher={false}
  teacherName="Mr. Smith"
  onStart={() => navigate(`/courses/${courseId}/quiz/${quiz.id}/take`)}
  onClick={() => navigate(`/courses/${courseId}/quiz/${quiz.id}/take`)}
/>
```

---

## 📊 Quiz Data Format

### Minimal Quiz Object

```javascript
{
  id: "quiz-1",
  title: "Chapter 5 Quiz",
  meta: {
    questions: [
      {
        id: "q1",
        text: "Question text?",
        options: ["A", "B", "C", "D"],
        correct: 1  // Index of correct option
      }
    ],
    duration: 30,  // Minutes
    passThreshold: 0.7  // 70% to pass
  }
}
```

### Full Quiz Object

```javascript
{
  id: "quiz-1",
  title: "Assessment",
  description: "Test your knowledge",
  meta: {
    questions: [
      {
        id: "q1",
        text: "What is...",
        options: ["A", "B", "C", "D"],
        correct: 1,
        imageUrl: "https://...",
        mediaUrl: "https://...",
        mediaType: "image",  // "image", "video", "audio"
        hint: "Hint text"
      }
    ],
    duration: 30,
    passThreshold: 0.7,
    allowReview: true,
    showAnswers: true,
    immediateGrading: true
  },
  created_at: "2026-05-21T...",
  due_at: "2026-05-28T..."
}
```

---

## 🎨 Component Tree

```
QuizPlayer (Main)
├─ QuizHeader (Top bar)
│  ├─ QuizTimer (Countdown)
│  └─ QuizProgressBar (Progress)
├─ QuizNavigator (Sidebar)
├─ QuestionCard (Main content)
│  └─ AnswerOption[] (Answer buttons)
├─ Navigation buttons
└─ QuizSubmitModal (Confirmation)
└─ QuizResults (After submit)
```

---

## 🌐 Routes

### Student Quiz Routes

```javascript
// View quiz (in stream)
/courses/{courseId}/quiz/{quizId}/take

// Results (after submit)
/courses/{courseId}  // Redirects after 2s
```

### Teacher Quiz Routes

```javascript
// Create quiz
/dashboard/course/{courseId}/quiz/create

// Edit quiz
/dashboard/course/{courseId}/quiz/{quizId}/edit
```

---

## 💾 State Management

### QuizPlayer State

```javascript
const [currentQuestion, setCurrentQuestion] = useState(0)
const [answers, setAnswers] = useState({})
const [submitted, setSubmitted] = useState(false)
const [showSubmitModal, setShowSubmitModal] = useState(false)
const [navigatorOpen, setNavigatorOpen] = useState(true)
```

### Auto-saved to localStorage:

```javascript
localStorage.setItem(
  `quiz_attempt_${quizId}`,
  JSON.stringify({
    quizId,
    answers,
    timestamp,
    currentQuestion
  })
)
```

---

## 📱 Responsive Classes

```tailwind
/* Desktop */
w-64           /* Navigator sidebar width */
max-w-3xl      /* Content max-width */

/* Tablet */
sm:px-6        /* Padding */
md:px-8

/* Mobile */
flex-col       /* Stack vertically */
w-16           /* Navigator collapsed */
px-4           /* Reduced padding */
```

---

## ⏱️ Timer

```javascript
// Timer counts down in seconds
<QuizTimer 
  duration={30}  // Minutes
  isActive={true}
  onTimeUp={() => handleSubmit()}
/>

// Warning kicks in at 5 minutes (300 seconds)
// Shows red background and alert icon
```

---

## 📊 Progress Bar

```javascript
// Animated progress showing
<QuizProgressBar
  currentQuestion={3}     // 0-indexed
  totalQuestions={10}
  answered={7}
/>
```

---

## 🔘 Answer Options

### Single Choice

```javascript
{
  [questionIndex]: 1  // Index of selected option
}
```

### Multiple Choice (Checkboxes)

```javascript
{
  [questionIndex]: [0, 2]  // Array of selected indices
}
```

### Visual States

- **Unselected**: Gray border
- **Selected**: Blue border + fill
- **Correct**: Green (after submit)
- **Incorrect**: Red (after submit)
- **Disabled**: Dimmed (after submit)

---

## 🎯 Quiz Submission

### Submission Object

```javascript
{
  answers: [
    {
      questionId: "q1",
      text: "Question?",
      options: ["A", "B", "C"],
      correct: 1,        // Correct index
      chosen: 1,         // Student's choice
      isCorrect: true
    }
  ],
  score: 9,
  total: 10,
  percentage: 90,
  timestamp: "2026-05-21T..."
}
```

### Submission API

```javascript
POST /api/courses/{courseId}/quizzes/{quizId}/submit
Body: submission object above
```

---

## 🎓 Results Grades

```javascript
Percentage → Grade → Color
90-100     → A      → Green
80-89      → B      → Blue
70-79      → C      → Yellow
60-69      → D      → Orange
0-59       → F      → Red
```

---

## ♿ Accessibility Shortcuts

```
Tab            → Next element
Shift+Tab      → Previous element
Enter/Space    → Select answer
Arrow Keys     → Navigate questions
Escape         → Exit (optional)
```

---

## 🐛 Debug Tips

### Log Current State

```javascript
console.log('Answers:', answers)
console.log('Current Q:', currentQuestion)
console.log('Answered:', Object.keys(answers).length)
```

### Check localStorage

```javascript
localStorage.getItem(`quiz_attempt_${quizId}`)
```

### Inspect Quiz Data

```javascript
console.log('Quiz:', quiz)
console.log('Questions:', quiz.meta?.questions)
console.log('Duration:', quiz.meta?.duration)
```

---

## 🧪 Test URLs

```
Local:     http://localhost:5173/courses/1/quiz/1/take
Staging:   https://staging.academee.com/courses/1/quiz/1/take
Prod:      https://academee.com/courses/1/quiz/1/take
```

---

## 📦 Component Props Summary

| Component | Key Props |
|-----------|-----------|
| QuizPlayer | quiz, onSubmit, onExit, initialAnswers |
| QuizHeader | quizTitle, timer, progress, onTimeUp, onExit |
| QuestionCard | text, questionNumber, totalQuestions, imageUrl |
| AnswerOption | text, index, isSelected, onSelect |
| QuizNavigator | totalQuestions, currentQ, answered, onSelect |
| QuizTimer | duration, isActive, onTimeUp |
| QuizProgressBar | currentQuestion, totalQuestions, answered |
| QuizSubmitModal | isOpen, total, answered, onConfirm |
| QuizResults | score, total, answers, onReview |

---

## 🎨 Color Values

```
Primary:    #3B82F6  (blue-500)
Success:    #22C55E  (green-500)
Danger:     #EF4444  (red-500)
Warning:    #F59E0B  (amber-500)
Neutral:    #64748B  (slate-600)
```

---

## 📞 Common Errors

| Error | Fix |
|-------|-----|
| `Cannot read property 'meta' of null` | Wait for quiz to load |
| `Quiz not found` | Check quizId in URL |
| `Answers not saving` | Check localStorage quota |
| `Timer not showing` | Check duration prop |
| `Mobile layout broken` | Clear cache, check viewport |

---

## 🚀 Quick Start Checklist

- [ ] Import QuizPlayer component
- [ ] Create StudentQuizPage wrapper
- [ ] Add route to App.jsx
- [ ] Pass quiz data from API
- [ ] Handle onSubmit callback
- [ ] Handle onExit callback
- [ ] Test on desktop
- [ ] Test on mobile
- [ ] Check accessibility
- [ ] Deploy!

---

## 📖 Further Reading

- **Full Guide**: QUIZ-PLAYER-GUIDE.md
- **API Reference**: QUIZ-PLAYER-API-REFERENCE.md
- **Examples**: QUIZ-PLAYER-EXAMPLES.md
- **Component Demos**: Run locally and inspect browser DevTools

---

**Last Updated:** May 21, 2026
**Version:** 1.0
**Status:** ✅ Production Ready
