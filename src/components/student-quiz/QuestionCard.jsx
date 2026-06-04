import React from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon } from 'lucide-react'
import TextToSpeechButton from '../accessibility/TextToSpeechButton'

/**
 * QuestionCard - Displays quiz question with media support
 * Shows question text, optional image/media, question number
 * Smooth animations and clean typography
 */
export function QuestionCard({
  questionNumber = 1,
  totalQuestions = 1,
  text = '',
  imageUrl = null,
  mediaUrl = null,
  mediaType = null, // 'image', 'video', 'audio'
  hint = null,
  showHint = false,
  children = null,
}) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 w-full"
    >
      {/* Question number */}
      <motion.div variants={item} className="flex items-start justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Question {questionNumber}
          </span>
          <span className="text-xs text-slate-400">of {totalQuestions}</span>
        </div>
        <TextToSpeechButton
          compact
          label="Read question aloud"
          text={[text, hint ? `Hint: ${hint}` : '', mediaType ? `Media type: ${mediaType}` : '']}
          buttonClassName="shrink-0"
        />
      </motion.div>

      {/* Question text */}
      <motion.div variants={item}>
        <h2 className="text-2xl font-bold leading-snug text-slate-900" data-speech-label={`Question ${questionNumber}. ${text}`}>
          {text}
        </h2>
      </motion.div>

      {/* Media (image/video/audio) */}
      {(imageUrl || mediaUrl) && (
        <motion.div variants={item} className="relative">
          {mediaType === 'image' || imageUrl ? (
            <div className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 max-h-96">
              <img
                src={imageUrl || mediaUrl}
                alt="Question media"
                className="w-full h-auto object-contain"
                onError={(e) => {
                  e.target.src = '' // Hide broken image
                }}
              />
            </div>
          ) : mediaType === 'video' ? (
            <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video">
              <video
                src={mediaUrl}
                controls
                className="w-full h-full"
                style={{ backgroundColor: '#1e293b' }}
              />
            </div>
          ) : mediaType === 'audio' ? (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <audio
                src={mediaUrl}
                controls
                className="w-full"
              />
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-8 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
              <ImageIcon className="w-6 h-6" />
            </div>
          )}
        </motion.div>
      )}

      {/* Hint (if shown) */}
      {hint && showHint && (
        <motion.div
          variants={item}
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900"
        >
          <p className="font-medium">Hint:</p>
          <p className="mt-1">{hint}</p>
        </motion.div>
      )}

      {/* Answer options or children */}
      {children && <motion.div variants={item}>{children}</motion.div>}
    </motion.div>
  )
}
