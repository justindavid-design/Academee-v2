import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

export function StudentCard({
  children,
  onClick,
  className = '',
  accent = 'slate',
  density = 'regular',
  role = onClick ? 'button' : undefined,
  tabIndex = onClick ? 0 : undefined,
  ariaLabel,
}) {
  const accents = {
    slate: 'border-token hover:border-subtle',
    emerald: 'border-success/20 hover:border-success/40',
    blue: 'border-info/20 hover:border-info/40',
    amber: 'border-warning/20 hover:border-warning/40',
    violet: 'border-primary/20 hover:border-primary/40',
  }

  const densityStyles = {
    compact: 'p-3.5',
    regular: 'p-4 sm:p-5',
    spacious: 'p-5 sm:p-6',
  }

  const classes = [
    'group relative overflow-hidden rounded-2xl border bg-surface shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition duration-200',
    'hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]',
    accents[accent] || accents.slate,
    densityStyles[density] || densityStyles.regular,
    onClick ? 'cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <motion.div whileHover={onClick ? { y: -2 } : undefined} transition={{ duration: 0.18 }} className="group">
      <div
        className={classes}
        onClick={onClick}
        role={role}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        onKeyDown={
          onClick
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onClick()
                }
              }
            : undefined
        }
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/5 to-transparent" />
        {children}
      </div>
    </motion.div>
  )
}

export function StudentSectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary-token">{eyebrow}</p> : null}
        <h2 className="mt-1 text-xl font-black tracking-tight text-main sm:text-2xl">{title}</h2>
        {description ? <p className="mt-1 text-sm font-medium leading-6 text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function StudentPill({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-surface-quiet text-muted',
    emerald: 'bg-success-soft text-success-token',
    blue: 'bg-info-soft text-info-token',
    amber: 'bg-warning-soft text-warning-token',
    violet: 'bg-primary-soft text-primary-token',
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  )
}

export function StudentMeta({ items = [] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
      {items.map((item, index) => (
        <span key={`${item.label || index}`} className="inline-flex items-center gap-1.5 rounded-full border border-token bg-surface-quiet px-2.5 py-1">
          {item.icon ? <item.icon className="h-3.5 w-3.5 text-subtle" /> : null}
          <span className={item.bold ? 'font-semibold text-main' : ''}>{item.label}</span>
        </span>
      ))}
    </div>
  )
}

export function StudentProgressBar({ value = 0, tone = 'emerald' }) {
  const colors = {
    emerald: 'bg-success-token',
    blue: 'bg-info-token',
    amber: 'bg-warning-token',
    violet: 'bg-primary-token',
    slate: 'bg-subtle',
  }

  const safeValue = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface-quiet" role="progressbar" aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all ${colors[tone] || colors.emerald}`} style={{ width: `${safeValue}%` }} />
    </div>
  )
}

export function StudentSectionCard({ title, description, action, children, className = '' }) {
  return (
    <section className={`rounded-[28px] border border-token bg-surface p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-6 ${className}`}>
      {(title || description || action) && <StudentSectionHeader title={title} description={description} action={action} />}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  )
}

export function StudentArrowLink({ children }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-token">
      {children}
      <ChevronRight className="h-4 w-4" />
    </span>
  )
}
