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
