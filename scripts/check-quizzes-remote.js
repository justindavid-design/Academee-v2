#!/usr/bin/env node
const https = require('https')
const http = require('http')
const url = require('url')
const { execSync } = require('child_process')

const endpoint = process.argv[2] || 'http://localhost:3000/api/courses/1/quizzes'

function fetchJson(u) {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(u)
    const lib = parsed.protocol === 'https:' ? https : http
    const req = lib.get(u, (res) => {
      let body = ''
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch (e) {
          reject(e)
        }
      })
    })
    req.on('error', reject)
  })
}

function checkQuizFields(quiz) {
  const qlist = (quiz.meta && quiz.meta.questions) || []
  return qlist.map((q, i) => {
    const missing = []
    if (!q.explanation) missing.push('explanation')
    if (!q.trivia) missing.push('trivia')
    if (!q.learningTip) missing.push('learningTip')
    return { index: i, id: q.id || `q${i+1}`, missing }
  })
}

async function main() {
  try {
    console.log('Fetching quizzes from', endpoint)
    const quizzes = await fetchJson(endpoint)
    if (!Array.isArray(quizzes)) {
      console.error('Expected array of quizzes from endpoint')
      process.exit(2)
    }

    quizzes.forEach((quiz) => {
      console.log('\nQuiz:', quiz.title || quiz.id)
      const report = checkQuizFields(quiz)
      report.forEach((r) => {
        if (r.missing.length === 0) console.log(` - OK ${r.id}`)
        else console.log(` - MISSING ${r.id}: ${r.missing.join(', ')}`)
      })
    })
  } catch (err) {
    console.error('Failed to fetch quizzes:', err.message)
    process.exit(1)
  }
}

main()
