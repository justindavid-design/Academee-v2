import React from 'react'
import MasteryChart from './MasteryChart'

export default function TeacherAnalytics({ analytics, className = '' }) {
  if (!analytics) return null

  return (
    <section className={`rounded-[28px] border border-token bg-surface p-5 shadow-[var(--shadow-card)] ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-subtle">Teacher analytics</p>
          <h3 className="mt-2 text-xl font-black text-main">Quiz performance overview</h3>
          <p className="mt-2 text-sm font-medium leading-6 text-muted">
            Highlights the most difficult items, class mastery, and the concepts that need reteaching.
          </p>
        </div>
        <div className="rounded-2xl bg-surface-quiet px-4 py-3">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-subtle">Average</p>
          <p className="mt-1 text-2xl font-black text-main">{analytics.averageScore || 0}%</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Attempts" value={analytics.attemptCount || 0} />
            <Stat label="Completion" value={`${analytics.completionRate || 0}%`} />
            <Stat label="Hardest" value={analytics.hardestQuestion?.text || 'No data'} />
          </div>

          <div className="rounded-2xl border border-token bg-surface-quiet p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-subtle">Question accuracy</p>
            <div className="mt-3 grid gap-3">
              {(analytics.questionAccuracy || []).slice(0, 6).map((item) => (
                <div key={item.questionId} className="grid gap-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold text-main">
                    <span className="truncate">{item.text || item.questionId}</span>
                    <span>{item.accuracy}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-primary-token" style={{ width: `${Math.max(0, Math.min(100, item.accuracy || 0))}%` }} />
                  </div>
                </div>
              ))}
              {!analytics.questionAccuracy?.length ? <p className="text-sm text-muted">No question data yet.</p> : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-token bg-surface-quiet p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-subtle">Student rankings</p>
            <div className="mt-3 space-y-2">
              {analytics.rankings?.length ? analytics.rankings.map((student) => (
                <div key={`${student.name}-${student.rank}`} className="flex items-center justify-between gap-3 rounded-2xl border border-token bg-surface px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-main">#{student.rank} {student.name}</p>
                    <p className="text-xs text-muted">{student.score}/{student.total}</p>
                  </div>
                  <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success-token">{student.percentage}%</span>
                </div>
              )) : <p className="text-sm text-muted">No student attempts yet.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-token bg-surface-quiet p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-subtle">Weak concepts</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {analytics.weakConcepts?.length ? analytics.weakConcepts.map((item) => (
                <span key={item.concept} className="inline-flex rounded-full border border-token bg-surface px-3 py-1.5 text-xs font-semibold text-main">
                  {item.concept} {item.accuracy}%
                </span>
              )) : <p className="text-sm text-muted">No weak concepts detected.</p>}
            </div>
          </div>

          <MasteryChart
            label="Class concept accuracy"
            items={(analytics.weakConcepts || []).map((item) => ({
              concept: item.concept,
              value: item.accuracy,
            }))}
          />
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-token bg-surface p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className="mt-2 text-lg font-black text-main line-clamp-2">{value}</p>
    </div>
  )
}
