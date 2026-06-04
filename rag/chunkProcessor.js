const DEFAULT_CHUNK_SIZE = 900
const DEFAULT_OVERLAP = 140

function normalizeResource(resource = {}) {
  return {
    id: resource.id || resource.url || resource.title || `resource-${Date.now()}`,
    title: resource.title || resource.name || 'Learning material',
    type: resource.type || resource.kind || 'resource',
    source: resource.source || resource.url || resource.attachment_url || null,
    text: String(resource.text || resource.body || resource.instructions || resource.description || '').trim(),
    metadata: resource.metadata || {},
  }
}

function chunkText(text, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim()
  if (!normalized) return []
  const chunks = []
  let cursor = 0

  while (cursor < normalized.length) {
    const targetEnd = Math.min(cursor + chunkSize, normalized.length)
    const sentenceEnd = normalized.lastIndexOf('.', targetEnd)
    const end = sentenceEnd > cursor + chunkSize * 0.55 ? sentenceEnd + 1 : targetEnd
    chunks.push(normalized.slice(cursor, end).trim())
    cursor = Math.max(end - overlap, end)
  }

  return chunks.filter(Boolean)
}

function processResources(resources = [], options = {}) {
  return resources.flatMap((resource) => {
    const normalized = normalizeResource(resource)
    return chunkText(normalized.text, options.chunkSize, options.overlap).map((content, index) => ({
      id: `${normalized.id}::chunk-${index + 1}`,
      resourceId: normalized.id,
      title: normalized.title,
      type: normalized.type,
      source: normalized.source,
      content,
      ordinal: index + 1,
      metadata: normalized.metadata,
    }))
  })
}

module.exports = {
  chunkText,
  normalizeResource,
  processResources,
}
