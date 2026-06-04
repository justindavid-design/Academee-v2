import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Image Preview Card Component
 * Display images within stream cards with responsive preview
 */
export default function ImagePreviewCard({
  src,
  alt = 'Image',
  fileName = 'image',
  fileSize = 0,
  onDownload = null,
  onViewFull = null,
  maxHeight = '300px',
  className = '',
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const imageUrl = src?.startsWith('http') ? src : `http://localhost:8787${src}`

  if (hasError) {
    return (
      <div className={`rounded-xl bg-slate-100 border border-slate-200 p-6 text-center ${className}`}>
        <p className="text-sm text-slate-600 font-medium">Unable to load image</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group ${className}`}
      style={{ maxHeight }}
    >
      {/* Image */}
      <div className="relative h-full">
        <motion.img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
        />

        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 animate-pulse" />
        )}

        {/* Overlay on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3"
        >
          {onViewFull && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onViewFull}
              className="p-3 rounded-full bg-white/90 hover:bg-white text-slate-900 transition-colors shadow-lg"
              title="View full size"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}
          {onDownload && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDownload}
              className="p-3 rounded-full bg-white/90 hover:bg-white text-slate-900 transition-colors shadow-lg"
              title="Download image"
            >
              <Download className="w-5 h-5" />
            </motion.button>
          )}
          {onViewFull && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onViewFull}
              className="p-3 rounded-full bg-white/90 hover:bg-white text-slate-900 transition-colors shadow-lg"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Footer info */}
      {fileName && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white"
        >
          <p className="text-xs font-semibold truncate">{fileName}</p>
        </motion.div>
      )}
    </motion.div>
  )
}

/**
 * Image Gallery Component
 * Display multiple images in a grid
 */
export function ImageGallery({
  images = [],
  onImageClick = null,
  maxColumns = 2,
  gap = 'gap-3',
  maxHeight = '280px',
}) {
  if (!images.length) return null

  return (
    <div className={`grid grid-cols-${maxColumns} ${gap}`}>
      {images.map((image, index) => (
        <ImagePreviewCard
          key={`${image.url || image.name || index}`}
          src={image.url || image.path}
          alt={image.name || `Image ${index + 1}`}
          fileName={image.name}
          fileSize={image.size}
          maxHeight={maxHeight}
          onViewFull={() => onImageClick?.(image, index)}
          onDownload={() => {
            const url = image.url?.startsWith('http') ? image.url : `http://localhost:8787${image.url}`
            window.open(url, '_blank')
          }}
        />
      ))}
    </div>
  )
}

/**
 * Full Screen Image Viewer
 */
export function ImageViewerModal({ isOpen, image, onClose, onNext, onPrev, images = [] }) {
  if (!isOpen || !image) return null

  const imageUrl = image.url?.startsWith('http') ? image.url : `http://localhost:8787${image.url}`
  const currentIndex = images.findIndex(img => img.url === image.url)
  const canGoNext = currentIndex < images.length - 1
  const canGoPrev = currentIndex > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] rounded-xl overflow-hidden"
      >
        {/* Image */}
        <img
          src={imageUrl}
          alt={image.name || 'Full size image'}
          className="w-full h-full object-contain"
        />

        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </motion.button>

        {/* Navigation buttons */}
        {canGoPrev && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
        )}

        {canGoNext && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        )}

        {/* Image info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
          <p className="text-sm font-semibold">{image.name}</p>
          {images.length > 1 && (
            <p className="text-xs text-white/70 mt-1">
              {currentIndex + 1} of {images.length}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
