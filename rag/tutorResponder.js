const { createProvider } = require('../ai/providers')
const { semanticSearch } = require('./semanticSearch')

async function answerWithCourseContext({ question, courseId = null, limit = 5, provider = null }) {
  const matches = semanticSearch(question, { limit })
  const aiProvider = provider || createProvider()
  const answer = await aiProvider.complete({
    prompt: question,
    context: matches,
    courseId,
  })

  return {
    answer,
    citations: matches.map((match) => ({
      title: match.title,
      type: match.type,
      source: match.source,
      citation: match.citation,
      score: match.score,
    })),
    confidence: matches.length ? Math.min(0.95, 0.45 + matches[0].score) : 0.2,
    aiDisclosure: {
      generated: true,
      provider: aiProvider.name,
      teacherReviewRecommended: true,
      sourceBounded: true,
    },
  }
}

module.exports = {
  answerWithCourseContext,
}
