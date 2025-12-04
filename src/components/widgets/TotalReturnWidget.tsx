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

  // Calculate deployment percentage
  const ethTotal = ethAllocations.reduce((sum, a) => sum + a.weight, 0)
  const stableTotal = stablecoinAllocations.reduce((sum, a) => sum + a.weight, 0)
  const ethDeployed = (ethRatio / 100) * (ethTotal / 100)
  const stableDeployed = ((100 - ethRatio) / 100) * (stableTotal / 100)
  const deployedPercent = Math.round((ethDeployed + stableDeployed) * 100)
  const isFullyDeployed = deployedPercent === 100

  const isPositive = totalReturn >= 0

  return (
    <Card
      title="Total Return"
      className={`border-l-4 ${isPositive ? 'border-l-green-500' : 'border-l-red-500'} h-full`}
    >
      <div>
        <span className={`text-4xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{totalReturn.toFixed(2)}
        </span>
        <span className={`text-2xl font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          %
        </span>
        <p className="text-sm text-gray-500 mt-2">
          incl. {priceChangeScenario >= 0 ? '+' : ''}{priceChangeScenario}% ETH
        </p>
        {!isFullyDeployed && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-2">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>{deployedPercent}% deployed</span>
          </div>
        )}
      </div>
    </Card>
  )
}
