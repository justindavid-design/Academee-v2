import React, { useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { MotionConfig } from 'framer-motion'
import { AuthProvider } from './lib/AuthProvider'
import { AccountProvider } from './lib/AccountContext'
import useTheme from './lib/useTheme'
import useAccessibilitySettings from './accessibility/useAccessibilitySettings'
import FocusReader from './components/accessibility/FocusReader'

function ThemeBootstrap() {
  useTheme()
  return null
}

function ThemedShell() {
  const { theme } = useTheme()
  const { reducedMotion } = useAccessibilitySettings()

  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
      // Resolve CSS variables to concrete color strings for MUI
      primary: {
        main: (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--primary'))
          ? getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
          : '#4f46e5',
      },
      background: {
        default: (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--app-bg'))
          ? getComputedStyle(document.documentElement).getPropertyValue('--app-bg').trim()
          : '#f5f7fb',
        paper: (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--surface-bg'))
          ? getComputedStyle(document.documentElement).getPropertyValue('--surface-bg').trim()
          : '#ffffff',
      },
      text: {
        primary: (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--text-main'))
          ? getComputedStyle(document.documentElement).getPropertyValue('--text-main').trim()
          : '#1d2433',
        secondary: (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--text-muted'))
          ? getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim()
          : '#5b6475',
      },
    },
    typography: {
      fontFamily: 'Nunito, sans-serif',
      h1: { fontFamily: 'Nunito, sans-serif', fontWeight: 800 },
      h2: { fontFamily: 'Nunito, sans-serif', fontWeight: 800 },
      h3: { fontFamily: 'Nunito, sans-serif', fontWeight: 700 },
      h4: { fontFamily: 'Nunito, sans-serif', fontWeight: 700 },
      h5: { fontFamily: 'Nunito, sans-serif', fontWeight: 700 },
      h6: { fontFamily: 'Nunito, sans-serif', fontWeight: 700 },
      button: {
        fontFamily: 'Nunito, sans-serif',
        textTransform: 'none',
      },
    },
  }), [theme])

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'user'}>
      <ThemeProvider theme={muiTheme}>
        <AuthProvider>
          <AccountProvider>
            <ThemeBootstrap />
            <FocusReader />
            <App />
          </AccountProvider>
        </AuthProvider>
      </ThemeProvider>
    </MotionConfig>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemedShell />
  </React.StrictMode>
)
