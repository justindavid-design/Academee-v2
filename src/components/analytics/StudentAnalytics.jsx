import React from 'react'
import MasteryChart from './MasteryChart'

export default function StudentAnalytics({ analytics, className = '' }) {
  if (!analytics) return null

  return (
    <section className={`rounded-[28px] border border-token bg-surface p-5 shadow-[var(--shadow-card)] ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-subtle">Student analytics</p>
          <h3 className="mt-2 text-xl font-black text-main">Your strengths and growth areas</h3>
          <p className="mt-2 text-sm font-medium leading-6 text-muted">
            Mastery is based on the concepts in the quiz you just completed.
          </p>
        </div>
        <div className="rounded-2xl bg-surface-quiet px-4 py-3">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-subtle">Mastery</p>
          <p className="mt-1 text-2xl font-black text-main">{analytics.percentage || 0}%</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <MasteryChart
            label="Concept mastery"
            items={(analytics.masteryByConcept || []).map((item) => ({
              concept: item.concept,
              value: item.accuracy,
              label: item.concept,
            }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoList title="Strengths" items={analytics.strengths || []} emptyLabel="No strong concepts yet." />
            <InfoList title="Needs review" items={analytics.weaknesses || []} emptyLabel="No weak concepts detected." />
          </div>
        </div>

        <div className="grid gap-4">
          <TrendCard analytics={analytics} />
          <div className="rounded-2xl border border-token bg-surface-quiet p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-subtle">Recommended review</p>
            <div className="mt-3 space-y-3">
              {(analytics.reviewQueue || []).slice(0, 3).map((item) => (
                <div key={item.questionId} className="rounded-2xl border border-token bg-surface p-3">
                  <p className="text-sm font-semibold text-main line-clamp-2">{item.question}</p>
                  <p className="mt-1 text-xs font-medium leading-5 text-muted">{item.tip}</p>
                </div>
              ))}
              {!analytics.reviewQueue?.length ? <p className="text-sm text-muted">No review items yet.</p> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoList({ title, items = [], emptyLabel }) {
  return (
    <div className="rounded-2xl border border-token bg-surface-quiet p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-subtle">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length ? items.map((item) => (
          <span key={item.concept} className="inline-flex rounded-full border border-token bg-surface px-3 py-1.5 text-xs font-semibold text-main">
            {item.concept} {item.accuracy != null ? `${item.accuracy}%` : ''}
          </span>
        )) : <p className="text-sm text-muted">{emptyLabel}</p>}
      </div>
    </div>
  )
}

function TrendCard({ analytics }) {
  const attempts = Array.isArray(analytics.attempts) ? analytics.attempts : []

  return (
    <div className="rounded-2xl border border-token bg-surface-quiet p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-subtle">Performance trend</p>
      <div className="mt-3 space-y-2">
        {attempts.length ? attempts.slice(-5).map((attempt, index) => (
          <div key={`${attempt.timestamp || index}`} className="flex items-center gap-3">
            <span className="w-10 text-xs font-semibold text-subtle">#{index + 1}</span>
            <div className="h-2 flex-1 rounded-full bg-surface">
              <div className="h-full rounded-full bg-primary-token" style={{ width: `${Math.max(0, Math.min(100, attempt.percentage || 0))}%` }} />
            </div>
            <span className="w-10 text-right text-xs font-semibold text-main">{attempt.percentage || 0}%</span>
          </div>
        )) : <p className="text-sm text-muted">No attempt history yet.</p>}
      </div>
    </div>
  )
}
