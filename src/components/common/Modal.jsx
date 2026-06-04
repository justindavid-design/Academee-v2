import React, { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeButton = true,
  onSubmit = null,
  submitText = 'Save',
  submitLoading = false,
  submitDisabled = false,
  cancelText = 'Cancel',
  showFooter = true,
}) {
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    previousFocusRef.current = document.activeElement
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      modalRef.current?.focus()
    }, 60)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previousFocusRef.current?.focus?.()
    }
  }, [isOpen, onClose])

  const handleBackdropClick = useCallback((event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }, [onClose])

  const handleFocusTrap = useCallback((event) => {
    if (event.key !== 'Tab' || !isOpen || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement?.focus?.()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement?.focus?.()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            <div
              ref={modalRef}
              onKeyDown={handleFocusTrap}
              tabIndex={-1}
              className={`theme-card w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto rounded-[28px]`}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-token bg-surface/95 px-6 py-4 backdrop-blur-md">
                <h2 id="modal-title" className="text-lg font-semibold text-main">
                  {title}
                </h2>
                {closeButton ? (
                  <button
                    onClick={onClose}
                    className="rounded-xl p-2 text-muted transition hover:bg-surface-alt hover:text-main focus:outline-none focus:ring-4 focus:ring-primary/15"
                    aria-label="Close dialog"
                  >
                    <X size={22} />
                  </button>
                ) : null}
              </div>

              <div className="px-6 py-5">
                {children}
              </div>

              {showFooter ? (
                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-token bg-surface/95 px-6 py-4 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center justify-center rounded-xl border border-token bg-surface px-4 py-2.5 text-sm font-semibold text-main transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={submitLoading}
                  >
                    {cancelText}
                  </button>
                  {onSubmit ? (
                    <button
                      type="button"
                      onClick={onSubmit}
                      className="inline-flex items-center justify-center rounded-xl bg-primary-token px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={submitDisabled || submitLoading}
                    >
                      {submitLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                          Saving...
                        </span>
                      ) : submitText}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
