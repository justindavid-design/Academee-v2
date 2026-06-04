import React, { useEffect, useMemo, useState } from 'react'
import { Download, ExternalLink, FileText, Image, Package, Presentation, X } from 'lucide-react'
import { formatFileSize, getFileExtension, normalizeAttachment } from '../../lib/fileUtils'

function fileKind(fileName = '') {
  const ext = getFileExtension(fileName)
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'document'
  if (['ppt', 'pptx'].includes(ext)) return 'presentation'
  if (ext === 'zip') return 'archive'
  return 'file'
}

function KindIcon({ kind }) {
  const Icon = {
    image: Image,
    pdf: FileText,
    document: FileText,
    presentation: Presentation,
    archive: Package,
    file: FileText,
  }[kind] || FileText

  return <Icon className="h-6 w-6" />
}

export default function FilePreviewModal({ isOpen, onClose, file, files = [], initialIndex = 0 }) {
  const normalizedFiles = useMemo(() => (files.length ? files : file ? [file] : []).map(normalizeAttachment), [file, files])
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  useEffect(() => {
    if (isOpen) setActiveIndex(initialIndex)
  }, [initialIndex, isOpen])

  if (!isOpen || !normalizedFiles.length) return null

  const activeFile = normalizedFiles[Math.min(activeIndex, normalizedFiles.length - 1)]
  const kind = fileKind(activeFile.name)

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md">
      <div className="mx-auto my-6 flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col overflow-hidden rounded-[28px] bg-surface shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-token bg-surface/95 p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-surface-alt text-muted">
              <KindIcon kind={kind} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-black text-main">{activeFile.name}</h2>
              <p className="mt-1 text-xs font-semibold text-muted">
                {getFileExtension(activeFile.name).toUpperCase() || 'FILE'} · {formatFileSize(activeFile.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-2 text-muted transition hover:bg-surface-alt hover:text-main"
            aria-label="Close file preview"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <main className="grid flex-1 place-items-center bg-surface-quiet p-4 sm:p-6">
          {kind === 'image' ? (
            <img src={activeFile.url} alt={activeFile.name} className="max-h-[68vh] max-w-full rounded-2xl object-contain shadow-sm" />
          ) : kind === 'pdf' ? (
            <iframe title={activeFile.name} src={activeFile.url} className="h-[68vh] w-full rounded-2xl border border-token bg-surface" />
          ) : (
            <div className="max-w-md rounded-[28px] border border-token bg-surface p-8 text-center shadow-sm">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-surface-alt text-muted">
                <KindIcon kind={kind} />
              </span>
              <h3 className="mt-5 text-xl font-black text-main">Preview unavailable</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-muted">
                This file type is ready to open or download, but cannot be rendered directly in the browser preview.
              </p>
            </div>
          )}
        </main>

        <footer className="flex flex-col gap-3 border-t border-token bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {normalizedFiles.length > 1
              ? normalizedFiles.map((item, index) => (
                  <button
                    key={`${item.name}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                      index === activeIndex ? 'bg-primary-token text-white' : 'bg-surface-alt text-main hover:bg-surface-quiet'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))
              : null}
          </div>
          <div className="grid gap-2 sm:flex">
            <a
              href={activeFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-token bg-surface px-4 py-2.5 text-sm font-black text-main transition hover:bg-surface-alt"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </a>
            <a
              href={activeFile.url}
              download={activeFile.name}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-token px-4 py-2.5 text-sm font-black text-white transition hover:bg-primary-hover"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}
