import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Gamepad2,
  Layers,
  NotebookPen,
  PencilLine,
  Shuffle,
  Sparkles,
  ToggleLeft,
} from 'lucide-react'
import { reviewerTypes } from './reviewerTypes'

const icons = {
  ClipboardCheck,
  Gamepad2,
  Layers,
  NotebookPen,
  PencilLine,
  Shuffle,
  Sparkles,
  ToggleLeft,
}

export default function ReviewerTypeSelector() {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [selected, setSelected] = useState('')

  const chooseType = (typeId) => {
    setSelected(typeId)
    setTimeout(() => {
      const base = courseId ? `/dashboard/course/${courseId}/reviewer/create` : '/quiz-maker'
      navigate(`${base}?type=${typeId}`)
    }, 260)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f8fbff] text-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -left-28 top-20 h-80 w-80 rounded-full bg-cyan-200/55 blur-3xl"
          animate={{ x: [0, 36, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity }}
        />
        <motion.div
          className="absolute right-0 top-8 h-96 w-96 rounded-full bg-pink-200/50 blur-3xl"
          animate={{ x: [0, -42, 0], y: [0, 28, 0] }}
          transition={{ duration: 16, repeat: Infinity }}
        />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-lime-200/45 blur-3xl" />
      </div>

      <header className="sticky top-0 z-10 border-b border-white/80 bg-white/72 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-x-1 hover:border-slate-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Create Reviewer</p>
            <h1 className="text-lg font-black text-slate-950 sm:text-2xl">Pick a study mode</h1>
          </div>
          <div className="hidden w-[86px] sm:block" />
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Make reviewing feel like play.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
            Choose a format, then build a fast, interactive study experience your class can repeat, master, and enjoy.
          </p>
        </motion.section>

        <motion.div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.055 } },
          }}
        >
          {reviewerTypes.map((type) => {
            const Icon = icons[type.icon] || Sparkles
            const isSelected = selected === type.id

            return (
              <motion.button
                key={type.id}
                type="button"
                onClick={() => chooseType(type.id)}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.96 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                whileHover={{ y: -8, scale: 1.025 }}
                whileTap={{ scale: 0.97 }}
                className="group relative min-h-[250px] overflow-hidden rounded-[28px] border border-white/90 bg-white p-5 text-left shadow-[0_24px_70px_rgba(15,23,42,0.10)] outline-none transition focus-visible:ring-4 focus-visible:ring-cyan-200"
              >
                <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${type.gradient}`} />
                <div className={`absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br ${type.gradient} opacity-20 blur-2xl transition group-hover:opacity-35`} />
                {isSelected ? (
                  <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white shadow-lg">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                ) : null}

                <span className={`grid h-14 w-14 place-items-center rounded-2xl border ${type.accent}`}>
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-950">{type.title}</h3>
                <p className="mt-2 text-sm font-black text-slate-500">{type.description}</p>
                <p className="mt-5 text-sm font-semibold leading-6 text-slate-600">{type.longDescription}</p>
                <span className="mt-6 inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white opacity-0 transition group-hover:opacity-100">
                  Start building
                </span>
              </motion.button>
            )
          })}
        </motion.div>
      </main>
    </div>
  )
}
