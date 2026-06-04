import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckSquare, CircleDot, FilePenLine, ListChecks, ToggleLeft } from 'lucide-react'
import { quizTypes } from './quizTypes'
import logo from '../../assets/logo.png'

const icons = {
  'multiple-choice': CircleDot,
  'multi-select': CheckSquare,
  'true-false': ToggleLeft,
  'fill-blank': ListChecks,
  'open-ended': FilePenLine,
}

export default function QuizTypeSelector() {
  const navigate = useNavigate()
  const { courseId } = useParams()

  const chooseType = (typeId) => {
    navigate(`/dashboard/course/${courseId}/quiz/create?type=${typeId}`)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
            <img src={logo} alt="Academee" className="h-6 w-6 object-contain" />
            Academee
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <section className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Formal assessment</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">Select Quiz Type</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Choose the first question format for this quiz. You can add more question types later in the builder.
          </p>
        </section>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          {quizTypes.map((type) => {
            const Icon = icons[type.id] || CircleDot
            return (
              <motion.button
                key={type.id}
                type="button"
                onClick={() => chooseType(type.id)}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group min-h-[210px] rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-800">
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="mt-6 text-xl font-bold tracking-tight text-slate-950">{type.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{type.description}</p>
                <span className="mt-6 inline-flex text-sm font-semibold text-emerald-700 opacity-0 transition group-hover:opacity-100">
                  Start with this type
                </span>
              </motion.button>
            )
          })}
        </motion.div>
      </main>
    </div>
  )
}
