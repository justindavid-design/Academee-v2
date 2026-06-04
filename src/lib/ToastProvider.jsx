import React from 'react'
import { Toaster, toast as hotToast } from 'react-hot-toast'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X, Loader } from 'lucide-react'

/**
 * Toast Provider Component
 * Wraps the app with react-hot-toast Toaster and provides global toast access
 * Design: Modern, minimal, professional with Tailwind CSS styling
 * Position: Top-right (standard for productivity and edtech apps)
 */
export function ToastProvider({ children }) {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
          },
        }}
      />
      {children}
    </>
  )
}

/**
 * Custom Toast Components
 * Modern design with soft shadows, rounded corners, and clean typography
 */

function ToastContainer({ children, className = '' }) {
  return (
    <div className={`theme-card flex gap-3 rounded-xl px-4 py-3 shadow-card backdrop-blur-sm ${className}`}>
      {children}
    </div>
  )
}

function IconWrapper({ icon: Icon, color = 'text-slate-400' }) {
  return <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${color}`} />
}

function MessageWrapper({ title, message, variant = 'default' }) {
  const titleColor = {
    success: 'text-success-token',
    error: 'text-danger-token',
    loading: 'text-info-token',
    warning: 'text-warning-token',
    default: 'text-main',
  }[variant]

  return (
    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
      {title && <p className={`text-sm font-semibold ${titleColor}`}>{title}</p>}
      {message && <p className="line-clamp-2 text-sm text-muted">{message}</p>}
    </div>
  )
}

/**
 * Toast Helper Functions
 * Clean, reusable functions for all notification types
 */

export const toast = {
  /**
   * Success toast
   * @param {string} title - Main message
   * @param {string} message - Optional subtitle
   * @param {number} duration - Toast duration in ms (default: 3000)
   */
  success: (title, message = '', duration = 3000) => {
    hotToast.custom(
        (t) => (
          <ToastContainer className={t.visible ? 'animate-in fade-in slide-in-from-right-2' : 'animate-out fade-out'}>
          <IconWrapper icon={CheckCircle} color="text-success-token" />
          <MessageWrapper title={title} message={message} variant="success" />
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className="flex-shrink-0 text-subtle transition-colors hover:text-main"
          >
            <X className="w-4 h-4" />
          </button>
        </ToastContainer>
      ),
      { duration }
    )
  },

  /**
   * Error toast
   * @param {string} title - Main message
   * @param {string} message - Optional subtitle
   * @param {number} duration - Toast duration in ms (default: 5000)
   */
  error: (title, message = '', duration = 5000) => {
    hotToast.custom(
      (t) => (
        <ToastContainer className={t.visible ? 'animate-in fade-in slide-in-from-right-2' : 'animate-out fade-out'}>
          <IconWrapper icon={AlertCircle} color="text-danger-token" />
          <MessageWrapper title={title} message={message} variant="error" />
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className="flex-shrink-0 text-subtle transition-colors hover:text-main"
          >
            <X className="w-4 h-4" />
          </button>
        </ToastContainer>
      ),
      { duration }
    )
  },

  /**
   * Loading toast
   * @param {string} title - Main message
   * @param {string} message - Optional subtitle
   * @returns {string} Toast ID for later dismissal
   */
  loading: (title, message = '') => {
    return hotToast.custom(
      (t) => (
        <ToastContainer className={t.visible ? 'animate-in fade-in slide-in-from-right-2' : 'animate-out fade-out'}>
          <div className="flex-shrink-0 mt-0.5">
            <Loader className="w-5 h-5 text-info-token animate-spin" />
          </div>
          <MessageWrapper title={title} message={message} variant="loading" />
        </ToastContainer>
      ),
      { duration: Infinity }
    )
  },

  /**
   * Warning toast
   * @param {string} title - Main message
   * @param {string} message - Optional subtitle
   * @param {number} duration - Toast duration in ms (default: 4000)
   */
  warning: (title, message = '', duration = 4000) => {
    hotToast.custom(
      (t) => (
        <ToastContainer className={t.visible ? 'animate-in fade-in slide-in-from-right-2' : 'animate-out fade-out'}>
          <IconWrapper icon={AlertTriangle} color="text-warning-token" />
          <MessageWrapper title={title} message={message} variant="warning" />
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className="flex-shrink-0 text-subtle transition-colors hover:text-main"
          >
            <X className="w-4 h-4" />
          </button>
        </ToastContainer>
      ),
      { duration }
    )
  },

  /**
   * Info toast
   * @param {string} title - Main message
   * @param {string} message - Optional subtitle
   * @param {number} duration - Toast duration in ms (default: 4000)
   */
  info: (title, message = '', duration = 4000) => {
    hotToast.custom(
      (t) => (
        <ToastContainer className={t.visible ? 'animate-in fade-in slide-in-from-right-2' : 'animate-out fade-out'}>
          <IconWrapper icon={Info} color="text-info-token" />
          <MessageWrapper title={title} message={message} variant="default" />
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className="flex-shrink-0 text-subtle transition-colors hover:text-main"
          >
            <X className="w-4 h-4" />
          </button>
        </ToastContainer>
      ),
      { duration }
    )
  },

  /**
   * Copy to clipboard with feedback
   * @param {string} text - Text to copy
   * @param {string} message - Optional custom message
   */
  copy: (text, message = 'Copied to clipboard') => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Success', message, 2500)
    }).catch((err) => {
      console.error('Copy failed:', err)
      toast.error('Failed', 'Could not copy to clipboard', 3000)
    })
  },

  /**
   * Promise-based toast (for async operations)
   * Shows loading → success or error based on promise resolution
   */
  promise: (promise, messages = {}) => {
    const {
      loading = 'Loading...',
      success = 'Success!',
      error = 'Error occurred',
    } = messages
    
    return hotToast.promise(
      promise,
      {
        loading: (
          <ToastContainer>
            <div className="flex-shrink-0 mt-0.5">
            <Loader className="w-5 h-5 text-info-token animate-spin" />
          </div>
          <MessageWrapper title={loading} variant="loading" />
        </ToastContainer>
      ),
      success: (data) => (
        <ToastContainer>
            <IconWrapper icon={CheckCircle} color="text-success-token" />
            <MessageWrapper
              title={typeof success === 'function' ? success(data) : success}
              variant="success"
            />
          </ToastContainer>
        ),
        error: (err) => (
          <ToastContainer>
            <IconWrapper icon={AlertCircle} color="text-danger-token" />
            <MessageWrapper
              title={typeof error === 'function' ? error(err) : error}
              message={err?.message || ''}
              variant="error"
            />
          </ToastContainer>
        ),
      },
      {
        duration: [Infinity, 3000, 5000],
      }
    )
  },

  /**
   * Dismiss a specific toast by ID
   * @param {string} toastId - ID returned by loading() or promise()
   */
  dismiss: (toastId) => {
    if (toastId) hotToast.dismiss(toastId)
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    hotToast.dismiss()
  },
}

export default ToastProvider
