'use client'

import { create } from 'zustand'
import type { CachedApyData, YieldsApiResponse } from '@/types'

const CACHE_KEY = 'juicy-yield-apy-cache'
const CACHE_DURATION_MS = 3 * 60 * 60 * 1000 // 3 hours

interface ApyState {
  // Data
  poolApys: Record<string, number>
  borrowRates: Record<string, number>
  lastUpdated: number | null

  // Status
  isLoading: boolean
  isLive: boolean // true if using real-time data, false if using fallbacks
  error: string | null

  // Actions
  fetchApys: () => Promise<void>
  getApy: (productId: string, fallback: number) => number
  getBorrowRate: (asset: 'USDC' | 'USDT' | 'USDS', fallback: number) => number
  isCacheValid: () => boolean
}

function loadFromLocalStorage(): CachedApyData | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const data: CachedApyData = JSON.parse(cached)
    return data
  } catch {
    return null
  }
}

function saveToLocalStorage(data: CachedApyData): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // Ignore storage errors
  }
}

function isCacheExpired(timestamp: number): boolean {
  return Date.now() - timestamp > CACHE_DURATION_MS
}

export const useApyStore = create<ApyState>((set, get) => ({
  // Initial state
  poolApys: {},
  borrowRates: {},
  lastUpdated: null,
  isLoading: false,
  isLive: false,
  error: null,

  isCacheValid: () => {
    const { lastUpdated } = get()
    if (!lastUpdated) return false
    return !isCacheExpired(lastUpdated)
  },

  fetchApys: async () => {
    const state = get()

    // Don't fetch if already loading
    if (state.isLoading) return

    // Check localStorage cache first
    const cached = loadFromLocalStorage()
    if (cached && !isCacheExpired(cached.timestamp)) {
      set({
        poolApys: cached.poolApys,
        borrowRates: cached.borrowRates,
        lastUpdated: cached.timestamp,
        isLive: true,
        error: null,
      })
      return
    }

    // Fetch from API
    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/yields')
      const result: YieldsApiResponse = await response.json()

      if (result.success && result.data) {
        const { poolApys, borrowRates, timestamp } = result.data

        // Save to localStorage
        saveToLocalStorage(result.data)

        set({
          poolApys,
          borrowRates,
          lastUpdated: timestamp,
          isLoading: false,
          isLive: true,
          error: null,
        })
      } else {
        throw new Error(result.error || 'Failed to fetch APY data')
      }
    } catch (error) {
      // If fetch fails but we have stale cache, use it
      if (cached) {
        set({
          poolApys: cached.poolApys,
          borrowRates: cached.borrowRates,
          lastUpdated: cached.timestamp,
          isLoading: false,
          isLive: true, // Still "live" data, just stale
          error: 'Using cached data (fetch failed)',
        })
      } else {
        set({
          isLoading: false,
          isLive: false,
          error: error instanceof Error ? error.message : 'Failed to fetch APY data',
        })
      }
    }
  },

  getApy: (productId: string, fallback: number) => {
    const { poolApys } = get()
    return poolApys[productId] ?? fallback
  },

  getBorrowRate: (asset: 'USDC' | 'USDT' | 'USDS', fallback: number) => {
    const { borrowRates } = get()
    return borrowRates[asset] ?? fallback
  },
}))

// Hook to auto-fetch on mount
export function useApyData() {
  const { fetchApys, isLoading, isLive, error, lastUpdated, isCacheValid } = useApyStore()

  // Fetch on mount if cache is invalid
  if (typeof window !== 'undefined' && !isLoading && !isCacheValid()) {
    fetchApys()
  }

  return {
    isLoading,
    isLive,
    error,
    lastUpdated,
    refresh: fetchApys,
  }
}
