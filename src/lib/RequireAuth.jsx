import React from 'react'
import Loading from './../components/Loading'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export default function RequireAuth({ children }) {
  const { user, loading, error } = useAuth()
  const loc = useLocation()

  if (loading) return <div className="p-8"><Loading message="Checking authentication..." /></div>
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 py-12">
        <div className="theme-card max-w-lg rounded-2xl p-8 text-center shadow-card">
          <p className="text-sm font-semibold tracking-wide text-muted">Authentication unavailable</p>
          <h1 className="mt-2 text-2xl font-bold text-main">Academee could not verify your session</h1>
          <p className="mt-2 text-muted">{error}</p>
          <a href="/login" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary-token px-4 py-2 font-semibold text-white transition hover:bg-primary-hover">
            Go to login
          </a>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />
  return children
}
