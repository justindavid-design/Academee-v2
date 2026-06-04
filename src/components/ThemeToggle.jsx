import React, { useEffect, useRef, useState } from 'react'
import { LightMode, DarkMode, Palette } from '@mui/icons-material'
import useTheme from '../lib/useTheme'
import { CUSTOM_THEMES } from '../lib/theme'

export default function ThemeToggle() {
  const { theme, toggleTheme, setMode, setThemePreset, mode, customTheme } = useTheme()

  const [open, setOpen] = useState(false)

  const ref = useRef(null)

  useEffect(() => {
    function handleOutsideClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [])

  const handleToggle = () => {
    const next = toggleTheme()
    setOpen(false)
    return next
  }

  const applyCustom = (key) => {
    setThemePreset(key)
    setOpen(false)
  }

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Toggle Button */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-2xl border border-token bg-surface px-3 py-2 text-sm font-semibold text-main transition hover-surface"
      >
        <span className="sr-only">Theme</span>

        {theme === 'dark' ? (
          <DarkMode sx={{ fontSize: 18 }} />
        ) : (
          <LightMode sx={{ fontSize: 18 }} />
        )}

        <span className="text-xs font-bold">
          {customTheme
            ? CUSTOM_THEMES.find((t) => t.key === customTheme)?.label || customTheme
            : mode === 'system'
              ? 'System'
              : mode.charAt(0).toUpperCase() + mode.slice(1)}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-token bg-surface p-2 shadow-card">
          
          {/* Toggle Light/Dark */}
          <button
            onClick={handleToggle}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-main transition hover:bg-surface-alt"
          >
            <Palette sx={{ fontSize: 18 }} />
            Toggle Dark / Light
          </button>

          <div className="my-2 h-px bg-token-muted" />

          {/* System */}
          <button
            onClick={() => {
              setMode('system')
              setOpen(false)
            }}
            className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-main transition hover:bg-surface-alt"
          >
            System
          </button>

          {/* Light */}
          <button
            onClick={() => {
              setMode('light')
              setOpen(false)
            }}
            className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-main transition hover:bg-surface-alt"
          >
            Light
          </button>

          {/* Dark */}
          <button
            onClick={() => {
              setMode('dark')
              setOpen(false)
            }}
            className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-main transition hover:bg-surface-alt"
          >
            Dark
          </button>

          <div className="my-2 h-px bg-token-muted" />

          {/* Custom Themes */}
          {CUSTOM_THEMES.map((themeItem) => (
            <button
              key={themeItem.key}
              onClick={() => applyCustom(themeItem.key)}
              className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-main transition hover:bg-surface-alt"
            >
              {themeItem.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
