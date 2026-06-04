# Adaptive Quiz Feedback System - API Reference

## Quick Reference

### Import Statements

```javascript
// Components
import QuizFeedbackPanel from '../components/student-quiz/QuizFeedbackPanel'
import QuizExplanationCard from '../components/student-quiz/QuizExplanationCard'
import QuizTriviaCard from '../components/student-quiz/QuizTriviaCard'
import AdaptiveFeedbackRenderer, { 
  QuizMode, 
  FeedbackLayout 
} from '../components/student-quiz/AdaptiveFeedbackRenderer'

// Hooks
import { useQuizProgressController } from '../hooks/useQuizProgressController'
import { useAIFeedback } from '../hooks/useAIFeedback'

// Utilities
import { 
  buildDetailedFeedback,
  buildQuestionFeedback,
  isFeedbackReady,
  createFeedbackSummary,
  getRecommendedResources
} from '../lib/quizFeedbackUtils'

// Services
import {
  getFeedback,
  generateAIFeedback,
  generateBatchFeedback,
  determineFeedbackProvider,
  validateFeedbackQuality,
  generateFeedbackReport
} from '../lib/feedbackService'

// Schema
import {
  normalizeQuestionWithFeedback,
  hasCustomFeedback,
  extractFeedback,
  isFeedbackComplete,
  getFeedbackCompleteness
} from '../schemas/quizFeedbackSchema'
```

---

## Schema & Utilities

### `quizFeedbackSchema.js`

#### `normalizeQuestionWithFeedback(question, index)`

Validates and normalizes a question object with feedback fields.

**Parameters:**
- `question` {Object} - Question object (may be incomplete)
- `index` {number} - Question index (optional, used for default ID)

**Returns:** {Object} Normalized question with all fields

**Example:**
```javascript
const question = { text: "What is HTTPS?", options: [...], correct: 0 }
const normalized = normalizeQuestionWithFeedback(question, 0)
// Returns:
// {
//   id: "question-1",
//   text: "What is HTTPS?",
//   options: [...],
//   correct: 0,
//   explanation: null,
//   trivia: null,
//   learningTip: null,
//   difficulty: "medium",
//   conceptTags: [],
//   feedbackSource: "manual",
//   aiConfidence: null
// }
```

#### `hasCustomFeedback(question)`

Checks if question has any custom feedback content.

**Returns:** {boolean}

```javascript
if (hasCustomFeedback(question)) {
  console.log("This question has custom feedback")
}
```

#### `extractFeedback(question, selectedAnswerIndex)`

Extracts feedback for a specific answer.

**Returns:** {Object} Feedback object with isCorrect, selectedOption, correctOption, etc.

```javascript
const feedback = extractFeedback(question, 0)
if (feedback.isCorrect) {
  console.log("Student selected correct option:", feedback.correctOption)
}
```

#### `isFeedbackComplete(question)`

Checks if question has all feedback fields.

**Returns:** {boolean}

```javascript
const isComplete = isFeedbackComplete(question)
// true if: explanation, trivia, learningTip, conceptTags all present
```

#### `getFeedbackCompleteness(question)`

Gets percentage of feedback fields completed (0-100).

**Returns:** {number}

```javascript
const completeness = getFeedbackCompleteness(question)
console.log(`Question is ${completeness}% complete with feedback`)
```

---

### `quizFeedbackUtils.js`

#### `buildDetailedFeedback(question, selectedAnswerIndex)`

Builds complete feedback object with all fields.

**Returns:** {Object} Complete feedback with:
- `isCorrect` {boolean}
- `status` {string} "Correct!" or "Incorrect"
- `explanation` {string}
- `trivia` {string|null}
- `learningTip` {string}
- `conceptTags` {array}
- `difficulty` {string}
- `feedbackSource` {string}
- `selectedOption` {string}
- `correctOption` {string}

**Example:**
```javascript
const feedback = buildDetailedFeedback(question, 0)
// If question lacks explanation, generates default:
// "You selected 'HTTP Secure', which is correct..."
```

#### `isFeedbackReady(question)`

Checks if question is ready for feedback display.

**Returns:** {boolean}

```javascript
if (isFeedbackReady(question)) {
  return <QuizFeedbackPanel question={question} ... />
}
```

#### `createFeedbackSummary(questions, answers)`

Creates overall feedback summary for quiz.

