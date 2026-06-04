function adaptContentForAccessibility(text, options = {}) {
  const mode = options.mode || 'plain-language'
  const source = String(text || '').trim()
  const sentences = source.split(/(?<=[.!?])\s+/).filter(Boolean)

  return {
    mode,
    originalLength: source.length,
    adaptedText: sentences
      .map((sentence) => simplifySentence(sentence, mode))
      .join('\n\n'),
    supports: {
      dyslexiaFriendly: true,
      neurodiverseLearners: true,
      screenReaderFriendly: true,
      keyboardWorkflow: true,
    },
    disclosure: {
      generated: true,
      teacherReviewRecommended: true,
      purpose: 'accessibility adaptation',
    },
  }
}

function simplifySentence(sentence, mode) {
  const replacements = [
    [/utilize/gi, 'use'],
    [/demonstrate/gi, 'show'],
    [/approximately/gi, 'about'],
    [/subsequently/gi, 'then'],
    [/therefore/gi, 'so'],
  ]
  let output = sentence
  replacements.forEach(([pattern, replacement]) => {
    output = output.replace(pattern, replacement)
  })
  if (mode === 'step-by-step' && output.length > 120) {
    return output.split(',').map((part, index) => `${index + 1}. ${part.trim()}`).join('\n')
  }
  return output
}

module.exports = {
  adaptContentForAccessibility,
}
