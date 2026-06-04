import React, { useCallback, useId, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { formatFileSize, MAX_UPLOAD_SIZE, SUPPORTED_FILE_EXTENSIONS, validateFiles } from '../../lib/fileUtils'
import { FileAttachmentList } from './FileAttachmentCard'

export default function FileUploadDropzone({
  files = [],
  onChange,
  multiple = true,
  maxSize = MAX_UPLOAD_SIZE,
  error = '',
  label = 'Upload files',
  description = 'Drag files here or click to upload',
}) {
  const inputId = useId()
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState('')

  const accept = SUPPORTED_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(',')

  const addFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList || [])
    const nextIncoming = multiple ? incoming : incoming.slice(0, 1)
    const { validFiles, errors } = validateFiles(nextIncoming, maxSize)
    setLocalError(errors[0] || '')
    if (validFiles.length) {
      onChange?.(multiple ? [...files, ...validFiles] : validFiles)
    }
  }, [files, maxSize, multiple, onChange])

  const removeFile = (index) => {
    onChange?.(files.filter((_, fileIndex) => fileIndex !== index))
  }

  return (
    <div className="space-y-4">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          addFiles(event.dataTransfer.files)
        }}
        className={`group flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
          isDragging
            ? 'border-primary-token bg-primary-soft'
            : 'border-token bg-surface-quiet hover:border-primary/40 hover:bg-surface'
        }`}
      >
        <input
          id={inputId}
          type="file"
          multiple={multiple}
          accept={accept}
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface text-primary-token shadow-sm transition group-hover:scale-105">
          <UploadCloud className="h-7 w-7" />
        </span>
        <span className="mt-4 text-base font-black text-main">{label}</span>
        <span className="mt-1 text-sm font-medium text-muted">{description}</span>
        <span className="mt-3 rounded-full bg-surface px-3 py-1 text-xs font-black text-muted shadow-sm">
          PDF, DOCX, PPTX, PNG, JPG, ZIP · up to {formatFileSize(maxSize)}
        </span>
      </label>

      {(error || localError) ? (
        <div className="rounded-2xl border border-danger/30 bg-danger-soft p-3 text-sm font-semibold text-danger-token">
          {error || localError}
        </div>
      ) : null}

      <FileAttachmentList
        files={files}
        allowRemove
        onRemove={removeFile}
        emptyLabel="No files selected yet."
      />
    </div>
  )
}
