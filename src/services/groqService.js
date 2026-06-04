const Groq = require('groq-sdk')

const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_TOKEN || process.env.GROQ_API_SECRET
const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
const groq = apiKey ? new Groq({ apiKey }) : null

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function safeJsonParse(value) {
  if (!value) return null

  if (typeof value === 'object') {
    return value
  }

  const text = String(value).trim()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch (_error) {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch (_innerError) {
      return null
    }
  }
}

function buildPromptPayload(payload = {}) {
  const question = normalizeText(payload.question || payload.text)
  const correctAnswer = normalizeText(payload.correctAnswer || payload.correct_answer)
  const studentAnswer = normalizeText(payload.studentAnswer || payload.selectedAnswer || payload.selected_answer)
  const conceptTags = Array.isArray(payload.conceptTags) ? payload.conceptTags.map(normalizeText).filter(Boolean) : []
  const lessonContent = normalizeText(payload.lessonContent || payload.lessonText || payload.lesson || payload.context)
  const difficulty = normalizeText(payload.difficulty || 'Medium')

  return {
    question,
    correctAnswer,
    studentAnswer,
    conceptTags,
    lessonContent,
    difficulty,
    isCorrect: Boolean(payload.isCorrect),
    quizMode: normalizeText(payload.mode || payload.quizMode || 'practice'),
  }
}

function buildFallbackFeedback(payload = {}) {
  const normalized = buildPromptPayload(payload)
  const question = normalized.question || 'the question'
  const correctAnswer = normalized.correctAnswer || 'the correct answer'
  const studentAnswer = normalized.studentAnswer || 'your answer'
  const isCorrect = Boolean(payload.isCorrect)
  const topic = normalized.conceptTags[0] || 'this concept'

  return {
    explanation: isCorrect
      ? `You selected the correct answer for ${topic}.`
      : `You selected "${studentAnswer}", but the correct answer is "${correctAnswer}".`,
    trivia: `Adaptive feedback uses ${topic} to choose what to review next.`,
    learningTip: isCorrect
      ? `Keep practicing ${topic} to lock in the skill.`
      : `Review the core idea behind ${topic}, then try another example.`,
    answerAnalysis: isCorrect
      ? `Your answer matches the expected response for "${question}".`
      : `Your answer does not match the expected response for "${question}".`,
  }
}

async function generateQuizFeedback(payload = {}) {
  const prompt = buildPromptPayload(payload)

  if (!groq) {
    return {
      ...buildFallbackFeedback({ ...payload, ...prompt }),
      feedbackSource: 'generated',
      aiConfidence: 0,
    }
  }

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are an educational assistant that returns JSON only with keys: explanation, trivia, learningTip, answerAnalysis, misconception, and aiConfidence.',
      },
      {
        role: 'user',
        content: JSON.stringify({
          question: prompt.question,
          correctAnswer: prompt.correctAnswer,
          studentAnswer: prompt.studentAnswer,
          conceptTags: prompt.conceptTags,
          lessonContent: prompt.lessonContent,
          difficulty: prompt.difficulty,
          isCorrect: prompt.isCorrect,
          quizMode: prompt.quizMode,
        }, null, 2),
      },
    ],
    temperature: 0.4,
  })

  const content = completion?.choices?.[0]?.message?.content || ''
  const parsed = safeJsonParse(content) || buildFallbackFeedback({ ...payload, ...prompt })

  return {
    explanation: normalizeText(parsed.explanation) || buildFallbackFeedback({ ...payload, ...prompt }).explanation,
    trivia: normalizeText(parsed.trivia) || buildFallbackFeedback({ ...payload, ...prompt }).trivia,
    learningTip: normalizeText(parsed.learningTip) || buildFallbackFeedback({ ...payload, ...prompt }).learningTip,
    answerAnalysis: normalizeText(parsed.answerAnalysis) || buildFallbackFeedback({ ...payload, ...prompt }).answerAnalysis,
    misconception: normalizeText(parsed.misconception) || '',
    feedbackSource: 'ai',
    aiConfidence: Number.isFinite(Number(parsed.aiConfidence)) ? Number(parsed.aiConfidence) : 0.8,
  }
}

module.exports = {
  generateQuizFeedback,
  buildFallbackFeedback,
}
