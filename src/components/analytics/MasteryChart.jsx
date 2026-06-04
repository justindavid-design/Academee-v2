import React from 'react'

export default function MasteryChart({ items = [], label = 'Mastery' }) {
  const safeItems = Array.isArray(items) ? items.slice(0, 8) : []

  if (!safeItems.length) {
    return (
      <div className="rounded-2xl border border-token bg-surface-quiet p-4 text-sm text-muted">
        No mastery data yet.
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {safeItems.map((item) => {
        const value = Math.max(0, Math.min(100, Number(item.value ?? item.accuracy ?? item.percentage) || 0))
        return (
          <div key={item.label || item.concept} className="grid gap-1.5">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-main">
              <span className="truncate">{item.label || item.concept}</span>
              <span>{value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-quiet" aria-hidden="true">
              <div className="h-full rounded-full bg-primary-token transition-all" style={{ width: `${value}%` }} />
            </div>
          </div>
        )
      })}
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">{label}</p>
    </div>
  )
}
