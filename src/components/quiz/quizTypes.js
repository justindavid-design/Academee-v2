export const quizTypes = [
  {
    id: 'multiple-choice',
    title: 'Multiple Choice',
    description: 'Students choose one correct answer from several options.',
  },
  {
    id: 'multi-select',
    aliases: ['checkbox'],
    title: 'Multi-Select',
    description: 'Students choose more than one correct answer.',
  },
  {
    id: 'true-false',
    title: 'True or False',
    description: 'Students decide whether a statement is true or false.',
  },
  {
    id: 'fill-blank',
    aliases: ['short-answer'],
    title: 'Fill in the Blanks',
    description: 'Students type a short validated response.',
  },
  {
    id: 'open-ended',
    title: 'Open Ended',
    description: 'Students write a longer response for manual review.',
  },
]

export function normalizeQuizType(type = 'multiple-choice') {
  const found = quizTypes.find((item) => item.id === type || item.aliases?.includes(type))
  return found?.id || 'multiple-choice'
}

export function getQuizType(type = 'multiple-choice') {
  return quizTypes.find((item) => item.id === normalizeQuizType(type)) || quizTypes[0]
}

export function getQuestionTypeLabel(type) {
  return getQuizType(type).title
}

export function createQuizQuestion(type = 'multiple-choice') {
  const normalized = normalizeQuizType(type)
  const base = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: normalized,
    question: '',
    text: '',
    points: 1,
    timer: 30,
    explanation: '',
    trivia: '',
    learningTip: '',
    difficulty: 'Medium',
    conceptTags: [],
    media: null,
    required: true,
    randomizeAnswers: false,
    partialCredit: normalized === 'multi-select',
    answerValidation: normalized === 'fill-blank',
  }

  if (normalized === 'true-false') {
    return {
      ...base,
      choices: [
        { id: 'true', text: 'True', is_correct: false },
        { id: 'false', text: 'False', is_correct: false },
      ],
      correctAnswer: 'True',
    }
  }

  if (normalized === 'fill-blank' || normalized === 'open-ended') {
    return {
      ...base,
      choices: [{ id: 'answer-1', text: '', is_correct: true }],
      correctAnswer: '',
    }
  }

  return {
    ...base,
    choices: [
      { id: 'choice-1', text: '', is_correct: false },
      { id: 'choice-2', text: '', is_correct: false },
      { id: 'choice-3', text: '', is_correct: false },
      { id: 'choice-4', text: '', is_correct: false },
    ],
    correctAnswer: '',
  }
}

export function createQuizDraft(type = 'multiple-choice') {
  return {
    title: 'Untitled Quiz',
    description: '',
    instructions: '',
    time_limit: 30,
    due_at: '',
    attempts_allowed: 1,
    passing_score: 70,
    status: 'draft',
    module_id: '',
    mode: 'practice',
    visibility: 'published',
    shuffleQuestions: false,
    shuffleAnswers: false,
    showCorrectAnswers: true,
    autoGrading: true,
    questions: [createQuizQuestion(type)],
  }
}

export function quizDraftKey(courseId, draftId) {
  return `academee_quiz_builder_${courseId}_${draftId || 'draft'}`
}

export function normalizePassThreshold(value, fallback = 0.7) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  if (numeric > 1) return numeric / 100
  if (numeric < 0) return fallback
  return numeric
}

export function getQuizQuestionsSource(quiz = {}) {
  const source = quiz?.meta?.questions ?? quiz?.questions ?? quiz?.question_bank ?? quiz?.content ?? []
  if (Array.isArray(source)) return source
  return source ? [source] : []
}

export function getQuizSettings(quiz = {}) {
  const meta = quiz?.meta || {}
  const settings = meta.settings || {}

  return {
    time_limit: Number(
      meta.time_limit ??
        meta.duration ??
        quiz.time_limit ??
        quiz.time_limit_minutes ??
        settings.time_limit ??
        settings.duration ??
        30
    ) || 30,
    attempts_allowed: Number(meta.attempts_allowed ?? quiz.attempts_allowed ?? settings.attempts_allowed ?? 1) || 1,
    passing_score: Number(meta.passing_score ?? quiz.passing_score ?? settings.passing_score ?? 70) || 70,
    module_id: meta.module_id ?? quiz.module_id ?? settings.module_id ?? '',
    shuffleQuestions: Boolean(meta.shuffleQuestions ?? settings.shuffleQuestions ?? quiz.shuffleQuestions),
    shuffleAnswers: Boolean(meta.shuffleAnswers ?? settings.shuffleAnswers ?? quiz.shuffleAnswers),
    showCorrectAnswers: meta.showCorrectAnswers !== false && settings.showCorrectAnswers !== false && quiz.showCorrectAnswers !== false,
    autoGrading: meta.autoGrading !== false && settings.autoGrading !== false && quiz.autoGrading !== false,
    mode: String(meta.mode || settings.mode || quiz.mode || 'practice').toLowerCase(),
    instructions: meta.instructions ?? quiz.instructions ?? settings.instructions ?? '',
  }
}
