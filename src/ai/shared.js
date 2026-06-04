const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'what', 'when', 'where', 'which',
  'into', 'your', 'their', 'there', 'have', 'will', 'would', 'could', 'should', 'about',
  'after', 'before', 'using', 'use', 'used', 'course', 'lesson', 'review', 'student', 'teacher',
  'assignment', 'quiz', 'module', 'content', 'learning', 'study', 'concept', 'concepts',
  'answer', 'question', 'activity', 'material', 'materials', 'guide',
])

export function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

export function splitSentences(text) {
  return normalizeText(text)
    .split(/(?<=[.!?])\s+|\n+/g)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

export function extractConcepts(text, limit = 8) {
  const normalized = normalizeText(text).toLowerCase()
  const words = normalized.match(/[a-z][a-z-]{3,}/g) || []
  const counts = words.reduce((acc, word) => {
    if (STOP_WORDS.has(word)) return acc
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word)
}

export function collectLessonText(source = {}) {
  const parts = [
    source.title,
    source.description,
    source.instructions,
    source.summary,
    source.notes,
    source.content,
    source.text,
    source.body,
    Array.isArray(source.sections) ? source.sections.map((section) => section?.title || section?.text || '').join('\n') : '',
    Array.isArray(source.files) ? source.files.map((file) => file?.name || file?.filename || '').join(' ') : '',
  ]

  return normalizeText(parts.filter(Boolean).join('\n'))
}

export function chooseDifficulty(index, total = 1) {
  const ratio = total ? index / total : 0
  if (ratio < 0.34) return 'Easy'
  if (ratio < 0.67) return 'Medium'
  return 'Hard'
}

export function deriveLearningTip(concept, sentence = '') {
  const base = sentence ? `Review the section about ${concept} in the lesson and compare it with this idea: ${sentence}` : `Review the related lesson section on ${concept}.`
  return normalizeText(base)
}

export function selectSentenceForConcept(sentences = [], concept = '') {
  if (!concept) return sentences[0] || ''
  const lowered = concept.toLowerCase()
  return sentences.find((sentence) => sentence.toLowerCase().includes(lowered)) || sentences[0] || ''
}

export function createChoiceSet(concept, sentence = '') {
  const stem = sentence ? sentence.replace(/\.$/, '') : `The best description of ${concept}`
  return [
    `${stem} is the core idea students need to remember.`,
    `${stem} is only a minor detail that can be ignored.`,
    `${stem} applies only in one narrow example and never again.`,
    `${stem} is unrelated to the learning goal.`,
  ]
}

