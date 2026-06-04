import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, CheckCircle, Maximize2 } from 'lucide-react'

/**
 * ClassCodeModal - Displays class code with copy functionality
 * Similar to Google Classroom's class code sharing modal
 */
export default function ClassCodeModal({ isOpen, onClose, course, courseId }) {
  const [copied, setCopied] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  // Get or generate class code (in real implementation, this would come from course data)
  const classCode = course?.course_code || courseId?.substring(0, 8).toUpperCase() || 'NOCLASSID'

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${classCode}`
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  const modalContent = (
    <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${fullscreen ? 'w-full h-full' : 'w-full max-w-md'}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Class code</h2>
        <div className="flex items-center gap-2">
          {!fullscreen && (
            <button
              onClick={() => setFullscreen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              title="Fullscreen"
            >
              <Maximize2 size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 sm:px-12 sm:py-12">
        {/* Class Code Display */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <p className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wide">Your code</p>
            <div className="text-6xl font-bold text-slate-900 tracking-wider font-mono break-all">
              {classCode}
            </div>
          </motion.div>
        </div>

        {/* Course Info Tags */}
        {course && (
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            {course.title && (
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                {course.title}
              </span>
            )}
            {course.author_name && (
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                {course.author_name}
              </span>
            )}
          </div>
        )}

        {/* Copy Buttons */}
        <div className="space-y-3">
          {/* Copy Code Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyCode}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle size={18} />
                Code copied to clipboard
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy code
              </>
            )}
          </motion.button>

          {/* Copy Invite Link Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyInviteLink}
            className="w-full px-4 py-3 rounded-lg font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <Copy size={18} />
            Copy invite link
          </motion.button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 leading-relaxed">
            Share this code or invite link with your students so they can join the class. They can enter the code or use the link to enroll.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 ${
              fullscreen
                ? 'inset-0 p-4 sm:p-0'
                : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full mx-auto'
            }`}
          >
            {modalContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
