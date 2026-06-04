/**
 * useAIFeedback Hook
 * Manages AI-powered feedback generation with caching and error handling
 * Designed for future integration with AI services
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { generateAIFeedback } from '../lib/feedbackService'

/**
 * Hook for managing AI feedback requests
 * Handles loading, caching, and error states
 */
export function useAIFeedback(options = {}) {
  const {
    enabled = false, // AI feedback disabled by default
    cacheTimeout = 3600000, // 1 hour cache by default
    retryCount = 2,
    onError = null,
  } = options

  const [feedbackCache, setFeedbackCache] = useState({})
  const [loading, setLoading] = useState({})
  const [errors, setErrors] = useState({})
  const requestTimestampsRef = useRef({})

  /**
   * Generate cache key for question + answer
   */
  const getCacheKey = useCallback((questionId, answerIndex) => {
    return `${questionId}:${answerIndex}`
  }, [])

  /**
   * Check if cached feedback is still valid
   */
  const isCacheValid = useCallback(
    (key) => {
      const timestamp = requestTimestampsRef.current[key]
      if (!timestamp) return false
      return Date.now() - timestamp < cacheTimeout
    },
    [cacheTimeout]
  )

  /**
   * Request AI feedback
   */
  const requestFeedback = useCallback(
    async (question, answerIndex) => {
      if (!enabled || !question) {
        return null
      }

      const key = getCacheKey(question.id, answerIndex)

      // Return cached if available
      if (feedbackCache[key] && isCacheValid(key)) {
        return feedbackCache[key]
      }

      // Set loading state
      setLoading((prev) => ({ ...prev, [key]: true }))
      setErrors((prev) => ({ ...prev, [key]: null }))

      try {
        // Request AI feedback with retry logic
        let feedback = null
        let attempt = 0

        while (attempt < retryCount && !feedback) {
          try {
            feedback = await generateAIFeedback(question, answerIndex)
            break
          } catch (error) {
            attempt++
            if (attempt >= retryCount) {
              throw error
            }
            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
          }
        }

        // Cache the result
        if (feedback) {
          setFeedbackCache((prev) => ({ ...prev, [key]: feedback }))
          requestTimestampsRef.current[key] = Date.now()
        }

        return feedback
      } catch (error) {
        console.error('AI feedback generation failed:', error)

        // Store error
        setErrors((prev) => ({ ...prev, [key]: error.message }))

        // Call error callback if provided
        onError?.(error, question, answerIndex)

        return null
      } finally {
        setLoading((prev) => ({ ...prev, [key]: false }))
      }
    },
    [enabled, feedbackCache, getCacheKey, isCacheValid, retryCount, onError]
  )

  /**
   * Batch request AI feedback
   */
  const requestBatchFeedback = useCallback(
    async (questions, answers) => {
      if (!enabled || !Array.isArray(questions)) {
        return {}
      }

      const requests = questions.map((question, index) => {
        const answerIndex = answers[index]
        if (answerIndex === null || answerIndex === undefined) {
          return Promise.resolve(null)
        }
        return requestFeedback(question, answerIndex)
      })

      const feedbackList = await Promise.all(requests)

      return feedbackList.reduce((acc, feedback, index) => {
        if (feedback) {
          acc[index] = feedback
        }
        return acc
      }, {})
    },
    [enabled, requestFeedback]
  )

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    setFeedbackCache({})
    requestTimestampsRef.current = {}
  }, [])

  /**
   * Get cache info
   */
  const getCacheInfo = useCallback(() => {
    return {
      size: Object.keys(feedbackCache).length,
      items: Object.keys(feedbackCache),
    }
  }, [feedbackCache])

  return {
    // State
    feedbackCache,
    loading,
    errors,
    isEnabled: enabled,

    // Methods
    requestFeedback,
    requestBatchFeedback,
    clearCache,
    getCacheInfo,
  }
}

export default useAIFeedback