**Returns:** {Object}
```javascript
{
  totalQuestions: number,
  correct: number,
  incorrect: number,
  feedbackAvailable: number,
  feedbackMissing: number,
  conceptsMastered: array,
  conceptsToReview: array,
  difficultyBreakdown: {
    easy: { total, correct },
    medium: { total, correct },
    hard: { total, correct }
  }
}
```

**Example:**
```javascript
const summary = createFeedbackSummary(questions, answers)
console.log(`Mastered: ${summary.conceptsMastered.join(', ')}`)
console.log(`To review: ${summary.conceptsToReview.join(', ')}`)
```

#### `getRecommendedResources(conceptsToReview)`

Gets learning resources for weak concepts.

**Returns:** {Array} Resource suggestions

```javascript
const resources = getRecommendedResources(['encryption', 'https'])
// Returns:
// [
//   {
//     concept: 'encryption',
//     tips: ['Learn about symmetric and asymmetric encryption', ...]
//   },
//   ...
// ]
```

#### `formatFeedbackText(feedback)`

Formats feedback for text display/export.

**Returns:** {string}

```javascript
const text = formatFeedbackText(feedback)
// "**Correct!**\n\nHTTPS uses SSL/TLS encryption...\n\n💡 Always check for padlock icon..."
```

#### `calculateFeedbackMetrics(quizResults)`

Calculates feedback quality metrics.

**Returns:** {Object}
```javascript
{
  totalFeedbackShown: number,
  averageFeedbackQuality: 0-100,
  feedbackEngagementRate: 0-100,
  commonMisunderstandings: { answer: count, ... },
  learningPathRecommendations: array
}
```

---

### `feedbackService.js`

#### `getFeedback(question, selectedAnswerIndex)`

Gets feedback with automatic caching. Async function.

**Returns:** {Promise<Object>} Feedback object

```javascript
const feedback = await getFeedback(question, 0)
if (feedback) {
  console.log(feedback.explanation)
}
```

#### `generateAIFeedback(question, selectedAnswerIndex)`

Placeholder for future AI feedback generation. Async function.

**Returns:** {Promise<Object|null>}

```javascript
// Currently returns null - will be implemented when AI service ready
const aiFeedback = await generateAIFeedback(question, 0)
```

#### `generateBatchFeedback(questions, answers)`

Generate feedback for all questions at once. Async function.

**Returns:** {Promise<Array>}

```javascript
const allFeedback = await generateBatchFeedback(questions, answers)
// Returns array of feedback objects, parallel processing
```

#### `clearFeedbackCache()`

Clears the internal feedback cache.

```javascript
feedbackService.clearFeedbackCache()
```

#### `getCacheStats()`

Gets cache statistics.

**Returns:** {Object}

```javascript
const stats = getCacheStats()
console.log(`Cached ${stats.size} feedback items`)
```

#### `determineFeedbackProvider(question)`

Determines which feedback provider to use.

**Returns:** {string} 'manual' | 'generated' | 'ai'

```javascript
const provider = determineFeedbackProvider(question)
// 'manual' if has custom feedback
// 'ai' if marked as AI-generated
// 'generated' otherwise
```

#### `validateFeedbackQuality(feedback)`

Validates feedback quality on 0-100 scale.

**Returns:** {number}

```javascript
const quality = validateFeedbackQuality(feedback)
if (quality < 50) {
  console.log("Consider enhancing this feedback")
}
```

#### `generateFeedbackReport(questions, answers)`

Generates detailed feedback quality report.

**Returns:** {Object}

```javascript
{
  totalQuestions: number,
  questionsWithFeedback: number,
  averageQuality: 0-100,
  feedbackBreakdown: { manual: n, generated: n, ai: n },
  providerDistribution: [
    { provider: 'manual', count: 5, percentage: 50 },
    ...
  ]
}
```

---

## Hooks

### `useQuizProgressController.js`

#### `useQuizProgressController(questions, options)`

Main hook for managing quiz progression with feedback.

**Parameters:**
- `questions` {Array} - Array of question objects
- `options` {Object} - Configuration:
  - `isPracticeMode` {boolean} - Default: true
  - `onQuestionChange` {function(index, total)} - Called when question changes
  - `onAnswerSubmit` {function(index, answerIdx, isCorrect)} - Called when answer submitted
  - `onQuizComplete` {function(answers)} - Called when quiz finishes

