import { NextResponse } from 'next/server'
import type {
  DefiLlamaPoolsResponse,
  DefiLlamaBorrowResponse,
  DefiLlamaPool,
  DefiLlamaBorrowPool,
  CachedApyData,
  YieldsApiResponse,
} from '@/types'

// Server-side cache
let cachedData: CachedApyData | null = null
const CACHE_DURATION_MS = 3 * 60 * 60 * 1000 // 3 hours

// Pool IDs we care about (mapped to our product IDs)
// These must match the 'id' field in constants.ts
const POOL_IDS: Record<string, string> = {
  // ETH Products
  'lido-steth': '747c1d2a-c668-4682-b9f9-296708a3dd90',
  'etherfi-weeth': '46bd2bdf-6d92-4066-b482-e885ee172264',
  // Stablecoin Products
  'aave-usdc': 'aa70268e-4b52-42bf-a116-608b370f9501',
  'aave-usdt': 'f981a304-bb6c-45b8-b0c5-fd2f515ad23a',
  'ethena-susde': '66985a81-9c51-46ca-9977-42b4fe7bc6df',
  'maple-usdc': '43641cf5-a92e-416b-bce9-27113d3c0db6',
  'maple-usdt': '8edfdf02-cdbb-43f7-bca6-954e5fe56813',
}

// Pool filters for pools that need to be found by criteria
const POOL_FILTERS: Record<string, { project: string; symbol: string; pickHighest?: boolean }> = {
  // ETH Products (Pendle)
  'pendle-pt-wsteth': { project: 'pendle', symbol: 'WSTETH', pickHighest: false },
  'pendle-pt-weeth': { project: 'pendle', symbol: 'WEETH', pickHighest: false },
  // Stablecoin Products (Morpho - multiple vaults)
  'morpho-steakusdc': { project: 'morpho-v1', symbol: 'STEAKUSDC', pickHighest: true },
  'morpho-gtusdc': { project: 'morpho-v1', symbol: 'GTUSDC', pickHighest: true },
  'morpho-bbqusdc': { project: 'morpho-v1', symbol: 'BBQUSDC', pickHighest: true },
  'morpho-steakusdt': { project: 'morpho-v1', symbol: 'STEAKUSDT', pickHighest: true },
  // Pendle stablecoin PTs
  'pendle-pt-susde': { project: 'pendle', symbol: 'SUSDE', pickHighest: false },
  'pendle-pt-syrupusdc': { project: 'pendle', symbol: 'SYRUPUSDC', pickHighest: false },
}

// Borrow assets we track
const BORROW_ASSETS = ['USDC', 'USDT', 'USDS']

function isCacheValid(): boolean {
  if (!cachedData) return false
  const now = Date.now()
  return now - cachedData.timestamp < CACHE_DURATION_MS
}

async function fetchPoolsData(): Promise<DefiLlamaPool[]> {
  const response = await fetch('https://yields.llama.fi/pools', {
    next: { revalidate: CACHE_DURATION_MS / 1000 }, // Next.js fetch cache
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch pools: ${response.status}`)
  }

  const data: DefiLlamaPoolsResponse = await response.json()
  return data.data
}

async function fetchBorrowData(): Promise<DefiLlamaBorrowPool[]> {
  const response = await fetch('https://yields.llama.fi/poolsBorrow', {
    next: { revalidate: CACHE_DURATION_MS / 1000 },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch borrow rates: ${response.status}`)
  }

  const data: DefiLlamaBorrowResponse = await response.json()
  return data.data
}

function findPoolByFilter(
  pools: DefiLlamaPool[],
  filter: { project: string; symbol: string; pickHighest?: boolean }
): DefiLlamaPool | undefined {
  const matches = pools.filter(
    (p) =>
      p.chain === 'Ethereum' &&
      p.project === filter.project &&
      p.symbol.toUpperCase() === filter.symbol.toUpperCase()
  )

  if (matches.length === 0) return undefined

  if (filter.pickHighest) {
    // Return the one with highest APY (for Morpho vaults)
    return matches.reduce((best, current) => (current.apy > best.apy ? current : best))
  }

  // Return the one with highest TVL (most liquid/reliable)
  return matches.reduce((best, current) => (current.tvlUsd > best.tvlUsd ? current : best))
}

function findBorrowRate(
  borrowPools: DefiLlamaBorrowPool[],
  asset: string
): number | undefined {
  // Find Aave V3 Ethereum borrow rate for the asset
  const pool = borrowPools.find(
    (p) =>
      p.chain === 'Ethereum' &&
      p.project === 'aave-v3' &&
      p.symbol.toUpperCase() === asset.toUpperCase() &&
      p.apyBaseBorrow !== undefined &&
      p.totalBorrowUsd !== undefined &&
      p.totalBorrowUsd > 1000000 // Filter for main pool (>$1M borrowed)
  )

  return pool?.apyBaseBorrow
}

async function fetchAndProcessData(): Promise<CachedApyData> {
  const [pools, borrowPools] = await Promise.all([fetchPoolsData(), fetchBorrowData()])

  const poolApys: Record<string, number> = {}

  // Process direct pool ID lookups
  for (const [productId, poolId] of Object.entries(POOL_IDS)) {
    const pool = pools.find((p) => p.pool === poolId)
    if (pool) {
      poolApys[productId] = pool.apy
    }
  }

  // Process filter-based lookups
  for (const [productId, filter] of Object.entries(POOL_FILTERS)) {
    const pool = findPoolByFilter(pools, filter)
    if (pool) {
      poolApys[productId] = pool.apy
    }
  }

  // Process borrow rates
  const borrowRates: Record<string, number> = {}
  for (const asset of BORROW_ASSETS) {
    const rate = findBorrowRate(borrowPools, asset)
    if (rate !== undefined) {
      borrowRates[asset] = rate
    }
  }

  return {
    timestamp: Date.now(),
    poolApys,
    borrowRates,
  }
}

export async function GET(): Promise<NextResponse<YieldsApiResponse>> {
  try {
    // Return cached data if valid
    if (isCacheValid() && cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
      })
    }

    // Fetch fresh data
    const data = await fetchAndProcessData()
    cachedData = data

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error fetching yields:', error)

    // Return stale cache if available
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
