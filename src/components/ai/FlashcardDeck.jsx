import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

export function FlashcardDeck({ cards = [], title = 'Flashcards', className = '' }) {
  const safeCards = useMemo(() => (Array.isArray(cards) ? cards : []), [cards])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (!safeCards.length) {
    return (
      <div className={`rounded-2xl border border-dashed border-token bg-surface p-6 text-center text-sm text-muted ${className}`}>
        No flashcards yet.
      </div>
    )
  }

  const card = safeCards[index]

  const next = () => {
    setFlipped(false)
    setIndex((current) => (current + 1) % safeCards.length)
  }

  const prev = () => {
    setFlipped(false)
    setIndex((current) => (current - 1 + safeCards.length) % safeCards.length)
  }

  return (
    <section className={`rounded-[28px] border border-token bg-surface p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-token">{title}</p>
          <p className="mt-1 text-sm text-muted">{index + 1} of {safeCards.length}</p>
        </div>
        <button
          type="button"
          onClick={() => setFlipped(false)}
          className="inline-flex items-center gap-2 rounded-xl border border-token bg-surface px-3 py-2 text-xs font-semibold text-main hover:bg-surface-alt"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="mt-5 min-h-[220px] w-full rounded-[28px] border border-token bg-surface-alt p-6 text-left transition hover:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/10"
        aria-pressed={flipped}
      >
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-subtle">{flipped ? 'Answer' : 'Question'}</p>
        <div className="mt-4 text-lg font-black text-main">{flipped ? card.back : card.front}</div>
        {card.conceptTags?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {card.conceptTags.map((tag) => (
              <span key={tag} className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-muted">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </button>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={prev} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-token bg-surface px-4 py-2.5 text-sm font-semibold text-main hover:bg-surface-alt">
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <button type="button" onClick={next} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-token px-4 py-2.5 text-sm font-black text-white hover:bg-primary-hover">
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  )
}

export default FlashcardDeck

