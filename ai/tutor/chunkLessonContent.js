const { normalizeText, toSourceRecord } = require('../../adaptive/contentUtils')

function chunkText(text, size = 520) {
  const clean = normalizeText(text)
  if (!clean) return []
  const sentences = clean.match(/[^.!?]+[.!?]*/g) || [clean]
  const chunks = []
  let current = ''

  sentences.forEach((sentence) => {
    if ((current + sentence).length > size && current) {
      chunks.push(current.trim())
      current = sentence
    } else {
      current += ` ${sentence}`
    }
  })

  if (current.trim()) chunks.push(current.trim())
  return chunks
}

function buildCourseCorpus({ course, modules = [], assignments = [], quizzes = [], announcements = [] }) {
  const sources = []
  if (course) sources.push(toSourceRecord({ id: course.id, type: 'course', title: course.title, body: course.description }))
  modules.forEach((item) => sources.push(toSourceRecord({ id: item.id, type: 'module', title: item.title, body: item.description, created_at: item.created_at })))
  assignments.forEach((item) => sources.push(toSourceRecord({ id: item.id, type: 'assignment', title: item.title, body: item.instructions, created_at: item.created_at, due_at: item.due_at })))
  quizzes.forEach((item) => sources.push(toSourceRecord({ id: item.id, type: 'quiz', title: item.title, body: item.description || JSON.stringify(item.questions || []), created_at: item.created_at })))
  announcements.forEach((item) => sources.push(toSourceRecord({ id: item.id, type: 'announcement', title: item.title, body: item.body, created_at: item.created_at })))

  return sources.flatMap((source) => {
    const chunks = chunkText(`${source.title}. ${source.text}`)
    return chunks.map((text, index) => ({
      ...source,
      chunkId: `${source.type}-${source.id}-${index}`,
      text,
    }))
  })
}

module.exports = {
  buildCourseCorpus,
  chunkText,
}
