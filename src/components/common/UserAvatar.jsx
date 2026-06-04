import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * Dynamic User Avatar Component
 * Displays user profile image with fallback to initials
 */
export default function UserAvatar({
  name = 'User',
  avatar = null,
  size = 'md',
  className = '',
  showBorder = true,
  interactive = false,
  onClick = null,
}) {
  // Determine size classes
  const sizeClasses = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-16 h-16 text-xl',
  }[size] || 'w-12 h-12 text-base'

  const backgroundColor = useMemo(() => {
    const colors = [
      'bg-primary-token text-white',
      'bg-info-token text-white',
      'bg-success-token text-white',
      'bg-warning-token text-white',
      'bg-danger-token text-white',
      'bg-surface-alt text-main',
    ]
    const index = (name.charCodeAt(0) || 0) % colors.length
    return colors[index]
  }, [name])

  // Generate initials
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .substring(0, 2) || '?'

  const avatarUrl = avatar
    ? avatar.startsWith('http')
      ? avatar
      : `http://localhost:8787${avatar}`
    : null

  const baseClasses = `
    ${sizeClasses}
    rounded-full
    flex
    items-center
    justify-center
    flex-shrink-0
    overflow-hidden
    font-bold
    ${avatarUrl ? 'text-white' : ''}
    transition-all
    duration-300
    ${showBorder ? 'border-2 border-surface shadow-md' : 'shadow-sm'}
    ${interactive ? 'cursor-pointer hover:scale-110' : ''}
    ${className}
  `

  const handleClick = (e) => {
    if (interactive && onClick) {
      onClick(e)
    }
  }

  const content = (
    <div
      className={baseClasses}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive && onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(e)
        }
      } : undefined}
      title={name}
    >
      {avatarUrl ? (
        <motion.img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.target.style.display = 'none'
          }}
        />
      ) : null}
      {!avatarUrl || !avatar ? (
        <div className={`flex h-full w-full items-center justify-center ${backgroundColor}`}>
          {initials}
        </div>
      ) : null}
    </div>
  )

  if (interactive) {
    return (
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        {content}
      </motion.div>
    )
  }

  return content
}

/**
 * Avatar Group Component
 * Display multiple avatars in a row with overlap
 */
export function AvatarGroup({
  users = [],
  max = 3,
  size = 'sm',
  onViewMore = null,
}) {
  const displayUsers = users.slice(0, max)
  const hiddenCount = Math.max(0, users.length - max)

  return (
    <div className="flex items-center -space-x-2">
      {displayUsers.map((user, index) => (
        <div key={`${user.id || index}`} className="relative z-10" style={{ zIndex: max - index }}>
          <UserAvatar
            name={user.name || user.display_name || 'User'}
            avatar={user.avatar || user.avatar_url}
            size={size}
            showBorder={true}
          />
        </div>
      ))}
      {hiddenCount > 0 && onViewMore && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onViewMore}
          className={`
            flex items-center justify-center
            rounded-full font-bold text-white bg-subtle hover:bg-muted transition-colors
            ${size === 'xs' ? 'w-8 h-8 text-xs' : size === 'sm' ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base'}
            border-2 border-surface
            shadow-md
          `}
          title={`+${hiddenCount} more`}
        >
          +{hiddenCount}
        </motion.button>
      )}
    </div>
  )
}
