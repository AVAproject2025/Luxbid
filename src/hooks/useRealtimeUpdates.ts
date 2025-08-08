'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseRealtimeUpdatesOptions {
  interval?: number
  enabled?: boolean
}

export function useRealtimeUpdates<T>(
  fetchFunction: () => Promise<T>,
  options: UseRealtimeUpdatesOptions = {}
) {
  const { interval = 5000, enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const result = await fetchFunction()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [fetchFunction])

  useEffect(() => {
    if (!enabled) return

    // Initial fetch
    fetchData()

    // Set up polling
    const intervalId = setInterval(fetchData, interval)

    return () => {
      clearInterval(intervalId)
    }
  }, [fetchData, interval, enabled])

  const refetch = useCallback(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch
  }
}
