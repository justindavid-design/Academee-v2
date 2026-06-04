const DEFAULT_PROVIDER = process.env.ACADEMEE_AI_PROVIDER || 'local'

function createProvider(providerName = DEFAULT_PROVIDER) {
  if (providerName === 'ollama') return createOllamaProvider()
  return createLocalProvider()
}

function createLocalProvider() {
  return {
    name: 'local',
    mode: 'offline-ready',
    async complete({ prompt, context = [] }) {
      const contextText = context.map((item) => item.content || item.text || '').join(' ')
      return buildExtractiveResponse(prompt, contextText)
    },
  }
}

function createOllamaProvider() {
  return {
    name: 'ollama',
    mode: 'self-hosted',
    endpoint: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.1',
    async complete({ prompt, context = [] }) {
      return createLocalProvider().complete({ prompt, context })
    },
  }
}

function buildExtractiveResponse(prompt, contextText) {
  const sentences = String(contextText || '')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
  const keywords = String(prompt || '')
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3)
  const scored = sentences
    .map((sentence) => ({
      sentence,
      score: keywords.reduce((sum, word) => sum + (sentence.toLowerCase().includes(word) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.sentence)

  if (!scored.length) {
    return 'I could not find enough course context to answer confidently. Ask your instructor to attach more lesson materials, or try a more specific question.'
  }

  return scored.join(' ')
}

module.exports = {
  createProvider,
}
