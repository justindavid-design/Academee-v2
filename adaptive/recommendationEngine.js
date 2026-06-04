function buildAdaptiveRecommendations({ mastery = [], assignments = [], quizzes = [] }) {
  const weakConcepts = mastery.filter((item) => item.retentionRisk === 'high').slice(0, 5)
  return weakConcepts.map((item) => ({
    concept: item.concept,
    priority: item.mastery < 50 ? 'urgent' : 'recommended',
    rationale: `${item.concept} mastery is ${item.mastery}%, so the learner needs reinforcement before moving ahead.`,
    sequence: [
      { type: 'reviewer', title: `Review ${item.concept}`, source: findRelated(assignments, item.concept) },
      { type: 'flashcards', title: `${item.concept} recall cards`, source: null },
      { type: 'reinforcement_quiz', title: `${item.concept} check-in quiz`, source: findRelated(quizzes, item.concept) },
      { type: 'ai_tutor', title: `Ask the tutor about ${item.concept}`, source: null },
    ],
    teacherReviewRequired: true,
  }))
}

function findRelated(items, concept) {
  const related = items.find((item) => `${item.title || ''} ${item.description || ''} ${item.instructions || ''}`.toLowerCase().includes(concept))
  return related ? { id: related.id, title: related.title } : null
}

module.exports = {
  buildAdaptiveRecommendations,
  buildLearningPath({ masteryProfile = [], assignments = [], quizzes = [] }) {
    const recommendations = buildAdaptiveRecommendations({ mastery: masteryProfile, assignments, quizzes })
    return recommendations.length
      ? recommendations
      : [{
          concept: 'course foundations',
          priority: 'recommended',
          rationale: 'No high-risk concept was detected yet. Continue with the next published activity.',
          sequence: [
            { type: 'reviewer', title: 'Review current module notes', source: null },
            { type: 'quiz', title: 'Complete the next quiz', source: null },
          ],
          teacherReviewRequired: false,
        }]
  },
}
