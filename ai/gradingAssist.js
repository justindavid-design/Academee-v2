function suggestShortAnswerFeedback({ prompt, answer, rubric = '' }) {
  const answerText = String(answer || '').trim()
  const rubricTerms = String(rubric || prompt || '')
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 4)
  const matched = rubricTerms.filter((term) => answerText.toLowerCase().includes(term))
  const coverage = rubricTerms.length ? matched.length / rubricTerms.length : answerText.length > 20 ? 0.65 : 0.25

  return {
    suggestedScoreBand: coverage >= 0.75 ? 'strong' : coverage >= 0.45 ? 'partial' : 'needs-review',
    confidence: Number(Math.min(0.9, 0.35 + coverage).toFixed(2)),
    feedbackSuggestion: buildFeedback(coverage),
    rubricAlignment: {
      matchedTerms: matched.slice(0, 8),
      missingSignals: rubricTerms.filter((term) => !matched.includes(term)).slice(0, 8),
    },
    governance: {
      aiGenerated: true,
      teacherApprovalRequired: true,
      autonomousGrading: false,
      explanation: 'This is a grading suggestion only. The teacher remains the final evaluator.',
    },
  }
}

function buildFeedback(coverage) {
  if (coverage >= 0.75) return 'The response appears aligned with the expected reasoning. Consider confirming accuracy and adding concise praise.'
  if (coverage >= 0.45) return 'The response shows partial understanding. Consider asking the learner to clarify the missing concept or evidence.'
  return 'The response may need more support. Consider giving targeted feedback and a concrete next step for revision.'
}

module.exports = {
  suggestShortAnswerFeedback,
}
