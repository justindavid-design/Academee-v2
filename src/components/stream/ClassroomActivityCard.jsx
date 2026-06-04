import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { StudentCard } from '../student/StudentSurface'

/**
 * ClassroomActivityCard - Base card component inspired by Google Classroom
 * Provides a clean, minimal, and interactive classroom activity experience
 */
export function ClassroomActivityCard({
  children,
  onClick,
  onHover,
  className = '',
  isClickable = true,
  variant = 'default', // 'default', 'announcement', 'assignment', 'quiz', 'reviewer'
}) {
  const variantStyles = {
    default: 'slate',
    announcement: 'amber',
    assignment: 'blue',
    quiz: 'violet',
    reviewer: 'emerald',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <StudentCard
        onClick={isClickable ? onClick : undefined}
        accent={variantStyles[variant] || 'slate'}
        className={`p-0 ${className}`}
        ariaLabel={isClickable ? 'Activity card' : undefined}
      >
        <div className={`absolute inset-y-0 left-0 w-1.5 ${
          variant === 'announcement'
            ? 'bg-amber-400'
            : variant === 'assignment'
              ? 'bg-blue-400'
              : variant === 'quiz'
                ? 'bg-violet-400'
                : variant === 'reviewer'
                  ? 'bg-emerald-400'
                  : 'bg-slate-300'
        }`} />
        {children}
      </StudentCard>
    </motion.div>
  )
}

/**
 * CardHeader - Teacher info and metadata at top of card
 */
export function CardHeader({
  teacherName,
  teacherAvatar,
  actionLabel,
  timestamp,
  isPinned = false,
  onMenu,
  menuItems,
}) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!showMenu) return undefined

    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showMenu])

  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Avatar */}
        {teacherAvatar ? (
          <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border border-slate-200 shadow-sm">
            <img
              src={teacherAvatar}
              alt={teacherName || 'Teacher'}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-700 font-bold text-sm">
            {teacherName?.charAt(0)?.toUpperCase() || 'T'}
          </div>
        )}

        {/* Meta info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{teacherName || 'Teacher'}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs font-medium text-slate-600">{actionLabel}</span>
            {timestamp && <span className="text-xs text-slate-500">{timestamp}</span>}
            {isPinned && <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Pinned</span>}
          </div>
        </div>
      </div>

      {/* Menu button */}
      {menuItems && menuItems.length > 0 && (
        <div className="relative" ref={menuRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Card options"
            aria-haspopup="menu"
            aria-expanded={showMenu}
          >
            <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.5 1.5H9.5V3H10.5V1.5ZM10.5 17H9.5V18.5H10.5V17ZM19 9.5V10.5H17.5V9.5H19ZM2.5 9.5V10.5H1V9.5H2.5Z" />
              <circle cx="10" cy="10" r="2" />
            </svg>
          </motion.button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-full z-50 mt-1 min-w-max overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.12)]"
              onClick={(e) => e.stopPropagation()}
            >
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation()
                    item.onClick?.()
                    setShowMenu(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowMenu(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                    item.isDanger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * CardContent - Main content section of the card
 */
export function CardContent({ title, description, children, className = '' }) {
  return (
    <div className={`px-5 py-4 sm:px-6 ${className}`}>
      {title && (
        <h3 className="text-[1.05rem] font-semibold tracking-tight text-slate-950 leading-tight mb-2 line-clamp-2 sm:text-[1.1rem]">
          {title}
        </h3>
      )}

      {description && (
        <p className="text-sm text-slate-600 leading-6 line-clamp-3 mb-3">
          {description}
        </p>
      )}

      {children}
    </div>
  )
}

/**
 * CardMetadata - Secondary information and metadata
 */
export function CardMetadata({ items = [], className = '' }) {
  return (
    <div className={`px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center gap-3 text-sm ${className}`}>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 text-slate-600">
          {item.icon && <item.icon className="w-4 h-4 text-slate-500" />}
          <span className={item.bold ? 'font-semibold text-slate-900' : undefined}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * CardAction - Action button section
 */
export function CardAction({ children, className = '' }) {
  return (
    <div className={`px-5 py-3 border-t border-slate-100 flex gap-3 flex-wrap ${className}`}>
      {children}
    </div>
  )
}

/**
 * ActionButton - Styled action button for cards
 */
export function ActionButton({
  label,
  onClick,
  variant = 'primary', // 'primary', 'secondary', 'danger'
  className = '',
  icon: Icon,
}) {
  const baseStyles =
    'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 flex-1 justify-center'

  const variantStyles = {
    primary: 'bg-[#1f7a4d] text-white hover:bg-[#18613d] hover:shadow-sm',
    secondary: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
    danger: 'border border-red-200 text-red-600 hover:bg-red-50',
  }

  return (
    <motion.button
      type="button"
      aria-label={label}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick?.(event)
      }}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </motion.button>
  )
}

/**
 * StatusBadge - Status indicator badge
 */
export function StatusBadge({ label, type = 'default' }) {
  const typeStyles = {
    submitted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    overdue: 'bg-red-50 text-red-700 border-red-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    default: 'bg-blue-50 text-blue-700 border-blue-200',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
        typeStyles[type] || typeStyles.default
      }`}
    >
      {label}
    </span>
  )
}
