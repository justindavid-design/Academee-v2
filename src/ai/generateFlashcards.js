import { collectLessonText, extractConcepts, normalizeText, selectSentenceForConcept, splitSentences } from './shared'

export function generateFlashcards({ source = {}, count = 8 } = {}) {
  const lessonText = collectLessonText(source)
  const sentences = splitSentences(lessonText)
  const concepts = extractConcepts(lessonText, Math.max(4, count))

  return Array.from({ length: Math.max(1, Number(count) || 8) }).map((_item, index) => {
    const concept = concepts[index % concepts.length] || `concept ${index + 1}`
    const sentence = selectSentenceForConcept(sentences, concept)
    return {
      id: `ai-flashcard-${Date.now()}-${index}`,
      front: `What is ${concept}?`,
      back: normalizeText(sentence || `A key idea from the lesson about ${concept}.`),
      conceptTags: [concept],
      source: source.title || 'Lesson material',
      difficulty: index % 3 === 0 ? 'Easy' : index % 3 === 1 ? 'Medium' : 'Hard',
    }
  })
}

export default generateFlashcards

