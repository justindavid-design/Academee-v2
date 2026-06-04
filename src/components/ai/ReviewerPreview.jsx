import React from 'react'

export function ReviewerPreview({ items = [], className = '' }) {
  if (!items.length) {
    return (
      <div className={`rounded-2xl border border-dashed border-token bg-surface p-6 text-sm text-muted ${className}`}>
        No reviewer items yet.
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <article key={item.id} className="rounded-2xl border border-token bg-surface p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-surface-alt px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-main">
              {item.title || 'Item'}
            </span>
            {item.tags ? <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-muted">{item.tags}</span> : null}
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-main">{item.prompt}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
          {item.hint ? <p className="mt-2 text-xs font-semibold leading-5 text-subtle">Hint: {item.hint}</p> : null}
        </article>
      ))}
    </div>
  )
}

export default ReviewerPreview

