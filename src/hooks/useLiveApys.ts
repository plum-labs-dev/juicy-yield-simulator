'use client'

import { useEffect } from 'react'
import { useApyStore } from '@/store/apyStore'
import {
  ETH_PRODUCTS,
  STABLECOIN_PRODUCTS,
  getFallbackBorrowRate,
} from '@/lib/constants'
import type { EthProduct, StablecoinProduct } from '@/types'

// Hook to get products with live APYs
export function useLiveProducts() {
  const {
    poolApys,
    isLive,
    isLoading,
    lastUpdated,
    error,
    fetchApys,
    isCacheValid,
  } = useApyStore()

  // Fetch on mount if cache is invalid
  useEffect(() => {
    if (!isCacheValid() && !isLoading) {
      fetchApys()
    }
  }, [fetchApys, isCacheValid, isLoading])

  // Map ETH products with live APYs
  const ethProducts: EthProduct[] = ETH_PRODUCTS.map((product) => ({
    ...product,
    apy: poolApys[product.id] ?? product.apy,
  }))

  // Map Stablecoin products with live APYs
  const stablecoinProducts: StablecoinProduct[] = STABLECOIN_PRODUCTS.map((product) => ({
    ...product,
    apy: poolApys[product.id] ?? product.apy,
  }))

  return {
    ethProducts,
    stablecoinProducts,
    isLive,
    isLoading,
    lastUpdated,
    error,
    refresh: fetchApys,
  }
}

// Hook to get live borrow rate
export function useLiveBorrowRate(asset: 'USDC' | 'USDT' | 'USDS'): number {
  const { borrowRates } = useApyStore()
  const fallback = getFallbackBorrowRate(asset)
  return borrowRates[asset] ?? fallback
}

// Hook to get a single product's live APY
export function useLiveApy(productId: string, fallback: number): number {
  const { poolApys } = useApyStore()
  return poolApys[productId] ?? fallback
}

// Hook for APY status (for UI indicators)
export function useApyStatus() {
  const { isLive, isLoading, lastUpdated, error, fetchApys, isCacheValid } = useApyStore()

  return {
    isLive,
    isLoading,
    lastUpdated,
    error,
    refresh: fetchApys,
    canRefresh: !isLoading && !isCacheValid(),
  }
}
