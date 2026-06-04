function createAIGovernanceRecord({ feature, actorId, courseId = null, generatedContent = null, requiresReview = true }) {
  return {
    id: `ai-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    feature,
    actorId,
    courseId,
    generatedAt: new Date().toISOString(),
    aiGenerated: true,
    requiresTeacherReview: requiresReview,
    autonomousDecision: false,
    contentPreview: generatedContent ? String(generatedContent).slice(0, 280) : null,
    policy: {
      transparency: 'AI-generated content must be visible to teachers and learners where used.',
      authority: 'Teachers approve grading, published materials, and learner-facing interventions.',
      supportOnly: 'Predictions and recommendations are supportive, not punitive.',
    },
  }
}

module.exports = {
  createAIGovernanceRecord,
}
