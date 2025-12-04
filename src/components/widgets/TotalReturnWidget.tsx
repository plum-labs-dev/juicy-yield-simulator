'use client'

import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { ETH_PRODUCTS, STABLECOIN_PRODUCTS, getBorrowRate } from '@/lib/constants'

export function TotalReturnWidget() {
  const {
    ethRatio,
    priceChangeScenario,
    ethAllocations,
    stablecoinAllocations,
    ethAmount,
    stablecoinAmount,
    totalBorrowedAmount,
  } = usePortfolioStore()

  // Calculate ETH APY (weighted average of selected products)
  const ethApy = ethAllocations.reduce((sum, allocation) => {
    if (allocation.weight > 0) {
      const product = ETH_PRODUCTS.find((p) => p.id === allocation.productId)
      if (product) {
        return sum + (allocation.weight / 100) * product.apy
      }
    }
    return sum
  }, 0)

  // Calculate Stablecoin APY (weighted average of selected products)
  const stablecoinApy = stablecoinAllocations.reduce((sum, allocation) => {
    if (allocation.weight > 0) {
      const product = STABLECOIN_PRODUCTS.find((p) => p.id === allocation.productId)
      if (product) {
        return sum + (allocation.weight / 100) * product.apy
      }
    }
    return sum
  }, 0)

  // Calculate leverage boost
  const leverageBoost = ethAllocations.reduce((sum, allocation) => {
    if (allocation.leverage?.enabled) {
      const positionValue = ethAmount() * (allocation.weight / 100)
      const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
      const borrowed = collateralValue * (allocation.leverage.ltv / 100)

      const deployTarget = STABLECOIN_PRODUCTS.find((p) => p.id === allocation.leverage!.deployTargetId)
      const deployApy = deployTarget?.apy ?? 0
      const borrowRate = getBorrowRate(allocation.leverage.borrowAsset)

      const netYield = borrowed * ((deployApy - borrowRate) / 100)
      return sum + netYield
    }
    return sum
  }, 0)

  const totalPosition = ethAmount() + stablecoinAmount() + totalBorrowedAmount()
  const baseApy = (ethRatio / 100) * ethApy + ((100 - ethRatio) / 100) * stablecoinApy
  const leverageBoostPercent = totalPosition > 0 ? (leverageBoost / totalPosition) * 100 : 0
  const portfolioApy = baseApy + leverageBoostPercent

  // Total return = APY yield + ETH price impact on ETH portion
  // ETH portion return = ETH APY + price change
  // The price change only affects the ETH portion of the portfolio
  const ethPortionReturn = (ethRatio / 100) * (ethApy + priceChangeScenario)
  const stablePortionReturn = ((100 - ethRatio) / 100) * stablecoinApy
  const totalReturn = ethPortionReturn + stablePortionReturn + leverageBoostPercent

  // Check if allocations are valid
  const ethTotal = ethAllocations.reduce((sum, a) => sum + a.weight, 0)
  const stableTotal = stablecoinAllocations.reduce((sum, a) => sum + a.weight, 0)
  const isValid = ethTotal === 100 && stableTotal === 100

  const isPositive = totalReturn >= 0

  return (
    <Card
      title="Total Return"
      className={`border-l-4 ${isValid && isPositive ? 'border-l-green-500' : isValid ? 'border-l-red-500' : 'border-l-gray-300'} h-full`}
    >
      <div>
        <span className={`text-4xl font-bold ${isValid ? (isPositive ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
          {isValid ? `${isPositive ? '+' : ''}${totalReturn.toFixed(2)}` : '—'}
        </span>
        <span className={`text-2xl font-medium ${isValid ? (isPositive ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
          %
        </span>
        {isValid && (
          <p className="text-sm text-gray-500 mt-2">
            incl. {priceChangeScenario >= 0 ? '+' : ''}{priceChangeScenario}% ETH
          </p>
        )}
        {!isValid && (
          <p className="text-xs text-amber-600 mt-2">
            Complete allocations to see return
          </p>
        )}
      </div>
    </Card>
  )
}
