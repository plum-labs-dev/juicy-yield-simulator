// Portfolio State Types

export interface PortfolioState {
  // Portfolio Setup
  investmentAmount: number
  ethRatio: number // 0-100, stableRatio = 100 - ethRatio

  // ETH Price & Scenario
  ethPrice: number
  priceChangeScenario: number // percentage, e.g., 20 for +20%

  // Computed (derived from above)
  ethAmount: number
  stablecoinAmount: number
}

// Yield denomination types
export type YieldType = 'ETH' | 'USD'

// ETH Products
export interface EthProduct {
  id: string
  protocol: string
  name: string
  apy: number // fallback/default APY
  isCollateralEligible: boolean
  yieldType: YieldType
  poolId?: string // DeFiLlama pool UUID for direct lookup
  poolFilter?: PoolFilter // Alternative: filter criteria for finding pool
}

// Pool filter for finding pools in DeFiLlama API
export interface PoolFilter {
  project: string
  symbol: string
  chain?: string // defaults to 'Ethereum'
}

export interface EthAllocation {
  productId: string
  selected: boolean
  weight: number // 0-100
  leverage?: LeverageConfig
}

// Leverage Configuration
export interface LeverageConfig {
  enabled: boolean
  collateralPercent: number // 0-100, how much of position to use
  ltv: number // 0 to maxLtv
  borrowAsset: 'USDC' | 'USDe'
  deployTargetId: string // which stablecoin product receives borrowed funds
}

// Stablecoin Products
export type RiskLevel = 'Low' | 'Medium'

export interface StablecoinProduct {
  id: string
  protocol: string
  name: string
  apy: number // fallback/default APY
  apyRange?: [number, number] // for variable APY products
  risk: RiskLevel
  yieldType: YieldType
  poolId?: string // DeFiLlama pool UUID for direct lookup
  poolFilter?: PoolFilter // Alternative: filter criteria for finding pool
}

export interface StablecoinAllocation {
  productId: string
  selected: boolean
  weight: number // 0-100 (base allocation)
}

export interface LeveragedStablecoinAllocation {
  productId: string
  weight: number // 0-100 (of total borrowed amount)
}

// Borrow Options
export interface BorrowOption {
  asset: 'USDC' | 'USDe'
  borrowRate: number
}

// ETH Short Hedge Configuration (Hyperliquid)
export interface HedgeConfig {
  enabled: boolean
  allocationPercent: number // % of total investment allocated to hedge
  fundAllocation: number // % of hedge funds to deploy as margin (0-100)
  leverage: number // 1-25x
}

// Hyperliquid API Response Types
export interface HyperliquidAssetCtx {
  funding: string // hourly funding rate as string
  openInterest: string
  prevDayPx: string
  dayNtlVlm: string
  premium: string
  oraclePx: string
  markPx: string
  midPx: string
  impactPxs: [string, string]
  dayBaseVlm: string
}

export interface HyperliquidMeta {
  universe: Array<{
    szDecimals: number
    name: string
    maxLeverage: number
    marginTableId: number
  }>
}

export interface HyperliquidMetaAndAssetCtxs {
  0: HyperliquidMeta
  1: HyperliquidAssetCtx[]
}

// Collateral Parameters (Aave V3)
export interface CollateralParams {
  maxLtv: number
  liquidationThreshold: number
}

// DeFiLlama API Response Types
export interface DefiLlamaPool {
  pool: string // UUID
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apy: number
  apyBase?: number
  apyReward?: number
  rewardTokens?: string[]
  apyPct1D?: number
  apyPct7D?: number
  apyPct30D?: number
  stablecoin: boolean
  ilRisk: string
  exposure: string
  poolMeta?: string
}

export interface DefiLlamaBorrowPool extends DefiLlamaPool {
  apyBaseBorrow?: number
  apyRewardBorrow?: number
  totalSupplyUsd?: number
  totalBorrowUsd?: number
  ltv?: number
}

export interface DefiLlamaPoolsResponse {
  status: string
  data: DefiLlamaPool[]
}

export interface DefiLlamaBorrowResponse {
  status: string
  data: DefiLlamaBorrowPool[]
}

// Cached APY data structure
export interface CachedApyData {
  timestamp: number // Unix timestamp when cached
  poolApys: Record<string, number> // poolId or productId -> APY
  borrowRates: Record<string, number> // asset (USDC, USDe) -> borrow rate
}

// API route response
export interface YieldsApiResponse {
  success: boolean
  data?: CachedApyData
  error?: string
}
