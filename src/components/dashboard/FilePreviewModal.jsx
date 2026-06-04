import React, { useState } from 'react'
import { X, Download, ExternalLink, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react'
import Modal from '../common/Modal'

/**
 * FilePreviewModal Component
 * Displays file previews with options to download and open in new tab
 */
export default function FilePreviewModal({
  isOpen,
  onClose,
  file = null,
  files = [],
  currentIndex = 0,
}) {
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  const currentFile = files[activeIndex] || file

  if (!currentFile) return null

  const handlePrevious = () => {
    setActiveIndex(prev => (prev > 0 ? prev - 1 : files.length - 1))
  }

  const handleNext = () => {
    setActiveIndex(prev => (prev < files.length - 1 ? prev + 1 : 0))
  }

  const getFileIcon = (filename) => {
    if (!filename) return '📎'
    const ext = filename.split('.').pop().toLowerCase()
    const icons = {
      pdf: '📄', doc: '📝', docx: '📝', txt: '📄', ppt: '🎬', pptx: '🎬',
      xlsx: '📊', csv: '📋', zip: '📦', jpg: '🖼️', jpeg: '🖼️', png: '🖼️',
      gif: '🖼️', svg: '🎨', mp4: '🎥', webm: '🎥', mp3: '🎵', wav: '🎵',
    }
    return icons[ext] || '📎'
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const isImage = (filename) => {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']
    const ext = filename.split('.').pop().toLowerCase()
    return imageExts.includes(ext)
  }

  const isPDF = (filename) => {
    return filename.toLowerCase().endsWith('.pdf')
  }

  const isVideo = (filename) => {
    const videoExts = ['mp4', 'webm', 'mov', 'avi']
    const ext = filename.split('.').pop().toLowerCase()
    return videoExts.includes(ext)
  }

  const isAudio = (filename) => {
    const audioExts = ['mp3', 'wav', 'm4a', 'ogg']
    const ext = filename.split('.').pop().toLowerCase()
    return audioExts.includes(ext)
  }

  const filename = currentFile.name || currentFile.filename
  const fileUrl = currentFile.url

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      closeButton
      title={`Preview: ${filename}`}
    >
      <div className="space-y-4">
        {/* File Info Header */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getFileIcon(filename)}</span>
            <div>
              <p className="font-semibold text-slate-900">{filename}</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {currentFile.type} • {formatFileSize(currentFile.size)}
              </p>
            </div>
          </div>
          {files.length > 1 && (
            <p className="text-xs text-slate-600">
              {activeIndex + 1} of {files.length}
            </p>
          )}
        </div>

        {/* Preview Content */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
          {isImage(filename) ? (
            // Image Preview
            <div className="flex items-center justify-center p-8 min-h-96">
              <img
                src={fileUrl}
                alt={filename}
                className="max-w-full max-h-96 rounded"
                onError={(e) => {
                  e.target.src = ''
                  e.target.innerHTML = '<div class="text-slate-500">Failed to load image</div>'
                }}
              />
            </div>
          ) : isPDF(filename) ? (
            // PDF Preview (embed or link)
            <div className="flex items-center justify-center p-8 min-h-96 bg-white">
              <div className="text-center">
                <p className="text-3xl mb-2">📄</p>
                <p className="text-slate-600 text-sm font-medium mb-4">PDF Preview</p>
                <p className="text-slate-500 text-xs mb-4">
                  Click "Open in New Tab" to view the PDF file in your browser
                </p>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  <ExternalLink size={16} />
                  Open PDF
                </a>
              </div>
            </div>
          ) : isVideo(filename) ? (
            // Video Preview
            <div className="flex items-center justify-center p-8 min-h-96">
              <video
                controls
                className="max-w-full max-h-96 rounded"
                controlsList="nodownload"
              >
                <source src={fileUrl} type={currentFile.type} />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : isAudio(filename) ? (
            // Audio Preview
            <div className="flex items-center justify-center p-8 min-h-40">
              <div className="w-full max-w-md">
                <audio
                  controls
                  className="w-full"
                  controlsList="nodownload"
                >
                  <source src={fileUrl} type={currentFile.type} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          ) : (
            // Generic File Preview
            <div className="flex items-center justify-center p-12 min-h-96 bg-white">
              <div className="text-center">
                <p className="text-6xl mb-4">{getFileIcon(filename)}</p>
                <p className="text-slate-700 font-semibold text-lg mb-2">{filename}</p>
                <p className="text-slate-600 text-sm mb-6">
                  This file type cannot be previewed in the browser
                </p>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  <ExternalLink size={16} />
                  Open in New Tab
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Navigation for Multiple Files */}
        {files.length > 1 && (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <div className="flex-1 text-center">
              <p className="text-xs text-slate-600">
                File {activeIndex + 1} of {files.length}
              </p>
            </div>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
          >
            <ExternalLink size={18} />
            Open in New Tab
          </a>
          <a
            href={fileUrl}
            download={filename}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
          >
            <Download size={18} />
            Download
          </a>
        </div>
      </div>
    </Modal>
  )
}
