const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'what', 'when', 'where', 'which',
  'your', 'their', 'there', 'have', 'will', 'would', 'could', 'should', 'about', 'into',
  'after', 'before', 'using', 'used', 'course', 'lesson', 'module', 'assignment', 'quiz',
  'reviewer', 'student', 'teacher', 'material', 'activity', 'question', 'answer',
])

function normalizeText(value) {
  if (!value) return ''
  if (typeof value === 'object') {
    try {
      const parsedText = value.text || value.body || value.note || value.description || ''
      return String(parsedText).replace(/\s+/g, ' ').trim()
    } catch (_err) {
      return ''
    }
  }
  const raw = String(value)
  try {
    const parsed = JSON.parse(raw)
    return normalizeText(parsed)
  } catch (_err) {
    return raw.replace(/\s+/g, ' ').trim()
  }
}

function getKeywords(value, limit = 8) {
  const counts = {}
  const words = normalizeText(value).toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) || []
  words.forEach((word) => {
    if (STOP_WORDS.has(word)) return
    counts[word] = (counts[word] || 0) + 1
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word)
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number(value) || 0))
}

function toSourceRecord({ id, type, title, body, created_at, due_at }) {
  const text = normalizeText(body)
  return {
    id: String(id || `${type}-${title}`),
    type,
    title: normalizeText(title) || type,
    text,
    created_at: created_at || null,
    due_at: due_at || null,
    keywords: getKeywords(`${title} ${text}`, 10),
  }
}

module.exports = {
  clamp,
  getKeywords,
  normalizeText,
  toSourceRecord,
}
