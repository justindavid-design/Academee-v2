import React from 'react'
import { AlertCircle, CheckCircle2, FileText, RotateCcw } from 'lucide-react'
import { getSubmissionStatusMeta } from '../../lib/submissionStatus.js'

/**
 * Renders submission status badges with appropriate styling and icons.
 */
export function SubmissionStatusBadge({ status, isOverdue = false, score = null }) {
  const meta = getSubmissionStatusMeta(status || (isOverdue ? 'late' : 'draft'))
  const config = {
    draft: {
      icon: FileText,
      label: meta.label,
      tone: 'bg-surface-quiet text-muted border-token',
    },
    submitted: {
      icon: CheckCircle2,
      label: meta.label,
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    late: {
      icon: AlertCircle,
      label: meta.label,
      tone: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    graded: {
      icon: CheckCircle2,
      label: score !== null ? `${meta.label} · ${score}` : meta.label,
      tone: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    returned: {
      icon: RotateCcw,
      label: meta.label,
      tone: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    missing: {
      icon: AlertCircle,
      label: meta.label,
      tone: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  }[status] || (isOverdue ? {
    icon: AlertCircle,
    label: 'Late',
    tone: 'bg-amber-50 text-amber-800 border-amber-200',
  } : {
    icon: FileText,
    label: meta.label,
    tone: 'bg-surface-quiet text-muted border-token',
  })
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${config.tone}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </div>
  )
}

export default SubmissionStatusBadge
