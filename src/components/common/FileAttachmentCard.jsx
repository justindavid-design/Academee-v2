import React, { useState } from 'react'
import { Download, ExternalLink, Eye, FileText, Image, Package, Presentation, Trash2 } from 'lucide-react'
import { formatFileSize, getFileExtension, normalizeAttachment } from '../../lib/fileUtils'
import FilePreviewModal from './FilePreviewModal'

function iconFor(fileName = '') {
  const ext = getFileExtension(fileName)
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return { Icon: Image, tone: 'bg-info-soft text-info-token', label: 'Image' }
  if (ext === 'pdf') return { Icon: FileText, tone: 'bg-danger-soft text-danger-token', label: 'PDF' }
  if (['doc', 'docx'].includes(ext)) return { Icon: FileText, tone: 'bg-info-soft text-info-token', label: 'Document' }
  if (['ppt', 'pptx'].includes(ext)) return { Icon: Presentation, tone: 'bg-warning-soft text-warning-token', label: 'Slides' }
  if (ext === 'zip') return { Icon: Package, tone: 'bg-surface-alt text-muted', label: 'ZIP' }
  return { Icon: FileText, tone: 'bg-surface-alt text-muted', label: 'File' }
}

export function FileAttachmentCard({ file, files, index = 0, onRemove, allowRemove = false, compact = false }) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const attachment = normalizeAttachment(file)
  const { Icon, tone, label } = iconFor(attachment.name)
  const uploadedAt = attachment.uploadedAt ? new Date(attachment.uploadedAt) : null
  const uploadedLabel = uploadedAt && !Number.isNaN(uploadedAt.getTime())
    ? uploadedAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'Ready'

  return (
    <>
      <div className={`group theme-card rounded-2xl transition hover:-translate-y-0.5 hover:shadow-card ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-start gap-3">
          <span className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl ${tone}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-main">{attachment.name}</p>
            <p className="mt-1 text-xs font-medium text-muted">
              {label} · {formatFileSize(attachment.size)} · {uploadedLabel}
            </p>
          </div>
          {allowRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-xl p-2 text-subtle transition hover:bg-danger-soft hover:text-danger-token"
              aria-label={`Remove ${attachment.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {attachment.url ? (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-surface-alt px-3 py-2 text-xs font-semibold text-main transition hover:bg-surface-elevated"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-surface-alt px-3 py-2 text-xs font-semibold text-main transition hover:bg-surface-elevated"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </a>
            <a
              href={attachment.url}
              download={attachment.name}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-token px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-hover"
            >
              <Download className="h-3.5 w-3.5" />
              Save
            </a>
          </div>
        ) : null}
      </div>

      <FilePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        files={files || [attachment]}
        initialIndex={index}
      />
    </>
  )
}

export function FileAttachmentList({ files = [], allowRemove = false, onRemove, emptyLabel = 'No files attached yet.' }) {
  const attachments = files.map(normalizeAttachment).filter((file) => file.name)

  if (!attachments.length) {
    return <p className="rounded-2xl border border-dashed border-token bg-surface-quiet p-4 text-center text-sm font-medium text-muted">{emptyLabel}</p>
  }

  return (
    <div className="grid gap-3">
      {attachments.map((file, index) => (
        <FileAttachmentCard
          key={`${file.name}-${file.url || index}`}
          file={file}
          files={attachments}
          index={index}
          allowRemove={allowRemove}
          onRemove={() => onRemove?.(index)}
        />
      ))}
    </div>
  )
}

export default FileAttachmentCard
