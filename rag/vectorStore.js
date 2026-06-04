const { createEmbedding, cosineSimilarity } = require('./embeddings')

class MemoryVectorStore {
  constructor() {
    this.records = []
  }

  upsert(chunks = []) {
    const nextRecords = chunks.map((chunk) => ({
      ...chunk,
      embedding: chunk.embedding || createEmbedding(chunk.content),
      updatedAt: new Date().toISOString(),
    }))

    const byId = new Map(this.records.map((record) => [record.id, record]))
    nextRecords.forEach((record) => byId.set(record.id, record))
    this.records = Array.from(byId.values())
    return nextRecords
  }

  search(query, options = {}) {
    const limit = Number(options.limit || 6)
    const minScore = Number(options.minScore || 0.08)
    const queryEmbedding = createEmbedding(query)

    return this.records
      .map((record) => ({
        ...record,
        score: cosineSimilarity(queryEmbedding, record.embedding),
      }))
      .filter((record) => record.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  clear(scopePredicate = null) {
    if (!scopePredicate) {
      this.records = []
      return
    }
    this.records = this.records.filter((record) => !scopePredicate(record))
  }
}

const globalVectorStore = new MemoryVectorStore()

module.exports = {
  MemoryVectorStore,
  globalVectorStore,
}
