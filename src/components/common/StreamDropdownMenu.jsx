import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Trash2, Pin, Copy, Share2, Eye, EyeOff } from 'lucide-react'

export default function StreamDropdownMenu({
  isOpen,
  onClose = () => {},
  items = [],
  align = 'right',
  className = '',
}) {
  const menuRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)

    requestAnimationFrame(() => {
      const firstButton = menuRef.current?.querySelector('button[role="menuitem"]')
      firstButton?.focus?.()
    })

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  const iconMap = {
    edit: Edit2,
    delete: Trash2,
    pin: Pin,
    copy: Copy,
    share: Share2,
    view: Eye,
    hide: EyeOff,
  }

  const moveFocus = (current, direction) => {
    const buttons = Array.from(menuRef.current?.querySelectorAll('button[role="menuitem"]') || [])
    const currentIndex = buttons.indexOf(current)
    if (currentIndex === -1 || !buttons.length) return
    const nextIndex = (currentIndex + direction + buttons.length) % buttons.length
    buttons[nextIndex]?.focus?.()
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.96, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -8 }}
          transition={{ duration: 0.16 }}
          role="menu"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === 'Escape') onClose()
          }}
          className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} top-full z-50 mt-2 min-w-52 overflow-hidden rounded-2xl border border-token bg-surface shadow-card outline-none ${className}`}
        >
          <div className="py-1">
            {items.map((item, index) => {
              const Icon = iconMap[item.icon] || item.icon
              const isDangerous = item.variant === 'danger'
              const isDisabled = item.disabled === true

              return (
                <div key={`${item.label}-${index}`}>
                  {item.divider && index > 0 ? <div className="my-1 h-px bg-token" /> : null}

                  <motion.button
                    type="button"
                    role="menuitem"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      item.onClick?.()
                      onClose()
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowDown') {
                        event.preventDefault()
                        moveFocus(event.currentTarget, 1)
                      }
                      if (event.key === 'ArrowUp') {
                        event.preventDefault()
                        moveFocus(event.currentTarget, -1)
                      }
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        item.onClick?.()
                        onClose()
                      }
                    }}
                    disabled={isDisabled}
                    whileHover={!isDisabled ? { backgroundColor: 'var(--surface-alt)' } : {}}
                    whileTap={!isDisabled ? { scale: 0.985 } : {}}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors duration-150 ${
                      isDangerous
                        ? 'text-danger-token hover:bg-danger-soft'
                        : 'text-main hover:bg-surface-alt'
                    } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    {Icon ? (
                      <Icon className={`h-4 w-4 flex-shrink-0 ${isDangerous ? 'text-danger-token' : 'text-subtle'}`} />
                    ) : null}
                    <span>{item.label}</span>
                  </motion.button>
                </div>
              )
            })}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function createMenuItem({
  label = '',
  icon = 'edit',
  onClick = () => {},
  variant = 'normal',
  disabled = false,
  divider = false,
}) {
  return { label, icon, onClick, variant, disabled, divider }
}
