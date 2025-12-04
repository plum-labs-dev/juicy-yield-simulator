'use client'

import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useLiveProducts, useLiveBorrowRate } from '@/hooks/useLiveApys'

export function AnnualReturnWidget() {
  const {
    ethRatio,
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

  // Calculate deployment percentage
  const ethTotal = ethAllocations.reduce((sum, a) => sum + a.weight, 0)
  const stableTotal = stablecoinAllocations.reduce((sum, a) => sum + a.weight, 0)
  const ethDeployed = (ethRatio / 100) * (ethTotal / 100)
  const stableDeployed = ((100 - ethRatio) / 100) * (stableTotal / 100)
  const deployedPercent = Math.round((ethDeployed + stableDeployed) * 100)
  const isFullyDeployed = deployedPercent === 100

  // Calculate ETH position in ETH terms
  const ethPositionInEth = ethPrice > 0 ? currentEthAmount / ethPrice : 0

  // Calculate ETH product returns (in ETH terms)
  const ethProductReturns = ethAllocations
    .filter((a) => a.weight > 0)
    .map((allocation) => {
      const product = ethProducts.find((p) => p.id === allocation.productId)
      if (!product) return null
      const amountUsd = currentEthAmount * (allocation.weight / 100)
      const amountEth = ethPrice > 0 ? amountUsd / ethPrice : 0
      const yieldEth = amountEth * (product.apy / 100)
      const yieldUsdAtCurrentPrice = yieldEth * ethPrice
      return {
        name: product.name,
        amountUsd,
        amountEth,
        apy: product.apy,
        yieldEth,
        yieldUsdAtCurrentPrice,
      }
    })
    .filter(Boolean)

  // Calculate Stablecoin product returns (in USD terms)
  const stablecoinProductReturns = stablecoinAllocations
    .filter((a) => a.weight > 0)
    .map((allocation) => {
      const product = stablecoinProducts.find((p) => p.id === allocation.productId)
      if (!product) return null
      const amount = currentStableAmount * (allocation.weight / 100)
      const yieldUsd = amount * (product.apy / 100)
      return {
        name: product.name,
        protocol: product.protocol,
        amount,
        apy: product.apy,
        yieldUsd,
      }
    })
    .filter(Boolean)

  // Calculate leverage details
  const leverageDetails = ethAllocations
    .filter((a) => a.leverage?.enabled)
    .map((allocation) => {
      const product = ethProducts.find((p) => p.id === allocation.productId)
      if (!product || !allocation.leverage) return null

      const positionValue = currentEthAmount * (allocation.weight / 100)
      const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
      const borrowed = collateralValue * (allocation.leverage.ltv / 100)
      const borrowRate = getLiveBorrowRate(allocation.leverage.borrowAsset)
      const annualCost = borrowed * (borrowRate / 100)

      // Leverage yield (USD)
      const deployTarget = stablecoinProducts.find((p) => p.id === allocation.leverage!.deployTargetId)
      const deployApy = deployTarget?.apy ?? 0
      const deployName = deployTarget ? `${deployTarget.protocol} ${deployTarget.name}` : 'Unknown'
      const grossYield = borrowed * (deployApy / 100)
      const netYield = grossYield - annualCost

      return {
        productName: product.name,
        borrowed,
        borrowAsset: allocation.leverage.borrowAsset,
        borrowRate,
        deployName,
        deployApy,
        grossYield,
        annualCost,
        netYield,
      }
    })
    .filter(Boolean)

  const totalBorrowed = totalBorrowedAmount()
  const totalLeverageCost = leverageDetails.reduce((sum, d) => sum + (d?.annualCost ?? 0), 0)
  const totalLeverageGrossYield = leverageDetails.reduce((sum, d) => sum + (d?.grossYield ?? 0), 0)
  const totalLeverageNetYield = leverageDetails.reduce((sum, d) => sum + (d?.netYield ?? 0), 0)

  // Total yields
  const totalEthYieldEth = ethProductReturns.reduce((sum, p) => sum + (p?.yieldEth ?? 0), 0)
  const totalEthYieldUsdAtCurrentPrice = ethProductReturns.reduce((sum, p) => sum + (p?.yieldUsdAtCurrentPrice ?? 0), 0)
  const totalStableYieldUsd = stablecoinProductReturns.reduce((sum, p) => sum + (p?.yieldUsd ?? 0), 0)

  // Price impact calculations
  const principalPriceImpact = currentEthAmount * (priceChangeScenario / 100)
  const yieldPriceImpact = totalEthYieldEth * (projectedEthPrice - ethPrice)
  const totalPriceImpact = principalPriceImpact + yieldPriceImpact

  // Total return (yield + price impact)
  const totalReturn = totalEthYieldUsdAtCurrentPrice + totalStableYieldUsd + totalLeverageNetYield + totalPriceImpact

  // Daily and monthly
  const dailyReturn = totalReturn / 365
  const monthlyReturn = totalReturn / 12

  // Calculate as percentage of total position
  const totalPosition = currentEthAmount + currentStableAmount + totalBorrowed
  const totalReturnPercent = totalPosition > 0 ? (totalReturn / totalPosition) * 100 : 0

  const isPositive = totalReturn >= 0

  const formatUsd = (amount: number): string => {
    if (Math.abs(amount) >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`
    }
    if (Math.abs(amount) >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`
    }
    return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const formatCompact = (amount: number): string => {
    if (Math.abs(amount) >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (Math.abs(amount) >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`
    }
    return `$${Math.round(amount)}`
  }

  const formatEth = (amount: number): string => {
    if (amount >= 1000) {
      return `${amount.toFixed(1)} ETH`
    }
    if (amount >= 1) {
      return `${amount.toFixed(2)} ETH`
    }
    if (amount >= 0.01) {
      return `${amount.toFixed(3)} ETH`
    }
    return `${amount.toFixed(4)} ETH`
  }

  return (
    <Card
      title="Total Return"
      subtitle="Annual"
      className={`border-l-4 ${isPositive ? 'border-l-green-500' : 'border-l-red-500'} h-full`}
    >
      <div className="space-y-4">
        {/* Main Return Display */}
        <div>
          <span className={`text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{formatUsd(totalReturn)}
          </span>
          <span className={`text-lg font-medium text-gray-500 ml-2`}>
            ({isPositive ? '+' : ''}{totalReturnPercent.toFixed(2)}%)
          </span>
          <p className="text-sm text-gray-500 mt-1">
            Daily {formatCompact(dailyReturn)} · Monthly {formatCompact(monthlyReturn)}
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

        {/* Breakdown Table */}
        <div className="pt-3 border-t border-gray-100 space-y-3 text-sm">
          {/* ETH Yield - shown in ETH first, then USD at current price */}
          {ethProductReturns.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">ETH Yield</p>
              {ethProductReturns.map((p) => (
                <div key={p?.name} className="flex justify-between py-0.5">
                  <span className="text-gray-600">{p?.name}</span>
                  <span className="text-gray-900 tabular-nums">
                    <span className="text-purple-600 font-medium">{formatEth(p?.yieldEth ?? 0)}</span>
                    <span className="text-gray-400 mx-1">→</span>
                    <span className="font-medium">{formatCompact(p?.yieldUsdAtCurrentPrice ?? 0)}</span>
                  </span>
                </div>
              ))}
              {ethProductReturns.length > 1 && (
                <div className="flex justify-between py-0.5 text-xs border-t border-gray-50 mt-1 pt-1">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-700 tabular-nums">
                    <span className="text-purple-500">{formatEth(totalEthYieldEth)}</span>
                    <span className="text-gray-400 mx-1">→</span>
                    <span>{formatCompact(totalEthYieldUsdAtCurrentPrice)}</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Price Impact */}
          {priceChangeScenario !== 0 && currentEthAmount > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                ETH Price ({priceChangeScenario >= 0 ? '+' : ''}{priceChangeScenario}%)
              </p>
              <div className="flex justify-between py-0.5">
                <span className="text-gray-600">Principal</span>
                <span className={`font-medium tabular-nums ${principalPriceImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {principalPriceImpact >= 0 ? '+' : ''}{formatCompact(principalPriceImpact)}
                </span>
              </div>
              {totalEthYieldEth > 0 && (
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-600">Yield</span>
                  <span className={`font-medium tabular-nums ${yieldPriceImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {yieldPriceImpact >= 0 ? '+' : ''}{formatCompact(yieldPriceImpact)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-0.5 text-xs border-t border-gray-50 mt-1 pt-1">
                <span className="text-gray-500">Subtotal</span>
                <span className={`tabular-nums ${totalPriceImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPriceImpact >= 0 ? '+' : ''}{formatCompact(totalPriceImpact)}
                </span>
              </div>
            </div>
          )}

          {/* Stablecoin Yield */}
          {stablecoinProductReturns.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">USD Yield</p>
              {stablecoinProductReturns.map((p) => (
                <div key={p?.name} className="flex justify-between py-0.5">
                  <span className="text-gray-600">{p?.protocol?.split(' ')[0]} {p?.name}</span>
                  <span className="text-gray-900 tabular-nums font-medium">
                    {formatCompact(p?.yieldUsd ?? 0)}
                  </span>
                </div>
              ))}
              {stablecoinProductReturns.length > 1 && (
                <div className="flex justify-between py-0.5 text-xs border-t border-gray-50 mt-1 pt-1">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-700 tabular-nums">{formatCompact(totalStableYieldUsd)}</span>
                </div>
              )}
            </div>
          )}

          {/* Leverage */}
          {totalBorrowed > 0 && (
            <div>
              <p className="text-xs font-medium text-purple-600 mb-1">Leverage</p>
              {leverageDetails.map((d, index) => (
                <div key={d?.productName} className={`space-y-0.5 ${index > 0 ? 'mt-2 pt-2 border-t border-gray-50' : ''}`}>
                  <p className="text-xs text-gray-500 mb-0.5">{d?.productName}</p>
                  <div className="flex justify-between py-0.5">
                    <span className="text-gray-600">{d?.deployName} ({d?.deployApy.toFixed(2)}%)</span>
                    <span className="text-green-600 tabular-nums font-medium">
                      +{formatCompact(d?.grossYield ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-gray-600">{d?.borrowAsset} borrow ({d?.borrowRate.toFixed(2)}%)</span>
                    <span className="text-red-600 tabular-nums font-medium">
                      -{formatCompact(d?.annualCost ?? 0)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between py-0.5 text-xs border-t border-gray-50 mt-1 pt-1">
                <span className="text-gray-500">Net leverage</span>
                <span className={`tabular-nums ${totalLeverageNetYield >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalLeverageNetYield >= 0 ? '+' : ''}{formatCompact(totalLeverageNetYield)}
                </span>
              </div>
            </div>
          )}

          {/* Net Total */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between font-medium">
              <span className="text-gray-900">Total Return</span>
              <span className={`tabular-nums ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{formatCompact(totalReturn)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
