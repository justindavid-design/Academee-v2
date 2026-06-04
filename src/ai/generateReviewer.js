import { collectLessonText, deriveLearningTip, extractConcepts, normalizeText, selectSentenceForConcept, splitSentences } from './shared'

export function generateReviewer({ source = {}, count = 6 } = {}) {
  const lessonText = collectLessonText(source)
  const sentences = splitSentences(lessonText)
  const concepts = extractConcepts(lessonText, Math.max(4, count))

  const cards = Array.from({ length: Math.max(1, Number(count) || 6) }).map((_item, index) => {
    const concept = concepts[index % concepts.length] || `topic ${index + 1}`
    const sentence = selectSentenceForConcept(sentences, concept)
    const answer = sentence || `Explain the role of ${concept} in your own words.`

    return {
      id: `ai-reviewer-${Date.now()}-${index}`,
      title: `Review ${index + 1}`,
      prompt: `Explain ${concept}`,
      answer,
      hint: deriveLearningTip(concept, sentence),
      tags: concept,
      expanded: index < 2,
      resources: [],
      summary: normalizeText(sentence || `Key idea: ${concept}`),
    }
  })

  return {
    title: source.title ? `${source.title} Reviewer` : 'AI Reviewer',
    description: normalizeText(source.description || 'Automatically generated reviewer draft. Review and edit before publishing.'),
    type: source.type || 'flashcards',
    status: 'draft',
    timer: source.timer || 15,
    xp: Math.max(80, cards.length * 20),
    streakGoal: Math.max(3, Math.min(8, cards.length)),
    randomize: true,
    showHints: true,
    allowRepeat: true,
    items: cards,
  }
}

export default generateReviewer

