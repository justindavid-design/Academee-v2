import React from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, Flame, ListChecks, Trophy } from 'lucide-react'

export default function StudyProgressTracker({ progress = 0, xp = 0, streak = 0, items = 0, gradient = 'from-cyan-400 to-blue-500' }) {
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0))

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[30px] bg-slate-950 p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12">
          <BadgeCheck className="h-6 w-6 text-cyan-300" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">Study progress</p>
          <p className="text-3xl font-black">{safeProgress}%</p>
        </div>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/12">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
        />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Metric icon={Trophy} label="XP" value={xp} />
        <Metric icon={Flame} label="Streak" value={streak} />
        <Metric icon={ListChecks} label="Items" value={items} />
      </div>
    </motion.section>
  )
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 px-2 py-3">
      <Icon className="mx-auto h-4 w-4 text-cyan-200" />
      <p className="mt-1 text-lg font-black">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">{label}</p>
    </div>
  )
}
