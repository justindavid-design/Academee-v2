function extractConcepts(text, limit = 8) {
  const stopwords = new Set(['this', 'that', 'with', 'from', 'have', 'will', 'your', 'about', 'lesson', 'quiz', 'assignment'])
  const counts = new Map()
  String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 4 && !stopwords.has(word))
    .forEach((word) => counts.set(word, (counts.get(word) || 0) + 1))

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([concept]) => concept)
}

function buildMasteryProfile({ assignments = [], quizzes = [], submissions = [] }) {
  const conceptMap = new Map()
  const learningItems = [...assignments, ...quizzes]

  learningItems.forEach((item) => {
    const concepts = extractConcepts(`${item.title || ''} ${item.description || ''} ${item.instructions || ''}`)
    const itemSubmissions = submissions.filter((submission) => String(submission.assignment_id) === String(item.id || item.assignment_id))
    const averageScore = itemSubmissions.length
      ? itemSubmissions.reduce((sum, submission) => sum + Number(submission.score || 0), 0) / itemSubmissions.length
      : null

    concepts.forEach((concept) => {
      const current = conceptMap.get(concept) || { concept, attempts: 0, scoreTotal: 0, evidence: [] }
      current.attempts += itemSubmissions.length || 1
      current.scoreTotal += averageScore == null ? 0 : averageScore
      current.evidence.push({ itemId: item.id, title: item.title, averageScore })
      conceptMap.set(concept, current)
    })
  })

  return Array.from(conceptMap.values()).map((entry) => {
    const mastery = entry.attempts ? Math.round(entry.scoreTotal / entry.attempts) : 0
    return {
      concept: entry.concept,
      mastery,
      retentionRisk: mastery && mastery < 70 ? 'high' : mastery < 85 ? 'medium' : 'low',
      nextReviewAt: computeNextReviewDate(mastery),
      evidence: entry.evidence.slice(0, 5),
    }
  }).sort((a, b) => a.mastery - b.mastery)
}

function computeNextReviewDate(mastery) {
  const days = mastery >= 85 ? 14 : mastery >= 70 ? 7 : 2
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

module.exports = {
  buildMasteryProfile,
  extractConcepts,
}
