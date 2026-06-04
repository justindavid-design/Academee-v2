import React from 'react'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

export default function AdaptiveFeedback({ text, loading, isCorrect, variant = 'question' }) {
  if (!loading && !text) return null

  const correct = isCorrect !== false
  const tone = correct
    ? 'border-success/30 bg-success-soft text-success-token'
    : 'border-warning/30 bg-warning-soft text-warning-token'
  const Icon = correct ? LightbulbOutlinedIcon : ErrorOutlineIcon
  const iconClr = correct ? 'var(--success)' : 'var(--warning)'

  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3.5 text-sm leading-relaxed ${tone} ${variant === 'overall' ? 'mt-3' : ''}`}>
      {loading ? (
        <div className="flex items-center gap-2 text-muted">
          <div className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-token border-t-primary-token" />
          <span className="text-xs">Preparing helpful tips...</span>
        </div>
      ) : (
        <>
          <Icon style={{ fontSize: 18, color: iconClr, marginTop: 1, flexShrink: 0 }} />
          <p>{text}</p>
        </>
      )}
    </div>
  )
}
