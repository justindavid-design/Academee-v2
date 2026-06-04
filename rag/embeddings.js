const DEFAULT_DIMENSIONS = 96

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function hashToken(token) {
  let hash = 2166136261
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

function createEmbedding(text, dimensions = DEFAULT_DIMENSIONS) {
  const vector = new Array(dimensions).fill(0)
  const tokens = normalizeText(text).split(' ').filter(Boolean)

  tokens.forEach((token, position) => {
    const hash = hashToken(token)
    const slot = hash % dimensions
    const sign = hash % 2 === 0 ? 1 : -1
    vector[slot] += sign * (1 + Math.min(token.length, 18) / 18)

    if (position > 0) {
      const bigramSlot = hashToken(`${tokens[position - 1]} ${token}`) % dimensions
      vector[bigramSlot] += 0.35
    }
  })

  return normalizeVector(vector)
}

function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1
  return vector.map((value) => value / magnitude)
}

function cosineSimilarity(a, b) {
  const length = Math.min(a.length, b.length)
  let score = 0
  for (let index = 0; index < length; index += 1) score += a[index] * b[index]
  return score
}

module.exports = {
  DEFAULT_DIMENSIONS,
  createEmbedding,
  cosineSimilarity,
  normalizeText,
}
