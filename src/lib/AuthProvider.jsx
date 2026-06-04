import React, { createContext, useContext, useEffect, useState } from 'react'
import supabase from './supabaseClient'

const AuthContext = createContext({
  user: null,
  loading: true,
  error: '',
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [profileName, setProfileName] = useState('Learner')

  // =========================================
  // AUTH + SESSION RESTORATION
  // =========================================
  useEffect(() => {
    if (supabase.configError) {
      setError(supabase.configError)
      setLoading(false)
      return undefined
    }

    let mounted = true

    async function loadSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const currentUser = session?.user ?? null

        if (mounted) {
          setUser(currentUser)
          setLoading(false)
          setError('')
        }

        if (currentUser?.id) {
          window.localStorage.setItem(
            'academee_last_user_id',
            currentUser.id
          )
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.error) {
          console.error('Session restoration failed', err)
        }

        if (mounted) {
          setError('We could not restore your session. Please refresh and try again.')
        }

        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (supabase.configError) return

        const currentUser = session?.user ?? null

        setUser(currentUser)
        setError('')

        if (currentUser?.id) {
          window.localStorage.setItem(
            'academee_last_user_id',
            currentUser.id
          )
        } else {
          window.localStorage.removeItem(
            'academee_last_user_id'
          )
        }

        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // =========================================
  // APP VISIBILITY EFFECT
  // =========================================
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 100)

    return () => clearTimeout(t)
  }, [])

  // =========================================
  // PROFILE FETCHING
  // =========================================
  useEffect(() => {
    let mounted = true

    const getProfile = async () => {
      if (!user) {
        if (mounted) setProfileName('Learner')
        return
      }

      try {
        const { data, error, status } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .maybeSingle()

        if (!mounted) return

        if (data && !error && data.display_name) {
          setProfileName(data.display_name)
        } else {
          setProfileName(
            user.user_metadata?.display_name ||
              user.user_metadata?.full_name ||
              user.email ||
              'Learner'
          )

          if (status === 406) {
            if (typeof console !== 'undefined' && console.warn) {
              console.warn('Profile query returned 406; falling back to user metadata')
            }
          }
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.error) {
          console.error('Profile lookup failed', err)
        }

        if (mounted) {
          setProfileName(
            user.user_metadata?.display_name ||
              user.user_metadata?.full_name ||
              user.email ||
              'Learner'
          )
        }
      }
    }

    getProfile()

    return () => {
      mounted = false
    }
  }, [user])

  const value = {
    user,
    loading,
    error,
    isVisible,
    profileName,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext