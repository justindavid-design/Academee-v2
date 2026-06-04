import React, { useState } from 'react'
import { FileText, Download, Eye, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import FilePreviewModal from './FilePreviewModal'
import { StudentCard, StudentMeta, StudentPill } from '../student/StudentSurface'
import TextToSpeechButton from '../accessibility/TextToSpeechButton'
import { getSubmissionStatus } from '../../lib/submissionStatus'

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

function getFileType(filename) {
  if (!filename) return { emoji: '📎', type: 'File' }

  const ext = filename.split('.').pop().toLowerCase()
  const types = {
    pdf: { emoji: '📄', type: 'PDF' },
    doc: { emoji: '📝', type: 'Word' },
    docx: { emoji: '📝', type: 'Word' },
    txt: { emoji: '📄', type: 'Text' },
    xlsx: { emoji: '📊', type: 'Excel' },
    pptx: { emoji: '🎬', type: 'PowerPoint' },
    jpg: { emoji: '🖼️', type: 'Image' },
    jpeg: { emoji: '🖼️', type: 'Image' },
    png: { emoji: '🖼️', type: 'Image' },
    gif: { emoji: '🖼️', type: 'Image' },
    js: { emoji: '💛', type: 'JavaScript' },
    jsx: { emoji: '⚛️', type: 'React' },
    py: { emoji: '🐍', type: 'Python' },
    json: { emoji: '{}', type: 'JSON' },
    zip: { emoji: '📦', type: 'ZIP' },
  }
  return types[ext] || { emoji: '📎', type: 'File' }
}

function SubmissionStatusCard({ submission, dueAt }) {
  const status = getSubmissionStatus(submission, dueAt)
  const submitted = ['submitted', 'late', 'graded', 'returned'].includes(status)
  const isLate = status === 'late'
  const hasGrade = submission.score !== null && submission.score !== undefined
  const hasFeedback = submission.feedback && submission.feedback.trim()
  const readAloud = [
    submitted ? 'Your work is on file.' : 'No submission yet.',
    submitted && submission.submitted_at ? `Submitted ${new Date(submission.submitted_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}.` : '',
    hasGrade ? `Grade ${submission.score}.` : '',
    hasFeedback ? `Teacher feedback: ${submission.feedback}` : '',
  ].filter(Boolean).join(' ')

  let label = 'Draft'
  let tone = 'slate'
  if (submitted) {
    label = isLate ? 'Late' : status === 'graded' ? 'Graded' : status === 'returned' ? 'Returned' : 'Submitted'
    tone = isLate ? 'amber' : 'emerald'
  }
  if (hasGrade) {
    label = 'Graded'
    tone = 'emerald'
  }

  return (
    <StudentCard className="bg-[#fbfdfb]" accent={tone} density="regular">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7f8b82]">Submission status</p>
          <div className="mt-2 flex items-center gap-2">
            <h3 className="text-lg font-semibold text-[#17251d]">{submitted ? 'Your work is on file' : 'Waiting for submission'}</h3>
            <StudentPill tone={tone}>{label}</StudentPill>
          </div>
          {submitted ? (
            <p className="mt-2 text-sm text-[#66776d]">
              Submitted {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'recently'}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[#66776d]">Your draft will appear here once you send the assignment.</p>
          )}
        </div>
        <TextToSpeechButton compact label="Read submission status" text={readAloud} />
        <div className={`grid h-14 w-14 place-items-center rounded-2xl ${tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
          {submitted ? <CheckCircle size={26} /> : <Clock size={26} />}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {hasGrade ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Grade</p>
            <p className="mt-2 text-3xl font-black text-emerald-700">{submission.score}</p>
          </div>
        ) : null}

        {hasFeedback ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7f8b82]">Teacher feedback</p>
            <p className="mt-2 text-sm leading-6 text-[#17251d] whitespace-pre-wrap">{submission.feedback}</p>
          </div>
        ) : null}
      </div>
    </StudentCard>
  )
}

function SubmissionFileCard({ file, onDownload, onPreview }) {
  const fileType = getFileType(file.name || file.filename)
  const filename = file.name || file.filename

  return (
    <StudentCard density="compact" onClick={() => onPreview?.(file)} ariaLabel={`Preview ${filename}`}>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-lg">
          <span aria-hidden>{fileType.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#17251d]">{filename}</p>
          <StudentMeta items={[{ label: fileType.type }, ...(file.size ? [{ label: formatFileSize(file.size) }] : [])]} />
        </div>
        <div className="flex items-center gap-1">
          {onPreview ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onPreview(file)
              }}
              className="grid h-9 w-9 place-items-center rounded-xl text-[#66776d] hover:bg-slate-100 hover:text-[#17251d]"
              title="Preview"
            >
              <Eye size={17} />
            </button>
          ) : null}
          {onDownload ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onDownload(file)
              }}
              className="grid h-9 w-9 place-items-center rounded-xl text-[#66776d] hover:bg-slate-100 hover:text-[#17251d]"
              title="Download"
            >
              <Download size={17} />
            </button>
          ) : null}
        </div>
      </div>
    </StudentCard>
  )
}

export default function StudentSubmissionView({
  submission,
  assignment,
  onDownloadFile,
  onPreviewFile,
}) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewFiles, setPreviewFiles] = useState([])
  const [previewIndex, setPreviewIndex] = useState(0)

  if (!submission) {
    return (
      <StudentCard className="border-dashed bg-[#fbfcfb]">
        <div className="text-center">
          <Clock size={32} className="mx-auto text-slate-400" />
          <p className="mt-3 text-sm font-semibold text-[#17251d]">No submission yet</p>
          <p className="mt-1 text-sm text-[#66776d]">Your submission will appear here once you send it.</p>
        </div>
      </StudentCard>
    )
  }

  let contentData = submission.content
  if (typeof contentData === 'string') {
    try {
      contentData = JSON.parse(contentData)
    } catch (_e) {
      contentData = { text: contentData }
    }
  }

  const files = contentData?.files || []
  const note = contentData?.note || contentData?.text || ''

  const handlePreviewFile = (file) => {
    setPreviewFiles(files)
    const index = files.findIndex((entry) => (entry.name || entry.filename) === (file.name || file.filename))
    setPreviewIndex(index >= 0 ? index : 0)
    setPreviewOpen(true)
    onPreviewFile?.(file)
  }

  const handleDownloadFile = (file) => {
    if (file.url) window.open(file.url, '_blank')
    onDownloadFile?.(file)
  }

  return (
    <div className="space-y-4">
      <SubmissionStatusCard submission={submission} dueAt={assignment?.due_at} />

      {note && note.trim() ? (
        <StudentCard density="regular">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7f8b82]">Your note</p>
            <TextToSpeechButton compact label="Read note" text={note} />
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#17251d]">{note}</p>
        </StudentCard>
      ) : null}

      {files.length > 0 ? (
        <StudentCard density="regular">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7f8b82]">Attachments</p>
              <p className="mt-1 text-sm text-[#66776d]">{files.length} file{files.length === 1 ? '' : 's'}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {files.map((file, idx) => (
              <SubmissionFileCard key={idx} file={file} onDownload={handleDownloadFile} onPreview={handlePreviewFile} />
            ))}
          </div>
        </StudentCard>
      ) : null}

      {!files.length && !note?.trim() ? (
        <StudentCard className="border-dashed bg-[#fbfcfb]">
          <div className="text-center">
            <FileText size={32} className="mx-auto text-slate-400" />
            <p className="mt-3 text-sm text-[#66776d]">No files or notes in your submission</p>
          </div>
        </StudentCard>
      ) : null}

      <FilePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        files={previewFiles}
        currentIndex={previewIndex}
      />
    </div>
  )
}

