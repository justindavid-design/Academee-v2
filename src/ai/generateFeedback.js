import { normalizeText } from './shared'

export function generateFeedback(question, selectedAnswerIndex = null) {
  if (!question) return ''

  const choices = Array.isArray(question.choices) ? question.choices : Array.isArray(question.options) ? question.options : []
  const correctAnswer = normalizeText(question.correctAnswer || question.correct || question.answer || choices[0] || '')
  const selectedAnswer = selectedAnswerIndex != null ? normalizeText(choices[selectedAnswerIndex] || '') : ''

  if (selectedAnswer && correctAnswer && selectedAnswer === correctAnswer) {
    return `Correct. ${correctAnswer} matches the concept being assessed.`
  }

  if (selectedAnswer) {
    return `Not quite yet. You selected "${selectedAnswer}", but the best answer is "${correctAnswer || 'the lesson concept'}". Review the explanation and try again.`
  }

  return normalizeText(question.explanation || question.learningTip || 'Review the related lesson concept before trying again.')
}

export default generateFeedback

