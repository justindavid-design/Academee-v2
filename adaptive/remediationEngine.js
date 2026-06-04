function buildRemediationPlan(masteryProfile) {
  const weakConcepts = masteryProfile.weakConcepts || []

  if (!weakConcepts.length) {
    return [{
      concept: 'maintenance',
      title: 'Keep mastery warm',
      strategy: 'Use spaced review twice this week to protect current progress.',
      format: 'reviewer',
      accessibilityTip: 'Use text-to-speech or larger text if long review sessions feel tiring.',
    }]
  }

  return weakConcepts.slice(0, 4).map((concept) => ({
    concept: concept.concept,
    title: `Rebuild confidence in ${concept.concept}`,
    strategy: concept.mastery < 45
      ? 'Start with simplified notes, then use flashcards before a practice quiz.'
      : 'Use a short mixed reviewer and one applied question.',
    format: concept.mastery < 45 ? 'flashcards + notes' : 'practice quiz',
    accessibilityTip: 'Offer a simplified explanation and let the learner reveal hints before answers.',
  }))
}

module.exports = {
  buildRemediationPlan,
}
