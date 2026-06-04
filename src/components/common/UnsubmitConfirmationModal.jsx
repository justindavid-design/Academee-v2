import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'

export function UnsubmitConfirmationModal({ isOpen, assignmentTitle, onConfirm, onCancel, isLoading = false }) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative theme-card w-full max-w-sm rounded-[24px]"
          >
            <button
              onClick={onCancel}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-muted transition hover:bg-surface-alt hover:text-main"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6">
              <div className="mb-4 flex justify-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-warning-soft text-warning-token">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </div>

              <h3 className="mb-2 text-center text-lg font-bold text-main">Unsubmit work?</h3>
              <p className="mb-2 text-center text-sm text-muted">
                Are you sure you want to unsubmit <strong>{assignmentTitle}</strong>?
              </p>
              <p className="mb-6 text-center text-xs text-subtle">
                Your teacher will no longer see this as submitted. You can edit and resubmit later.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-token bg-surface px-4 py-2.5 text-sm font-semibold text-main transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger-token px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Unsubmitting...</span>
                    </>
                  ) : (
                    'Unsubmit Work'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

export default UnsubmitConfirmationModal
