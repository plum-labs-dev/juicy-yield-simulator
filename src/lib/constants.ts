import type {
  EthProduct,
  StablecoinProduct,
  BorrowOption,
  CollateralParams,
} from '@/types'

// ETH Exposure Products
export const ETH_PRODUCTS: EthProduct[] = [
  {
    id: 'lido-steth',
    protocol: 'Lido',
    name: 'stETH',
    apy: 2.65,
    isCollateralEligible: true, // as wstETH
  },
  {
    id: 'etherfi-weeth',
    protocol: 'Ether.fi',
    name: 'weETH',
    apy: 3.17,
    isCollateralEligible: true,
  },
  {
    id: 'pendle-pt-wsteth',
    protocol: 'Pendle',
    name: 'PT-wstETH',
    apy: 2.9,
    isCollateralEligible: false, // fixed yield, no collateral
  },
  {
    id: 'pendle-pt-weeth',
    protocol: 'Pendle',
    name: 'PT-weETH',
    apy: 2.7,
    isCollateralEligible: false, // fixed yield, no collateral
  },
]

// Stablecoin Exposure Products
export const STABLECOIN_PRODUCTS: StablecoinProduct[] = [
  {
    id: 'aave-usdc',
    protocol: 'Aave V3',
    name: 'USDC',
    apy: 3.4,
    risk: 'Low',
  },
  {
    id: 'aave-usdt',
    protocol: 'Aave V3',
    name: 'USDT',
    apy: 4.3,
    risk: 'Low',
  },
  {
    id: 'morpho-steakusdc',
    protocol: 'Morpho',
    name: 'steakUSDC',
    apy: 4.0,
    apyRange: [3.7, 4.2],
    risk: 'Low',
  },
  {
    id: 'morpho-gtusdc',
    protocol: 'Morpho',
    name: 'GTUSDC',
    apy: 4.4,
    apyRange: [3.7, 5.1],
    risk: 'Low',
  },
  {
    id: 'morpho-bbqusdc',
    protocol: 'Morpho',
    name: 'BBQUSDC',
    apy: 7.2,
    apyRange: [6.9, 7.5],
    risk: 'Medium',
  },
  {
    id: 'morpho-steakusdt',
    protocol: 'Morpho',
    name: 'steakUSDT',
    apy: 6.2,
    apyRange: [4.6, 7.8],
    risk: 'Low',
  },
  {
    id: 'ethena-susde',
    protocol: 'Ethena',
    name: 'sUSDe',
    apy: 4.9,
    risk: 'Medium',
  },
  {
    id: 'maple-syrup-usdc',
    protocol: 'Maple',
    name: 'Syrup USDC',
    apy: 6.8,
    risk: 'Medium',
  },
  {
    id: 'maple-syrup-usdt',
    protocol: 'Maple',
    name: 'Syrup USDT',
    apy: 6.2,
    risk: 'Medium',
  },
  {
    id: 'pendle-pt-susde',
    protocol: 'Pendle',
    name: 'PT-sUSDe',
    apy: 5.9,
    risk: 'Medium',
  },
  {
    id: 'pendle-pt-syrupusdc',
    protocol: 'Pendle',
    name: 'PT-syrupUSDC',
    apy: 6.5,
    risk: 'Medium',
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

// Helper to get borrow rate by asset
export function getBorrowRate(asset: 'USDC' | 'USDT' | 'USDS'): number {
  const option = BORROW_OPTIONS.find((o) => o.asset === asset)
  return option?.borrowRate ?? 5.5
}
