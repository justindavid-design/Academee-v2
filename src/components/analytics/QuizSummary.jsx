import React from 'react'
import { Award, BookOpen, Lightbulb, RotateCcw } from 'lucide-react'

function SummaryChip({ icon: Icon, label, value, tone = 'slate' }) {
  const tones = {
    slate: 'bg-surface-quiet text-main',
    green: 'bg-success-soft text-success-token',
    blue: 'bg-info-soft text-info-token',
    amber: 'bg-warning-soft text-warning-token',
  }

  return (
    <div className={`rounded-2xl border border-token p-4 ${tones[tone] || tones.slate}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <p className="mt-3 text-xl font-black text-main">{value}</p>
    </div>
  )
}

export default function QuizSummary({ analytics, passThreshold = 70, className = '' }) {
  if (!analytics) return null

  const passed = Number(analytics.percentage || 0) >= passThreshold
  const nextStep = passed
    ? 'Keep practicing harder variants to protect your mastery.'
    : 'Review the weak concepts and retake the quiz after a short study session.'

  return (
    <section className={`rounded-[28px] border border-token bg-surface p-5 shadow-[var(--shadow-card)] ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-subtle">Adaptive summary</p>
          <h3 className="mt-2 text-xl font-black text-main">{passed ? 'You are ready to move on' : 'A few concepts need review'}</h3>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted">{nextStep}</p>
        </div>
        <div className={`rounded-2xl px-4 py-3 text-right ${passed ? 'bg-success-soft text-success-token' : 'bg-warning-soft text-warning-token'}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.16em]">Score</p>
          <p className="mt-1 text-3xl font-black">{analytics.percentage || 0}%</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <SummaryChip icon={Award} label="Result" value={passed ? 'Passed' : 'Needs review'} tone={passed ? 'green' : 'amber'} />
        <SummaryChip icon={BookOpen} label="Mastery" value={`${analytics.masteredCount || 0}/${analytics.total || 0}`} tone="blue" />
        <SummaryChip icon={RotateCcw} label="Retry focus" value={analytics.weaknesses?.[0]?.concept || 'None'} tone="slate" />
        <SummaryChip icon={Lightbulb} label="Next tip" value={analytics.reviewQueue?.[0]?.tip || 'Keep going'} tone="green" />
      </div>
    </section>
  )
}
