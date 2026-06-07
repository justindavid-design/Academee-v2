#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const quizPath = process.argv[2] || path.resolve(__dirname, '..', 'sample-quiz.json')

function loadQuiz(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch (err) {
    console.error('Failed to load quiz:', err.message)
    process.exit(1)
  }
}

function checkQuiz(quiz) {
  const questions = (quiz.meta && quiz.meta.questions) || []
  const report = []

  questions.forEach((q, i) => {
    const missing = []
    if (!q.explanation) missing.push('explanation')
    if (!q.trivia) missing.push('trivia')
    if (!q.learningTip && !q.learning_tip) missing.push('learningTip')

    report.push({ index: i, id: q.id || `q${i + 1}`, text: q.text || q.question || '', missing })
  })

  return report
}

const quiz = loadQuiz(quizPath)
const report = checkQuiz(quiz)

console.log(`Checked quiz: ${quiz.title || 'Untitled'}`)
report.forEach((item) => {
  if (item.missing.length === 0) {
    console.log(` - [OK] ${item.id}: ${item.text}`)
  } else {
    console.log(` - [MISSING] ${item.id}: ${item.text} -> missing: ${item.missing.join(', ')}`)
  }
})

const missingCount = report.filter((r) => r.missing.length > 0).length
console.log(`\nTotal questions: ${report.length}, missing feedback fields: ${missingCount}`)
