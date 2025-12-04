'use client'

import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { ETH_PRODUCTS, getCollateralParams } from '@/lib/constants'

export function LiquidationPriceWidget() {
  const { ethAllocations, ethAmount, ethPrice } = usePortfolioStore()

  // Calculate aggregate liquidation price
  // Liquidation occurs when Health Factor = 1
  // HF = (Collateral × LiqThreshold) / Borrowed = 1
  // At liquidation: Collateral_new × LiqThreshold = Borrowed
  // Price_drop_ratio = Collateral_new / Collateral_current
  // Liquidation_Price = Current_Price × (Borrowed / (Collateral × LiqThreshold))

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

  // Liquidation price calculation
  // When collateral value drops such that HF = 1
  // liquidation_price = current_price × (borrowed / weighted_threshold)
  const liquidationPrice = hasLeverage
    ? ethPrice * (leverageStats.totalBorrowed / leverageStats.weightedThreshold)
    : 0

  const dropPercent = hasLeverage
    ? ((ethPrice - liquidationPrice) / ethPrice) * 100
    : 0

  const formatPrice = (price: number): string => {
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  if (!hasLeverage) {
    return (
      <Card title="Liquidation Price" className="border-l-4 border-l-gray-300 h-full">
        <div>
          <span className="text-4xl font-bold text-gray-300">—</span>
          <p className="text-xs text-gray-400 mt-2">No leverage active</p>
        </div>
      </Card>
    )
  }

  return (
    <Card title="Liquidation Price" className="border-l-4 border-l-red-500 h-full">
      <div>
        <span className="text-4xl font-bold text-red-600">
          {formatPrice(liquidationPrice)}
        </span>
        <p className="text-sm text-red-500 mt-2">
          -{dropPercent.toFixed(0)}% from current
        </p>
      </div>
    </Card>
  )
}
