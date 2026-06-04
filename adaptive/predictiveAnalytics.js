function buildPredictiveInsights({ masteryProfile, progress = {}, submissions = [] }) {
  const insights = []
  const completion = Number(progress.course_completion_percentage || 0)
  const overdue = Number(progress.overdue_assignments || 0)
  const weak = masteryProfile.weakConcepts || []

  if (weak.length) {
    insights.push({
      type: 'concept-risk',
      severity: weak[0].mastery < 45 ? 'high' : 'medium',
      message: `Additional review is recommended for ${weak[0].concept}.`,
      supportiveAction: 'Offer a short reviewer, flashcards, or a guided practice quiz.',
    })
  }

  if (overdue > 0) {
    insights.push({
      type: 'completion',
      severity: 'medium',
      message: 'Some work is still pending, which may make upcoming topics harder.',
      supportiveAction: 'Encourage a small completion goal rather than a full catch-up session.',
    })
  }

  if (completion < 40 && submissions.length > 0) {
    insights.push({
      type: 'engagement',
      severity: 'medium',
      message: 'Learning activity has started, but course completion is still early.',
      supportiveAction: 'Recommend the next easiest item to build momentum.',
    })
  }

  if (!insights.length) {
    insights.push({
      type: 'steady-progress',
      severity: 'low',
      message: 'The current learning pattern looks steady.',
      supportiveAction: 'Keep recommending regular review and reflection.',
    })
  }

  return insights
}

module.exports = {
  buildPredictiveInsights,
}
