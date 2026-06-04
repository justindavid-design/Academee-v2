import React from 'react'
import { Sparkles, Brain, Wand2 } from 'lucide-react'

export default function AIWorkflowPanel({
  title = 'AI Learning Tools',
  description = 'Generate reviewers, quizzes, and study aids from your lesson materials.',
  onGenerateQuiz,
  onGenerateReviewer,
  onGenerateFlashcards,
  onGenerateRecommendations,
  recommendations = [],
  className = '',
}) {
  return (
    <section className={`rounded-[28px] border border-token bg-surface p-5 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-token">Phase 2 AI</p>
          <h2 className="mt-1 text-xl font-black text-main">{title}</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-muted">{description}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-surface-alt text-primary-token">
          <Brain className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <ActionButton label="Generate reviewer" icon={Sparkles} onClick={onGenerateReviewer} />
        <ActionButton label="Generate quiz" icon={Wand2} onClick={onGenerateQuiz} />
        <ActionButton label="Generate flashcards" icon={Brain} onClick={onGenerateFlashcards} />
        <ActionButton label="Refresh recommendations" icon={Sparkles} onClick={onGenerateRecommendations} />
      </div>

      {recommendations.length ? (
        <div className="mt-5 grid gap-3">
          {recommendations.slice(0, 3).map((item) => (
            <div key={item.concept || item.message} className="rounded-2xl border border-token bg-surface-alt p-4">
              <p className="text-sm font-black text-main">{item.concept || 'Insight'}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{item.message || item.summary || item.detail}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function ActionButton({ label, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-token bg-surface px-4 py-3 text-sm font-semibold text-main transition hover:bg-surface-alt"
    >
      {Icon ? <Icon className="h-4 w-4 text-primary-token" /> : null}
      {label}
    </button>
  )
}

