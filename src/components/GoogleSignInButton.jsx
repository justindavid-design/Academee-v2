import React, { useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'

/**
 * Google Sign-In Button Component
 * Initializes Google Sign-In and handles authentication flow
 */
export default function GoogleSignInButton({ 
  onSuccess, 
  onError, 
  theme = 'outline',
  size = 'large',
  text = 'signin_with',
  disabled = false 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Initialize Google Sign-In when component mounts
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
        auto_select: false,
      })
    } else {
      console.warn('Google Sign-In SDK not loaded')
    }

    return () => {
      // Cleanup
      if (window.google) {
        window.google.accounts.id.cancel()
      }
    }
  }, [])

  /**
   * Handle Google Sign-In response
   * @param {Object} response - Google ID token response
   */
  const handleGoogleSignIn = async (response) => {
    setIsLoading(true)
    setError(null)

    try {
      if (!response.credential) {
        throw new Error('No credential received from Google')
      }

      // Send ID token to backend for verification
      const backendResponse = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: response.credential,
        }),
      })

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json()
        throw new Error(errorData.error || 'Authentication failed')
      }

      const data = await backendResponse.json()

      // Create Supabase session with the returned user data
      // This is critical: RequireAuth checks for Supabase session to allow access
      if (data.user && data.token) {
        // Set up Supabase session so AuthProvider recognizes the user
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.token,
          refresh_token: data.refreshToken || data.token,
        })
        
        if (sessionError) {
          console.warn('Failed to set Supabase session:', sessionError)
          // Still proceed - we have the token stored
        }

        // Store tokens for API requests
        sessionStorage.setItem('auth_token', data.token)
        sessionStorage.setItem('user_id', data.user.id)
        if (data.refreshToken) {
          sessionStorage.setItem('refresh_token', data.refreshToken)
        }

        // Call success callback
        if (onSuccess) {
          onSuccess(data.user)
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to sign in with Google'
      setError(errorMessage)

      if (onError) {
        onError(errorMessage)
      }

      console.error('Google Sign-In error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Render Google Sign-In button using Google's official button
   */
  const renderGoogleButton = () => {
    // Use setTimeout to ensure Google library is ready
    setTimeout(() => {
      if (window.google) {
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            type: 'standard',
            theme,
            size,
            text,
            logo_alignment: 'left',
          }
        )
      }
    }, 100)

    return <div id="google-signin-button" />
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
        {renderGoogleButton()}
      </div>

      {isLoading && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Signing in...
        </div>
      )}
    </div>
  )
}
