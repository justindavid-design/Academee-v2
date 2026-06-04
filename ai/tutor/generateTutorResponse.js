const { normalizeText } = require('../../adaptive/contentUtils')

function generateTutorResponse(question, sources = []) {
  const cleanQuestion = normalizeText(question)

  if (!sources.length) {
    return {
      answer: 'I could not find this in the current course materials yet. Try asking about a posted lesson, reviewer, quiz, assignment, or announcement, or ask your teacher to add a source for this topic.',
      confidence: 'low',
      sources: [],
      followUps: [
        'Which lesson should I review first?',
        'Can you summarize the posted materials?',
      ],
    }
  }

  const top = sources[0]
  const sourceLines = sources.map((source) => `${source.title}: ${source.text}`).join(' ')
  const concise = sourceLines.length > 720 ? `${sourceLines.slice(0, 720)}...` : sourceLines

  return {
    answer: `Based on the course materials, ${cleanQuestion ? `your question about "${cleanQuestion}" connects most closely to ${top.title}. ` : ''}${concise}`,
    confidence: sources.length >= 2 ? 'medium' : 'limited',
    sources: sources.map((source) => ({
      id: source.id,
      type: source.type,
      title: source.title,
      excerpt: source.text.slice(0, 180),
    })),
    followUps: [
      `Show me a simpler explanation of ${top.title}.`,
      'Give me a short practice check.',
      'What should I review next?',
    ],
  }
}

module.exports = {
  generateTutorResponse,
}
