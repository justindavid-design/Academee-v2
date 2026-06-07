import { describe, it, expect } from 'vitest'

describe('quiz feedback utilities', () => {
  it('generates feedback and defaults when fields are missing', async () => {
    const { buildDetailedFeedback, createFeedbackSummary, isFeedbackReady } = await import('../quizFeedbackUtils')

    const questions = [
      {
        id: 'q1',
        question: 'What does HTTPS do?',
        text: 'What does HTTPS do?',
        options: ['Encrypts traffic', 'Caches content', 'Compresses images'],
        correct: 0,
        explanation: 'HTTPS encrypts HTTP traffic with TLS.',
        trivia: 'HTTPS stands for HTTP over TLS.',
        learningTip: 'Remember TLS certificates and HTTPS flows.',
      },
      {
        id: 'q2',
        question: 'Which port is default for HTTP?',
        text: 'Which port is default for HTTP?',
        options: ['80', '443', '8080'],
        correct: 0,
        // no explanation/trivia/learningTip
      },
    ]

    // Build feedback for both questions
    const fb1 = buildDetailedFeedback(questions[0], 0)
    const fb2 = buildDetailedFeedback(questions[1], 2)

    // Assertions: first has provided explanation; second gets a generated explanation
    expect(fb1.explanation).toContain('encrypt')
    expect(fb2.explanation).toBeTruthy()

    // Summary should show feedbackMissing for question 2
    const summary = createFeedbackSummary(questions, [0, 2])
    expect(summary.feedbackMissing).toBeGreaterThanOrEqual(1)
    expect(isFeedbackReady(questions[0])).toBe(true)
  })
})
