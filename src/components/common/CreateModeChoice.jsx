import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import logo from '../../assets/logo.png'

export default function CreateModeChoice({
  title,
  subtitle,
  backLabel = 'Back',
  onBack,
  onManual,
  onAi,
  manualLabel = 'Create on my own',
  aiLabel = 'Create with AI',
  manualDescription = 'Choose a type and build it yourself.',
  aiDescription = 'Jump into an AI-assisted creation flow.',
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> {backLabel}
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
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{subtitle}</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">{title}</h1>
        </section>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2"
        >
          <ChoiceCard
            icon={Sparkles}
            title={manualLabel}
            description={manualDescription}
            onClick={onManual}
            tone="emerald"
          />
          <ChoiceCard
            icon={Sparkles}
            title={aiLabel}
            description={aiDescription}
            onClick={onAi}
            tone="cyan"
          />
        </motion.div>
      </main>
    </div>
  )
}

function ChoiceCard({ icon: Icon, title, description, onClick, tone }) {
  const toneClasses = tone === 'cyan'
    ? 'border-cyan-200 bg-cyan-50/60 hover:border-cyan-300 hover:bg-cyan-50 focus-visible:ring-cyan-100'
    : 'border-emerald-200 bg-emerald-50/60 hover:border-emerald-300 hover:bg-emerald-50 focus-visible:ring-emerald-100'

  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`group min-h-[220px] rounded-3xl border p-6 text-left shadow-sm transition focus:outline-none focus-visible:ring-4 ${toneClasses}`}
    >
      <span className={`grid h-14 w-14 place-items-center rounded-2xl border bg-white text-slate-700 transition ${tone === 'cyan' ? 'border-cyan-200 group-hover:text-cyan-800' : 'border-emerald-200 group-hover:text-emerald-800'}`}>
        <Icon className="h-7 w-7" />
      </span>
      <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      <span className={`mt-6 inline-flex text-sm font-semibold opacity-0 transition group-hover:opacity-100 ${tone === 'cyan' ? 'text-cyan-700' : 'text-emerald-700'}`}>
        Continue
      </span>
    </motion.button>
  )
}
