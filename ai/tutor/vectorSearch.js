const { getKeywords, normalizeText } = require('../../adaptive/contentUtils')

function scoreChunk(question, chunk) {
  const queryTerms = new Set(getKeywords(question, 12))
  const chunkText = normalizeText(`${chunk.title} ${chunk.text}`).toLowerCase()
  let score = 0
  queryTerms.forEach((term) => {
    if (chunkText.includes(term)) score += term.length > 6 ? 2 : 1
  })
  return score
}

function searchCourseContent(question, corpus = [], limit = 4) {
  return corpus
    .map((chunk) => ({ ...chunk, score: scoreChunk(question, chunk) }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

module.exports = {
  searchCourseContent,
}
