import type {
  EthProduct,
  StablecoinProduct,
  BorrowOption,
  CollateralParams,
} from '@/types'

// ETH Exposure Products
// poolId: DeFiLlama UUID for direct lookup
// apy: fallback value if API unavailable
export const ETH_PRODUCTS: EthProduct[] = [
  {
    id: 'lido-steth',
    protocol: 'Lido',
    name: 'stETH',
    apy: 2.65,
    isCollateralEligible: true, // as wstETH
    yieldType: 'ETH', // Yield paid in stETH (rebasing)
    poolId: '747c1d2a-c668-4682-b9f9-296708a3dd90',
  },
  {
    id: 'etherfi-weeth',
    protocol: 'Ether.fi',
    name: 'weETH',
    apy: 3.17,
    isCollateralEligible: true,
    yieldType: 'ETH', // Yield accrues as weETH value vs ETH
    poolId: '46bd2bdf-6d92-4066-b482-e885ee172264',
  },
  {
    id: 'pendle-pt-wsteth',
    protocol: 'Pendle',
    name: 'PT-wstETH',
    apy: 2.9,
    isCollateralEligible: false, // fixed yield, no collateral
    yieldType: 'ETH', // Redeems for wstETH at maturity
    poolFilter: { project: 'pendle', symbol: 'WSTETH' },
  },
  {
    id: 'pendle-pt-weeth',
    protocol: 'Pendle',
    name: 'PT-weETH',
    apy: 2.7,
    isCollateralEligible: false, // fixed yield, no collateral
    yieldType: 'ETH', // Redeems for weETH at maturity
    poolFilter: { project: 'pendle', symbol: 'WEETH' },
  },
]

// Stablecoin Exposure Products
// poolId: DeFiLlama UUID for direct lookup
// poolFilter: criteria to find pool in API response
// apy: fallback value if API unavailable
export const STABLECOIN_PRODUCTS: StablecoinProduct[] = [
  {
    id: 'aave-usdc',
    protocol: 'Aave V3',
    name: 'USDC',
    apy: 3.4,
    risk: 'Low',
    yieldType: 'USD',
    poolId: 'aa70268e-4b52-42bf-a116-608b370f9501',
  },
  {
    id: 'aave-usdt',
    protocol: 'Aave V3',
    name: 'USDT',
    apy: 4.3,
    risk: 'Low',
    yieldType: 'USD',
    poolId: 'f981a304-bb6c-45b8-b0c5-fd2f515ad23a',
  },
  {
    id: 'morpho-steakusdc',
    protocol: 'Morpho',
    name: 'steakUSDC',
    apy: 4.0,
    apyRange: [3.7, 4.2],
    risk: 'Low',
    yieldType: 'USD',
    poolFilter: { project: 'morpho-v1', symbol: 'STEAKUSDC' },
  },
  {
    id: 'morpho-gtusdc',
    protocol: 'Morpho',
    name: 'GTUSDC',
    apy: 4.4,
    apyRange: [3.7, 5.1],
    risk: 'Low',
    yieldType: 'USD',
    poolFilter: { project: 'morpho-v1', symbol: 'GTUSDC' },
  },
  {
    id: 'morpho-bbqusdc',
    protocol: 'Morpho',
    name: 'BBQUSDC',
    apy: 7.2,
    apyRange: [6.9, 7.5],
    risk: 'Medium',
    yieldType: 'USD',
    poolFilter: { project: 'morpho-v1', symbol: 'BBQUSDC' },
  },
  {
    id: 'morpho-steakusdt',
    protocol: 'Morpho',
    name: 'steakUSDT',
    apy: 6.2,
    apyRange: [4.6, 7.8],
    risk: 'Low',
    yieldType: 'USD',
    poolFilter: { project: 'morpho-v1', symbol: 'STEAKUSDT' },
  },
  {
    id: 'ethena-susde',
    protocol: 'Ethena',
    name: 'sUSDe',
    apy: 4.9,
    risk: 'Medium',
    yieldType: 'USD',
    poolId: '66985a81-9c51-46ca-9977-42b4fe7bc6df',
  },
  {
    id: 'maple-usdc',
    protocol: 'Maple',
    name: 'Syrup USDC',
    apy: 6.8,
    risk: 'Medium',
    yieldType: 'USD',
    poolId: '43641cf5-a92e-416b-bce9-27113d3c0db6',
  },
  {
    id: 'maple-usdt',
    protocol: 'Maple',
    name: 'Syrup USDT',
    apy: 6.2,
    risk: 'Medium',
    yieldType: 'USD',
    poolId: '8edfdf02-cdbb-43f7-bca6-954e5fe56813',
  },
  {
    id: 'pendle-pt-susde',
    protocol: 'Pendle',
    name: 'PT-sUSDe',
    apy: 5.9,
    risk: 'Medium',
    yieldType: 'USD',
    poolFilter: { project: 'pendle', symbol: 'SUSDE' },
  },
  {
    id: 'pendle-pt-syrupusdc',
    protocol: 'Pendle',
    name: 'PT-syrupUSDC',
    apy: 6.5,
    risk: 'Medium',
    yieldType: 'USD',
    poolFilter: { project: 'pendle', symbol: 'SYRUPUSDC' },
  },
]

// Borrow Options (Aave V3)
export const BORROW_OPTIONS: BorrowOption[] = [
  {
    asset: 'USDC',
    borrowRate: 5.5,
  },
  {
    asset: 'USDT',
    borrowRate: 6.0,
  },
  {
    asset: 'USDS',
    borrowRate: 4.5,
  },
]

// Collateral Parameters (Aave V3)
export const COLLATERAL_PARAMS: Record<string, CollateralParams> = {
  'lido-steth': {
    maxLtv: 80,
    liquidationThreshold: 82.5,
  },
  'etherfi-weeth': {
    maxLtv: 75,
    liquidationThreshold: 78,
  },
}

// Helper to get collateral params by product id
export function getCollateralParams(productId: string): CollateralParams | null {
  return COLLATERAL_PARAMS[productId] || null
}

// Helper to get borrow rate by asset (fallback only - use useApyStore for live rates)
export function getBorrowRate(asset: 'USDC' | 'USDT' | 'USDS'): number {
  const option = BORROW_OPTIONS.find((o) => o.asset === asset)
  return option?.borrowRate ?? 5.5
}

// Helper to get fallback borrow rate
export function getFallbackBorrowRate(asset: 'USDC' | 'USDT' | 'USDS'): number {
  const option = BORROW_OPTIONS.find((o) => o.asset === asset)
  return option?.borrowRate ?? 5.5
}
