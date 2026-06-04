function chooseDifficulty({ mastery = 50, recentAccuracy = null, responseTimeSeconds = null }) {
  const accuracy = recentAccuracy === null || recentAccuracy === undefined ? mastery : recentAccuracy
  const slowResponse = Number(responseTimeSeconds) > 90

  if (mastery < 45 || accuracy < 50) {
    return {
      level: 'Beginner',
      reinforcement: 'high',
      rationale: 'Use simpler items and more feedback until the learner feels steady.',
    }
  }

  if (mastery >= 80 && accuracy >= 75 && !slowResponse) {
    return {
      level: 'Advanced',
      reinforcement: 'low',
      rationale: 'The learner is ready for challenge questions and transfer tasks.',
    }
  }

  if (mastery >= 60) {
    return {
      level: 'Intermediate',
      reinforcement: slowResponse ? 'medium' : 'balanced',
      rationale: slowResponse
        ? 'Keep difficulty moderate and add time-friendly practice.'
        : 'Use mixed practice with occasional stretch questions.',
    }
  }

  return {
    level: 'Adaptive',
    reinforcement: 'medium',
    rationale: 'Alternate guided review with short checks to build confidence.',
  }
}

function buildDifficultyPlan(masteryProfile) {
  const lowest = masteryProfile.weakConcepts?.[0] || masteryProfile.developingConcepts?.[0] || { mastery: masteryProfile.averageMastery || 50 }
  return chooseDifficulty({ mastery: lowest.mastery })
}

module.exports = {
  buildDifficultyPlan,
  chooseDifficulty,
}
