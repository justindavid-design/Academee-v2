import { describe, expect, it } from 'vitest'
import { createEmptyMasteryProfile, selectAdaptiveNextQuestion } from '../adaptiveQuizEngine'

const questions = [
  {
    id: 'q1',
    question: 'What does HTTPS protect?',
    options: ['Traffic in transit', 'Screen brightness', 'File size'],
    correct: 0,
    difficulty: 'Easy',
    conceptTags: ['Security'],
  },
  {
    id: 'q2',
    question: 'Which protocol secures HTTP?',
    options: ['TLS', 'FTP', 'SMTP'],
    correct: 0,
    difficulty: 'Medium',
    conceptTags: ['Security'],
  },
  {
    id: 'q3',
    question: 'What is subnetting used for?',
    options: ['Dividing networks', 'Encrypting traffic', 'Rendering CSS'],
    correct: 0,
    difficulty: 'Hard',
    conceptTags: ['Subnetting'],
  },
]

describe('adaptive quiz engine navigation', () => {
  it('does not select the current or already answered question', () => {
    const nextIndex = selectAdaptiveNextQuestion({
      questions,
      currentIndex: 0,
      masteryByConcept: createEmptyMasteryProfile(questions),
      answeredIndices: [0],
      currentOutcome: {
        isCorrect: true,
        responseTimeSeconds: 8,
        difficulty: 'Easy',
        conceptTags: ['Security'],
      },
    })

    expect(nextIndex).not.toBe(0)
    expect([1, 2]).toContain(nextIndex)
  })

  it('returns null when no unanswered questions remain', () => {
    const nextIndex = selectAdaptiveNextQuestion({
      questions,
      currentIndex: 2,
      masteryByConcept: createEmptyMasteryProfile(questions),
      answeredIndices: [0, 1, 2],
      currentOutcome: {
        isCorrect: false,
        responseTimeSeconds: 20,
        difficulty: 'Hard',
        conceptTags: ['Subnetting'],
      },
    })

    expect(nextIndex).toBeNull()
  })
})