**Returns:** {Object}
```javascript
{
  // State
  currentQuestionIndex: number,
  currentQuestion: Object,
  totalQuestions: number,
  answers: { [questionIndex]: answerIndex, ... },
  answeredCount: number,
  selectedAnswerIndex: number|null,
  showingFeedback: boolean,
  quizComplete: boolean,
  isFirstQuestion: boolean,
  isLastQuestion: boolean,
  progressPercentage: 0-100,
  viewedQuestions: array,
  
  // Actions
  submitAnswer(answerIndex),
  continueToNext(),
  goToQuestion(index),
  updateAnswer(questionIndex, answerIndex),
  restart()
}
```

**Example:**
```javascript
const controller = useQuizProgressController(questions, {
  isPracticeMode: true,
  onAnswerSubmit: (idx, answerIdx, isCorrect) => {
    analytics.log('answer', { isCorrect })
  }
})

// Access state
if (controller.showingFeedback) {
  return <QuizFeedbackPanel ... />
}

// Call actions
controller.submitAnswer(0)
controller.continueToNext()
```

### `useAIFeedback.js`

#### `useAIFeedback(options)`

Hook for managing AI feedback requests (future).

**Parameters:**
- `options` {Object}:
  - `enabled` {boolean} - Default: false
  - `cacheTimeout` {number} - Default: 3600000 (1 hour)
  - `retryCount` {number} - Default: 2
  - `onError` {function(error, question, answerIndex)} - Error callback

**Returns:** {Object}
```javascript
{
  // State
  feedbackCache: { [key]: feedback, ... },
  loading: { [key]: boolean, ... },
  errors: { [key]: errorMessage, ... },
  isEnabled: boolean,
  
  // Methods
  requestFeedback(question, answerIndex) -> Promise,
  requestBatchFeedback(questions, answers) -> Promise,
  clearCache(),
  getCacheInfo() -> { size, items }
}
```

**Example:**
```javascript
const ai = useAIFeedback({
  enabled: process.env.REACT_APP_AI_ENABLED === 'true',
  onError: (error) => console.error('AI failed:', error)
})

const feedback = await ai.requestFeedback(question, 0)
```

---

## Components

### `QuizFeedbackPanel.jsx`

Main feedback container component.

**Props:**
```javascript
{
  question: Object,              // Full question object (required)
  selectedAnswerIndex: number,   // Index 0-3 (required)
  onContinue: function,          // Callback when clicking Continue (required)
  isPracticeMode: boolean,       // Show tip text (default: true)
  autoAdvanceDelay: number       // Auto-advance after N ms (optional)
}
```

**Example:**
```javascript
<QuizFeedbackPanel
  question={question}
  selectedAnswerIndex={0}
  onContinue={() => controller.continueToNext()}
  isPracticeMode={true}
  autoAdvanceDelay={3000}
/>
```

**Features:**
- Color-coded feedback (green/red)
- Shows selected vs correct for wrong answers
- Keyboard accessible (Tab, Enter)
- Screen reader compatible
- Dark mode support
- Responsive design

---

### `QuizExplanationCard.jsx`

Displays explanation why answer is correct/incorrect.

**Props:**
```javascript
{
  isCorrect: boolean,
  explanation: string,
  selectedOption: string,
  correctOption: string
}
```

**Example:**
```javascript
<QuizExplanationCard
  isCorrect={true}
  explanation="HTTPS uses SSL/TLS encryption..."
  selectedOption="HTTP Secure"
  correctOption="HTTP Secure"
/>
```

---

### `QuizTriviaCard.jsx`

Displays trivia, learning tips, and concept tags.

**Props:**
```javascript
{
  trivia: string,
  learningTip: string,
  conceptTags: array
}
```

**Example:**
```javascript
<QuizTriviaCard
  trivia="Modern browsers warn when HTTPS is not used"
  learningTip="Always check for the padlock icon"
  conceptTags={['web-security', 'encryption']}
/>
```

---

### `AdaptiveFeedbackRenderer.jsx`

Flexible feedback renderer with multiple layouts and modes.

**Props:**
```javascript
{
  question: Object,
  selectedAnswerIndex: number,
  layout: string,              // 'panel'|'card'|'inline'|'minimal'
  mode: string,                // 'practice'|'exam'|'review'
  onContinue: function,
  showAutomatically: boolean,  // Default: false
  autoAdvanceDelay: number     // Optional
}
```

**Layout Modes:**
- `FeedbackLayout.PANEL` - Full panel with all content
- `FeedbackLayout.CARD` - Compact card
- `FeedbackLayout.INLINE` - Inline with question
- `FeedbackLayout.MINIMAL` - Just explanation

