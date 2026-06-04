import { collectLessonText, createChoiceSet, deriveLearningTip, extractConcepts, normalizeText, selectSentenceForConcept, splitSentences, chooseDifficulty } from './shared'

function buildQuestion(concept, sentence, index, total) {
  const questionTypeCycle = ['multiple-choice', 'true-false', 'identification', 'fill-in-the-blank', 'hots']
  const type = questionTypeCycle[index % questionTypeCycle.length]
  const difficulty = chooseDifficulty(index, total)

  if (type === 'true-false') {
    const statement = sentence
      ? sentence.replace(/\.$/, '')
      : `${concept} is a key idea in this lesson`
    return {
      type,
      question: `${statement}.`,
      choices: ['True', 'False'],
      correctAnswer: 'True',
      explanation: normalizeText(sentence || `This statement summarizes the lesson idea around ${concept}.`),
      trivia: `Watch for wording that changes the meaning of ${concept}.`,
      learningTip: deriveLearningTip(concept, sentence),
      difficulty,
      conceptTags: [concept],
    }
  }

  if (type === 'identification') {
    return {
      type,
      question: `Identify the concept being described: ${sentence || `A core idea in the lesson about ${concept}`}.`,
      choices: [],
      correctAnswer: concept,
      explanation: normalizeText(sentence || `The concept is ${concept}.`),
      trivia: `Identification items work well for vocabulary and key terms.`,
      learningTip: deriveLearningTip(concept, sentence),
      difficulty,
      conceptTags: [concept],
    }
  }

  if (type === 'fill-in-the-blank') {
    return {
      type,
      question: `Complete the statement: ${sentence ? sentence.replace(new RegExp(concept, 'ig'), '_____') : `_____ is an important concept in this lesson.`}`,
      choices: [],
      correctAnswer: concept,
      explanation: normalizeText(sentence || `The blank stands for ${concept}.`),
      trivia: `Fill-in items are useful when you want students to recall exact terms.`,
      learningTip: deriveLearningTip(concept, sentence),
      difficulty,
      conceptTags: [concept],
    }
  }

  if (type === 'hots') {
    return {
      type,
      question: `How would you apply ${concept} in a new situation?`,
      choices: createChoiceSet(concept, sentence),
      correctAnswer: createChoiceSet(concept, sentence)[0],
      explanation: normalizeText(sentence || `Students should connect ${concept} to a new example rather than memorize it in isolation.`),
      trivia: 'HOTS questions should encourage reasoning, not just recall.',
      learningTip: deriveLearningTip(concept, sentence),
      difficulty,
      conceptTags: [concept, 'analysis'],
    }
  }

  const choices = createChoiceSet(concept, sentence)
  return {
    type: 'multiple-choice',
    question: `Which statement best describes ${concept}?`,
    choices,
    correctAnswer: choices[0],
    explanation: normalizeText(sentence || `The lesson points to ${concept} as the main idea.`),
    trivia: `Multiple choice items can reinforce ${concept} and its common misconception.`,
    learningTip: deriveLearningTip(concept, sentence),
    difficulty,
    conceptTags: [concept],
  }
}

export function generateQuiz({ source = {}, count = 5 } = {}) {
  const lessonText = collectLessonText(source)
  const sentences = splitSentences(lessonText)
  const concepts = extractConcepts(lessonText, Math.max(3, count))
  const total = Math.max(1, Number(count) || 5)

  return Array.from({ length: total }, (_item, index) => {
    const concept = concepts[index % concepts.length] || `concept ${index + 1}`
    const sentence = selectSentenceForConcept(sentences, concept)
    return {
      id: `ai-quiz-${Date.now()}-${index}`,
      ...buildQuestion(concept, sentence, index, total),
    }
  })
}

export default generateQuiz

