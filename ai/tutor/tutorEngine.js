const { buildCourseCorpus } = require('./chunkLessonContent')
const { searchCourseContent } = require('./vectorSearch')
const { generateTutorResponse } = require('./generateTutorResponse')

function answerCourseQuestion({ question, course, modules, assignments, quizzes, announcements }) {
  const corpus = buildCourseCorpus({ course, modules, assignments, quizzes, announcements })
  const sources = searchCourseContent(question, corpus)
  return generateTutorResponse(question, sources)
}

module.exports = {
  answerCourseQuestion,
}
