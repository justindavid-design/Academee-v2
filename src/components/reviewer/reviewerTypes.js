export const reviewerTypes = [
  {
    id: 'flashcards',
    icon: 'Layers',
    emoji: 'FC',
    title: 'Flashcards',
    description: 'Flip through quick memory cards',
    longDescription: 'Create front and back cards with tags, attachments, and a playful swipe-ready study mode.',
    gradient: 'from-sky-400 to-cyan-500',
    accent: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  {
    id: 'practice-quiz',
    icon: 'Sparkles',
    emoji: 'PQ',
    title: 'Practice Quiz',
    description: 'Gamified self-review rounds',
    longDescription: 'Build colorful quiz items with streaks, instant feedback, timers, and XP-style progress.',
    gradient: 'from-fuchsia-400 to-pink-500',
    accent: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  {
    id: 'mock-test',
    icon: 'ClipboardCheck',
    emoji: 'MT',
    title: 'Mock Test',
    description: 'Formal timed practice',
    longDescription: 'Create calm assessment-style reviewers with randomization, answer review, and score summaries.',
    gradient: 'from-indigo-500 to-blue-600',
    accent: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  {
    id: 'identification',
    icon: 'PencilLine',
    emoji: 'ID',
    title: 'Identification',
    description: 'Type answers from memory',
    longDescription: 'Prompt learners to recall expected answers with optional hints and flexible validation.',
    gradient: 'from-amber-400 to-orange-500',
    accent: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'matching',
    icon: 'Shuffle',
    emoji: 'MT',
    title: 'Matching Type',
    description: 'Pair terms and definitions',
    longDescription: 'Create draggable term-definition pairs that feel closer to a game than a worksheet.',
    gradient: 'from-emerald-400 to-teal-500',
    accent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    id: 'true-false',
    icon: 'ToggleLeft',
    emoji: 'TF',
    title: 'True or False',
    description: 'Fast binary review mode',
    longDescription: 'Build quick-fire true or false checks with explanations and confidence practice.',
    gradient: 'from-lime-400 to-green-500',
    accent: 'bg-lime-100 text-lime-800 border-lime-200',
  },
  {
    id: 'study-notes',
    icon: 'NotebookPen',
    emoji: 'SN',
    title: 'Study Notes',
    description: 'Clean summarized notes',
    longDescription: 'Draft Notion-style notes with highlights, collapsible sections, images, and files.',
    gradient: 'from-violet-400 to-purple-500',
    accent: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  {
    id: 'interactive-set',
    icon: 'Gamepad2',
    emoji: 'IS',
    title: 'Interactive Review Set',
    description: 'Mixed study activities',
    longDescription: 'Combine cards, checks, notes, matching, and rewards into one immersive review path.',
    gradient: 'from-rose-400 to-red-500',
    accent: 'bg-rose-100 text-rose-700 border-rose-200',
  },
]

export function getReviewerType(typeId) {
  return reviewerTypes.find((type) => type.id === typeId) || reviewerTypes[0]
}

export function createReviewerItem(typeId = 'flashcards') {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`

  if (typeId === 'study-notes') {
    return {
      id,
      title: 'New note block',
      prompt: 'Key idea',
      answer: 'Write a short explanation students can scan quickly.',
      hint: 'Add a highlight, example, or memory hook.',
      tags: 'summary',
      expanded: true,
    }
  }

  if (typeId === 'matching') {
    return {
      id,
      title: 'New match pair',
      prompt: 'Term',
      answer: 'Definition',
      hint: 'Optional clue',
      tags: 'matching',
      pairs: [
        { left: 'Concept', right: 'Meaning' },
        { left: 'Example', right: 'Use case' },
      ],
    }
  }

  if (typeId === 'true-false') {
    return {
      id,
      title: 'True or false item',
      prompt: 'Write a statement learners can judge.',
      answer: 'True',
      hint: 'Explain why the statement is true or false.',
      tags: 'quick-check',
      options: ['True', 'False'],
    }
  }

  if (typeId === 'identification') {
    return {
      id,
      title: 'Identification prompt',
      prompt: 'Ask for a term, process, person, or key answer.',
      answer: 'Expected answer',
      hint: 'Optional hint learners can reveal.',
      tags: 'recall',
    }
  }

  return {
    id,
    title: typeId === 'flashcards' ? 'Flashcard' : 'Question',
    prompt: typeId === 'flashcards' ? 'Front side question or term' : 'Write your question here.',
    answer: typeId === 'flashcards' ? 'Back side answer or explanation' : 'Correct answer',
    hint: 'Add a memory hook or feedback.',
    tags: 'core',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
  }
}

export function createReviewerDraft(typeId = 'flashcards') {
  return {
    title: `${getReviewerType(typeId).title} Reviewer`,
    description: 'A focused review set for fast, friendly studying.',
    type: typeId,
    status: 'draft',
    timer: typeId === 'mock-test' ? 45 : 15,
    xp: 120,
    streakGoal: 5,
    randomize: true,
    showHints: true,
    allowRepeat: true,
    items: [createReviewerItem(typeId), createReviewerItem(typeId)],
  }
}
