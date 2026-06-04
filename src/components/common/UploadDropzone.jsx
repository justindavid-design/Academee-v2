import React, { useCallback, useState } from 'react'
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * UploadDropzone Component - Optimized for student submission file uploads
 * Features:
 * - Drag and drop upload area
 * - Click to browse files
 * - Multiple file support (up to 5 files)
 * - File preview cards with icons
 * - Upload progress tracking
 * - File size validation
 * - File type validation
 * - Remove file button
 */
export default function UploadDropzone({
  onFilesSelected,
  maxSize = 50 * 1024 * 1024, // 50MB default
  maxFiles = 5,
  acceptedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'image/jpeg', 'image/png', 'image/gif', 'text/plain', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'video/mp4'],
  selectedFiles = [],
  error = null,
}) {
  const [isDragActive, setIsDragActive] = useState(false)

  const fileTypeIcons = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📄',
    ppt: '🎬',
    pptx: '🎬',
    xlsx: '📊',
    csv: '📋',
    zip: '📦',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    svg: '🎨',
    mp4: '🎥',
    webm: '🎥',
  }

  const getFileIcon = (fileName) => {
    if (!fileName) return '📎'
    const ext = fileName.split('.').pop().toLowerCase()
    return fileTypeIcons[ext] || '📎'
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const validateFiles = (filesToValidate) => {
    const validFiles = []
    const errors = []

    // Check max files
    const totalFiles = selectedFiles.length + filesToValidate.length
    if (totalFiles > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed. You are adding ${filesToValidate.length} files to ${selectedFiles.length} existing.`)
      return { validFiles: [], errors }
    }

    filesToValidate.forEach((file) => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        errors.push(`${file.name}: Unsupported file type`)
        return
      }

      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name}: Exceeds max size of ${formatFileSize(maxSize)}`)
        return
      }

      validFiles.push(file)
    })

    return { validFiles, errors }
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const { validFiles, errors } = validateFiles(droppedFiles)
    
    if (validFiles.length > 0 || errors.length === 0) {
      onFilesSelected([...selectedFiles, ...validFiles], errors.length > 0 ? errors : null)
    } else if (errors.length > 0) {
      onFilesSelected(selectedFiles, errors)
    }
  }, [selectedFiles, onFilesSelected])

  const handleBrowseClick = (input) => {
    input?.click()
  }

  const handleFileInputChange = (e) => {
    const selectedFileList = Array.from(e.target.files || [])
    const { validFiles, errors } = validateFiles(selectedFileList)
    
    if (validFiles.length > 0 || errors.length === 0) {
      onFilesSelected([...selectedFiles, ...validFiles], errors.length > 0 ? errors : null)
    } else if (errors.length > 0) {
      onFilesSelected(selectedFiles, errors)
    }
  }

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    onFilesSelected(newFiles, null)
  }

  const canAddMore = selectedFiles.length < maxFiles

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 bg-slate-50 hover:border-blue-400'
        } p-8`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          id="file-input-dropzone"
          accept={acceptedTypes.join(',')}
          disabled={!canAddMore}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <Upload
            size={40}
            className={`mb-3 ${isDragActive ? 'text-blue-500' : 'text-slate-400'}`}
          />
          <p className="text-base font-semibold text-slate-900">
            Drop files here or{' '}
            <label
              htmlFor="file-input-dropzone"
              className={`cursor-pointer font-semibold transition-colors ${
                canAddMore
                  ? 'text-blue-600 hover:text-blue-700'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (!canAddMore) e.preventDefault()
              }}
            >
              browse
            </label>
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Max size: {formatFileSize(maxSize)} • Up to {maxFiles} files
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Supported: PDF, Word, PowerPoint, Excel, Images, ZIP, Video
          </p>
          {!canAddMore && (
            <p className="mt-2 text-xs text-amber-600 font-medium">
              Maximum {maxFiles} files reached
            </p>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 text-sm">Upload Error</p>
              {Array.isArray(error) ? (
                <ul className="mt-2 space-y-1">
                  {error.map((err, idx) => (
                    <li key={idx} className="text-sm text-red-800">• {err}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-red-800">{error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </p>
            <p className="text-xs text-slate-600">
              {maxFiles - selectedFiles.length} slot{maxFiles - selectedFiles.length !== 1 ? 's' : ''} remaining
            </p>
          </div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl flex-shrink-0">
                    {getFileIcon(file.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="flex-shrink-0 text-slate-400 hover:text-red-600 transition-colors ml-3"
                  aria-label={`Remove ${file.name}`}
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedFiles.length === 0 && !error && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <File size={16} />
            <p className="text-sm">No files selected yet</p>
          </div>
        </div>
      )}
    </div>
  )
}
