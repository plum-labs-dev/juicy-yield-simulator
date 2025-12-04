'use client'

import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useLiveProducts, useLiveBorrowRate } from '@/hooks/useLiveApys'

export function ExpectedBalanceWidget() {
  const {
    ethPrice,
    priceChangeScenario,
    ethAllocations,
    stablecoinAllocations,
    ethAmount,
    stablecoinAmount,
    totalBorrowedAmount,
  } = usePortfolioStore()

  // Get live APY data
  const { ethProducts, stablecoinProducts } = useLiveProducts()

  // Get live borrow rates
  const usdcBorrowRate = useLiveBorrowRate('USDC')
  const usdtBorrowRate = useLiveBorrowRate('USDT')
  const usdsBorrowRate = useLiveBorrowRate('USDS')

  const getLiveBorrowRate = (asset: 'USDC' | 'USDT' | 'USDS'): number => {
    switch (asset) {
      case 'USDC':
        return usdcBorrowRate
      case 'USDT':
        return usdtBorrowRate
      case 'USDS':
        return usdsBorrowRate
    }
  }

  const currentEthAmount = ethAmount()
  const currentStableAmount = stablecoinAmount()
  const priceMultiplier = 1 + priceChangeScenario / 100
  const projectedEthPrice = ethPrice * priceMultiplier

  // Calculate ETH position in ETH terms
  const ethPositionInEth = ethPrice > 0 ? currentEthAmount / ethPrice : 0

  // Calculate ETH yield in ETH terms
  const ethYieldEth = ethAllocations.reduce((sum, allocation) => {
    if (allocation.weight > 0) {
      const product = ethProducts.find((p) => p.id === allocation.productId)
      if (product) {
        const amountEth = ethPrice > 0 ? (currentEthAmount * (allocation.weight / 100)) / ethPrice : 0
        return sum + amountEth * (product.apy / 100)
      }
    }
    return sum
  }, 0)

  // Final ETH balance (principal + yield) in ETH terms
  const finalEthBalance = ethPositionInEth + ethYieldEth
  // Final ETH balance in USD at projected price
  const finalEthBalanceUsd = finalEthBalance * projectedEthPrice

  // Calculate stablecoin yield
  const stablecoinYieldUsd = stablecoinAllocations.reduce((sum, allocation) => {
    if (allocation.weight > 0) {
      const product = stablecoinProducts.find((p) => p.id === allocation.productId)
      if (product) {
        const amount = currentStableAmount * (allocation.weight / 100)
        return sum + amount * (product.apy / 100)
      }
    }
    return sum
  }, 0)

  // Calculate leverage yield (net of borrow cost)
  const leverageNetYield = ethAllocations.reduce((sum, allocation) => {
    if (allocation.leverage?.enabled) {
      const positionValue = currentEthAmount * (allocation.weight / 100)
      const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
      const borrowed = collateralValue * (allocation.leverage.ltv / 100)

      const deployTarget = stablecoinProducts.find((p) => p.id === allocation.leverage!.deployTargetId)
      const deployApy = deployTarget?.apy ?? 0
      const borrowRate = getLiveBorrowRate(allocation.leverage.borrowAsset)

      const netYield = borrowed * ((deployApy - borrowRate) / 100)
      return sum + netYield
    }
    return sum
  }, 0)

  // Final stablecoin balance (principal + yield + leverage net yield)
  const finalStablecoinBalance = currentStableAmount + stablecoinYieldUsd + leverageNetYield

  // Starting balances for comparison
  const startingEthBalance = ethPositionInEth
  const startingStablecoinBalance = currentStableAmount

  const formatUsd = (amount: number): string => {
    if (Math.abs(amount) >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`
    }
    if (Math.abs(amount) >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`
    }
    return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const formatEth = (amount: number): string => {
    if (amount >= 1000) {
      return `${amount.toFixed(1)}`
    }
    if (amount >= 1) {
      return `${amount.toFixed(2)}`
    }
    if (amount >= 0.01) {
      return `${amount.toFixed(3)}`
    }
    return `${amount.toFixed(4)}`
  }

  const ethChange = finalEthBalance - startingEthBalance
  const stableChange = finalStablecoinBalance - startingStablecoinBalance

  return (
    <Card title="Expected Balance" subtitle="After 1 Year" className="h-full">
      <div className="space-y-4">
        {/* ETH Balance */}
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-purple-600">ETH Position</span>
            {priceChangeScenario !== 0 && (
              <span className="text-xs text-gray-500">
                @ {formatUsd(projectedEthPrice)}/ETH
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatEth(finalEthBalance)} ETH
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-0.5">
            {formatUsd(finalEthBalanceUsd)}
          </div>
          {ethChange > 0 && (
            <div className="text-xs text-green-600 mt-1">
              +{formatEth(ethChange)} ETH from yield
            </div>
          )}
        </div>

        {/* Stablecoin Balance */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-medium text-gray-500 mb-1">USD Position</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatUsd(finalStablecoinBalance)}
            </span>
          </div>
          {stableChange > 0 && (
            <div className="text-xs text-green-600 mt-1">
              +{formatUsd(stableChange)} from yield
            </div>
          )}
        </div>

        {/* Combined Total */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Combined Value</span>
            <span className="text-lg font-bold text-gray-900">
              {formatUsd(finalEthBalanceUsd + finalStablecoinBalance)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
