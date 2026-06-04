import { normalizeText } from './shared'

export function generateRecommendations({ mastery = [], weakConcepts = [], materials = [], analytics = {} } = {}) {
  const weak = Array.isArray(weakConcepts) && weakConcepts.length ? weakConcepts : (Array.isArray(mastery) ? mastery.filter((item) => Number(item.accuracy || item.value || 0) < 70) : [])
  const topWeak = weak.slice(0, 4)

  const reviewer = materials.find((item) => /reviewer|study|flashcard|notes/i.test(String(item.title || item.name || '')))
  const quiz = materials.find((item) => /quiz|practice|assessment/i.test(String(item.title || item.name || '')))

  const recommendations = topWeak.map((item) => ({
    concept: item.concept || item.label || item.name,
    message: `You may need additional practice in ${item.concept || item.label || 'this area'}.`,
  }))

  const insights = []
  if (analytics.averageScore != null) {
    insights.push(
      analytics.averageScore >= 85
        ? 'You are showing strong mastery overall. Keep reviewing weaker concepts to maintain momentum.'
        : analytics.averageScore >= 70
          ? 'You are making good progress. Focus on the concepts you miss most often.'
          : 'A short review session on the weak concepts will likely help before the next assessment.'
    )
  }

  return {
    summary: normalizeText(
      recommendations.length
        ? `Recommended reviewer: ${reviewer?.title || 'Review Set'}${quiz ? ` and quiz: ${quiz.title || 'Practice Quiz'}` : ''}.`
        : 'No major weak areas detected yet. Keep using mixed review sessions.'
    ),
    insights,
    recommendations,
    nextMaterials: [reviewer, quiz].filter(Boolean).slice(0, 2),
  }
}

export default generateRecommendations

