const { processResources } = require('./chunkProcessor')
const { globalVectorStore } = require('./vectorStore')

function indexLearningResources(resources = [], options = {}) {
  const chunks = processResources(resources, options)
  return globalVectorStore.upsert(chunks)
}

function semanticSearch(query, options = {}) {
  return globalVectorStore.search(query, options).map((match) => ({
    id: match.id,
    resourceId: match.resourceId,
    title: match.title,
    type: match.type,
    source: match.source,
    content: match.content,
    score: Number(match.score.toFixed(4)),
    citation: `${match.title}${match.ordinal ? `, section ${match.ordinal}` : ''}`,
    metadata: match.metadata,
  }))
}

module.exports = {
  indexLearningResources,
  semanticSearch,
}
