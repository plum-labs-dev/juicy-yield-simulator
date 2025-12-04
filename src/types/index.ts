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

// ETH Products
export interface EthProduct {
  id: string
  protocol: string
  name: string
  apy: number
  isCollateralEligible: boolean
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
  borrowAsset: 'USDC' | 'USDT' | 'USDS'
  deployTargetId: string // which stablecoin product receives borrowed funds
}

// Stablecoin Products
export type RiskLevel = 'Low' | 'Medium'

export interface StablecoinProduct {
  id: string
  protocol: string
  name: string
  apy: number
  apyRange?: [number, number] // for variable APY products
  risk: RiskLevel
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
  asset: 'USDC' | 'USDT' | 'USDS'
  borrowRate: number
}

// Collateral Parameters (Aave V3)
export interface CollateralParams {
  maxLtv: number
  liquidationThreshold: number
}