**Quiz Modes:**
- `QuizMode.PRACTICE` - Show instant feedback
- `QuizMode.EXAM` - Hide feedback until completion
- `QuizMode.REVIEW` - Show all feedback

**Example:**
```javascript
import { AdaptiveFeedbackRenderer, QuizMode, FeedbackLayout } from './AdaptiveFeedbackRenderer'

<AdaptiveFeedbackRenderer
  question={question}
  selectedAnswerIndex={0}
  layout={FeedbackLayout.PANEL}
  mode={QuizMode.PRACTICE}
  onContinue={handleContinue}
/>
```

---

## Constants & Enums

### FeedbackLayout

```javascript
export const FeedbackLayout = {
  PANEL: 'panel',       // Full featured panel
  CARD: 'card',         // Compact card
  INLINE: 'inline',     // Inline with question
  MINIMAL: 'minimal'    // Minimal version
}
```

### QuizMode

```javascript
export const QuizMode = {
  PRACTICE: 'practice', // Instant feedback
  EXAM: 'exam',         // Deferred feedback
  REVIEW: 'review'      // All feedback visible
}
```

### FeedbackProvider

```javascript
export const FeedbackProvider = {
  MANUAL: 'manual',         // User-provided
  GENERATED: 'generated',   // Auto-generated
  AI: 'ai'                  // AI-generated
}
```

---

## Type Definitions

### Question Object

```typescript
interface Question {
  id?: string                    // Optional ID
  text: string                   // Question text (required)
  options: string[]              // Answer options (required)
  correct: number                // Index of correct answer (required)
  
  // Feedback fields (optional)
  explanation?: string           // Why answer is correct
  trivia?: string               // Fun fact
  learningTip?: string          // Learning guidance
  difficulty?: 'easy'|'medium'|'hard'  // Default: 'medium'
  conceptTags?: string[]         // Related concepts
  feedbackSource?: string        // Source of feedback
  aiConfidence?: number          // 0-1 for AI
}
```

### Feedback Object

```typescript
interface Feedback {
  isCorrect: boolean
  status: string                 // "Correct!" or "Incorrect"
  statusIcon: string            // "✓" or "✗"
  statusColor: string           // 'success' or 'error'
  explanation: string
  trivia: string|null
  learningTip: string
  conceptTags: string[]
  difficulty: string
  feedbackSource: string
  selectedOption: string
  correctOption: string
}
```

---

## Error Handling

### Safe Defaults

All functions handle missing/invalid data gracefully:

```javascript
// Missing question - returns null
buildDetailedFeedback(null, 0)  // null

// Invalid answer index - uses correct answer
buildDetailedFeedback(question, -1)  // Uses question.correct

// Missing feedback fields - generates defaults
buildDetailedFeedback(question, 0)  // Generates explanation

// Missing conceptTags - empty array
extractFeedback(question, 0)  // conceptTags: []
```

### Error Callbacks

```javascript
// AI feedback with error handling
const ai = useAIFeedback({
  onError: (error, question, answerIndex) => {
    console.error('AI feedback failed:', error.message)
    // Fall back to manual/generated
  }
})
```

---

## Performance Tips

### 1. Memoization

```javascript
const feedback = useMemo(
  () => buildDetailedFeedback(question, selectedAnswerIndex),
  [question, selectedAnswerIndex]
)
```

### 2. Lazy Loading

```javascript
if (!showingFeedback) return null
return <QuizFeedbackPanel ... />
```

### 3. Batch Processing

```javascript
const allFeedback = await generateBatchFeedback(questions, answers)
// Faster than individual requests
```

### 4. Caching

```javascript
feedbackService.getFeedback(question, 0)
// Auto-cached for reuse
```

---

## Summary

| Function | Purpose | Returns |
|----------|---------|---------|
| `buildDetailedFeedback()` | Generate complete feedback | Feedback object |
| `getFeedback()` | Get cached feedback | Promise<Feedback> |
| `generateBatchFeedback()` | Batch generate | Promise<Array> |
| `useQuizProgressController()` | Manage quiz flow | Hook state/actions |
| `useAIFeedback()` | Manage AI requests | Hook state/actions |
| `<QuizFeedbackPanel />` | Display feedback | Component |
| `<AdaptiveFeedbackRenderer />` | Flexible renderer | Component |

---

**Full documentation:** See `ADAPTIVE-QUIZ-FEEDBACK-GUIDE.md`
