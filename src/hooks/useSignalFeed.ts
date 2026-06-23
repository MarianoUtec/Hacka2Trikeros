import { useState, useEffect, useCallback, useRef } from 'react'
import { getSignalFeed } from '@/api/endpoints'
import type { Signal, SignalFeedFilters } from '@/types'
import axios from 'axios'

interface UseSignalFeedResult {
  items: Signal[]
  hasMore: boolean
  totalEstimate: number
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  loadMore: () => void
  updateItem: (updated: Signal) => void
}

export function useSignalFeed(filters: SignalFeedFilters): UseSignalFeedResult {
  const [items, setItems] = useState<Signal[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalEstimate, setTotalEstimate] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inFlightRef = useRef(false)

  // Reset when filters change
  useEffect(() => {
    const controller = new AbortController()
    setItems([])
    setCursor(null)
    setHasMore(true)
    setError(null)
    setIsLoading(true)
    inFlightRef.current = false

    getSignalFeed(
      {
        limit: 15,
        signalType: filters.signalType || undefined,
        severity: filters.severity || undefined,
        status: filters.status || undefined,
        q: filters.q || undefined,
      },
      controller.signal
    )
      .then((res) => {
        setItems(res.items)
        setCursor(res.nextCursor)
        setHasMore(res.hasMore)
        setTotalEstimate(res.totalEstimate)
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError('Error al cargar señales. Intenta de nuevo.')
        }
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [filters.signalType, filters.severity, filters.status, filters.q])

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || inFlightRef.current || !cursor) return

    inFlightRef.current = true
    setIsLoadingMore(true)
    setError(null)

    const controller = new AbortController()

    getSignalFeed(
      {
        cursor,
        limit: 15,
        signalType: filters.signalType || undefined,
        severity: filters.severity || undefined,
        status: filters.status || undefined,
        q: filters.q || undefined,
      },
      controller.signal
    )
      .then((res) => {
        setItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.id))
          const fresh = res.items.filter((i) => !existingIds.has(i.id))
          return [...prev, ...fresh]
        })
        setCursor(res.nextCursor)
        setHasMore(res.hasMore)
        setTotalEstimate(res.totalEstimate)
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError('Error al cargar más señales.')
        }
      })
      .finally(() => {
        setIsLoadingMore(false)
        inFlightRef.current = false
      })
  }, [cursor, hasMore, isLoadingMore, filters])

  const updateItem = useCallback((updated: Signal) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
  }, [])

  return { items, hasMore, totalEstimate, isLoading, isLoadingMore, error, loadMore, updateItem }
}
