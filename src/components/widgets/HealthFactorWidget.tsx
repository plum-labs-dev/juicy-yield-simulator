'use client'

import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { ETH_PRODUCTS, getCollateralParams } from '@/lib/constants'

export function HealthFactorWidget() {
  const { ethAllocations, ethAmount } = usePortfolioStore()

  // Calculate aggregate health factor across all leveraged positions
  // Health Factor = (Total Collateral × Weighted Liquidation Threshold) / Total Borrowed
  const leverageStats = ethAllocations.reduce(
    (acc, allocation) => {
      if (allocation.leverage?.enabled) {
        const product = ETH_PRODUCTS.find((p) => p.id === allocation.productId)
        const collateralParams = getCollateralParams(allocation.productId)

        if (product && collateralParams) {
          const positionValue = ethAmount() * (allocation.weight / 100)
          const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
          const borrowedValue = collateralValue * (allocation.leverage.ltv / 100)

          acc.totalCollateral += collateralValue
          acc.totalBorrowed += borrowedValue
          acc.weightedThreshold += collateralValue * (collateralParams.liquidationThreshold / 100)
        }
      }
      return acc
    },
    { totalCollateral: 0, totalBorrowed: 0, weightedThreshold: 0 }
  )

  const hasLeverage = leverageStats.totalBorrowed > 0

  // Health Factor = Weighted Threshold / Total Borrowed
  const healthFactor = hasLeverage
    ? leverageStats.weightedThreshold / leverageStats.totalBorrowed
    : 0

  // Determine status
  const getStatus = (hf: number): { label: string; color: string; borderColor: string } => {
    if (hf >= 1.5) return { label: 'Safe', color: 'text-green-600', borderColor: 'border-l-green-500' }
    if (hf >= 1.2) return { label: 'Moderate', color: 'text-amber-600', borderColor: 'border-l-amber-500' }
    return { label: 'Risky', color: 'text-red-600', borderColor: 'border-l-red-500' }
  }

  const status = getStatus(healthFactor)

  if (!hasLeverage) {
    return (
      <Card title="Health Factor" className="border-l-4 border-l-gray-300 h-full">
        <div>
          <span className="text-4xl font-bold text-gray-300">—</span>
          <p className="text-xs text-gray-400 mt-2">No leverage active</p>
        </div>
      </Card>
    )
  }

  return (
    <Card title="Health Factor" className={`border-l-4 ${status.borderColor} h-full`}>
      <div>
        <span className={`text-4xl font-bold ${status.color}`}>
          {healthFactor.toFixed(2)}
        </span>
        <p className={`text-sm font-medium mt-2 ${status.color}`}>
          {status.label}
        </p>
      </div>
    </Card>
  )
}
