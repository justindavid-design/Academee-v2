import React from 'react'
import { Calendar, Clock } from 'lucide-react'
import { FileAttachmentList } from '../common/FileAttachmentCard'
import { parseContentWithAttachments } from '../../lib/fileUtils'

function StatusBadge({ submittedAt, dueAt }) {
  if (!submittedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">
        <Clock className="h-3.5 w-3.5" />
        Not submitted
      </span>
    )
  }

  const isLate = dueAt && new Date(submittedAt) > new Date(dueAt)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${isLate ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
      {isLate ? 'Late submission' : 'Submitted'}
    </span>
  )
}

export default function SubmissionContent({ submission, dueAt }) {
  const content = parseContentWithAttachments(submission?.content)
  const submittedAt = content.submittedAt || submission?.submitted_at

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusBadge submittedAt={submittedAt} dueAt={dueAt} />
        {submittedAt ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(submittedAt).toLocaleString()}
          </span>
        ) : null}
      </div>

      {content.text ? (
        <div className="rounded-2xl border border-blue-100 bg-white p-3">
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">Student note</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-700">{content.text}</p>
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">Attachments</p>
        <FileAttachmentList files={content.files} emptyLabel="No files attached to this submission." />
      </div>
    </div>
  )
}
