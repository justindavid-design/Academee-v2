import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Shuffle } from 'lucide-react'

export default function MatchingGame({ pairs = [] }) {
  const [selectedTerm, setSelectedTerm] = useState('')
  const [matches, setMatches] = useState({})

  const terms = useMemo(() => pairs.map((pair) => pair.left), [pairs])
  const definitions = useMemo(() => [...pairs].sort((a, b) => a.right.localeCompare(b.right)), [pairs])
  const completed = Object.keys(matches).length

  const chooseDefinition = (definition) => {
    if (!selectedTerm) return
    setMatches((current) => ({ ...current, [selectedTerm]: definition }))
    setSelectedTerm('')
  }

  return (
    <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/60 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-emerald-950">Match the pairs</h3>
          <p className="text-xs font-bold text-emerald-700">Tap a term, then tap its definition.</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700 shadow-sm">
          <Shuffle className="h-3.5 w-3.5" /> {completed}/{pairs.length}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          {terms.map((term) => {
            const isSelected = selectedTerm === term
            const isMatched = matches[term]
            return (
              <motion.button
                key={term}
                type="button"
                whileHover={{ scale: 1.015 }}
                onClick={() => setSelectedTerm(term)}
                className={`rounded-2xl border p-4 text-left text-sm font-black transition ${
                  isMatched ? 'border-emerald-300 bg-white text-emerald-900' : isSelected ? 'border-emerald-500 bg-white text-emerald-950 ring-4 ring-emerald-100' : 'border-white bg-white/80 text-slate-700 hover:bg-white'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  {term}
                  {isMatched ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : null}
                </span>
                {isMatched ? <span className="mt-1 block text-xs font-bold text-emerald-600">Matched to: {isMatched}</span> : null}
              </motion.button>
            )
          })}
        </div>
        <div className="grid gap-2">
          {definitions.map((pair) => (
            <motion.button
              key={pair.right}
              type="button"
              whileHover={{ scale: 1.015 }}
              onClick={() => chooseDefinition(pair.right)}
              className="rounded-2xl border border-white bg-white/86 p-4 text-left text-sm font-black text-slate-700 transition hover:bg-white hover:text-emerald-800"
            >
              {pair.right}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
