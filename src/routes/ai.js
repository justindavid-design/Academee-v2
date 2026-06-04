const express = require('express')
const { generateQuizFeedback } = require('../services/groqService')

const router = express.Router()

router.post('/quiz-feedback', async (req, res) => {
  try {
    const body = req.body || {}

    if (!body.question) {
      return res.status(400).json({
        success: false,
        error: 'question is required',
      })
    }

    const feedback = await generateQuizFeedback(body)

    return res.status(200).json({
      success: true,
      feedback,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Unable to generate quiz feedback',
    })
  }
})

module.exports = router
