'use client'

import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useLiveProducts, useLiveBorrowRate, useApyStatus } from '@/hooks/useLiveApys'

export function ApyWidget() {
  const {
    ethRatio,
    ethAllocations,
    stablecoinAllocations,
    ethAmount,
    stablecoinAmount,
    totalBorrowedAmount,
  } = usePortfolioStore()

  // Get live APY data
  const { ethProducts, stablecoinProducts } = useLiveProducts()
  const { isLive, isLoading, lastUpdated, refresh, canRefresh } = useApyStatus()

  // Calculate ETH APY (weighted average of selected products)
  const ethApy = ethAllocations.reduce((sum, allocation) => {
    if (allocation.weight > 0) {
      const product = ethProducts.find((p) => p.id === allocation.productId)
      if (product) {
        return sum + (allocation.weight / 100) * product.apy
      }
    }
    return sum
  }, 0)

  // Calculate Stablecoin APY (weighted average of selected products)
  const stablecoinApy = stablecoinAllocations.reduce((sum, allocation) => {
    if (allocation.weight > 0) {
      const product = stablecoinProducts.find((p) => p.id === allocation.productId)
      if (product) {
        return sum + (allocation.weight / 100) * product.apy
      }
    }
    return sum
  }, 0)

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

  // Calculate leverage boost
  // Leverage_Boost = ((Borrowed × Deploy_APY) - (Borrowed × Borrow_Rate)) / Total_Position
  const leverageBoost = ethAllocations.reduce((sum, allocation) => {
    if (allocation.leverage?.enabled) {
      const positionValue = ethAmount() * (allocation.weight / 100)
      const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
      const borrowed = collateralValue * (allocation.leverage.ltv / 100)

      const deployTarget = stablecoinProducts.find((p) => p.id === allocation.leverage!.deployTargetId)
      const deployApy = deployTarget?.apy ?? 0
      const borrowRate = getLiveBorrowRate(allocation.leverage.borrowAsset)

      // Net yield from leverage = borrowed * (deployAPY - borrowRate)
      const netYield = borrowed * ((deployApy - borrowRate) / 100)
      return sum + netYield
    }
    return sum
  }, 0)

  // Total position value (base + borrowed)
  const totalPosition = ethAmount() + stablecoinAmount() + totalBorrowedAmount()

  // Base portfolio APY (without leverage)
  const baseApy = (ethRatio / 100) * ethApy + ((100 - ethRatio) / 100) * stablecoinApy

  // Leverage boost as percentage of total position
  const leverageBoostPercent = totalPosition > 0 ? (leverageBoost / totalPosition) * 100 : 0

  // Final portfolio APY
  const portfolioApy = baseApy + leverageBoostPercent

  // Calculate deployment percentage
  const ethTotal = ethAllocations.reduce((sum, a) => sum + a.weight, 0)
  const stableTotal = stablecoinAllocations.reduce((sum, a) => sum + a.weight, 0)
  const ethDeployed = (ethRatio / 100) * (ethTotal / 100)
  const stableDeployed = ((100 - ethRatio) / 100) * (stableTotal / 100)
  const deployedPercent = Math.round((ethDeployed + stableDeployed) * 100)
  const isFullyDeployed = deployedPercent === 100

  // Format last updated time
  const formatLastUpdated = (timestamp: number | null): string => {
    if (!timestamp) return ''
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          Portfolio APY
          {isLive && (
            <span className="flex items-center gap-1 text-xs font-normal text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </span>
      }
      className="border-l-4 border-l-purple-900 h-full"
    >
      <div className="space-y-4">
        {/* Main APY Display */}
        <div>
          <span className="text-4xl font-bold text-purple-900">
            {portfolioApy.toFixed(2)}
          </span>
          <span className="text-2xl font-medium text-purple-900">
            %
          </span>
        </div>

        {/* APY Breakdown */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              ETH Yield <span className="text-xs text-purple-500">(in ETH)</span>
            </span>
            <span className="font-medium text-gray-900">
              {ethApy.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              USD Yield <span className="text-xs text-gray-400">(in USD)</span>
            </span>
            <span className="font-medium text-gray-900">
              {stablecoinApy.toFixed(2)}%
            </span>
          </div>
          {leverageBoostPercent !== 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Leverage Boost</span>
              <span className={`font-medium ${leverageBoostPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {leverageBoostPercent >= 0 ? '+' : ''}{leverageBoostPercent.toFixed(2)}%
              </span>
            </div>
          )}
          {!isFullyDeployed && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 pt-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>{deployedPercent}% deployed</span>
            </div>
          )}
        </div>

        {/* Live APY Status */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {isLive && lastUpdated ? `Updated ${formatLastUpdated(lastUpdated)}` : 'Using fallback rates'}
          </span>
          <button
            onClick={refresh}
            disabled={!canRefresh}
            className="text-xs font-medium px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400 bg-white border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Refreshing
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  )
}
