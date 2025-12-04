'use client'

import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { ETH_PRODUCTS, STABLECOIN_PRODUCTS, getBorrowRate } from '@/lib/constants'

export function AnnualReturnWidget() {
  const {
    investmentAmount,
    ethRatio,
    ethAllocations,
    stablecoinAllocations,
    ethAmount,
    stablecoinAmount,
    totalBorrowedAmount,
  } = usePortfolioStore()

  // Calculate deployment percentage
  const ethTotal = ethAllocations.reduce((sum, a) => sum + a.weight, 0)
  const stableTotal = stablecoinAllocations.reduce((sum, a) => sum + a.weight, 0)
  const ethDeployed = (ethRatio / 100) * (ethTotal / 100)
  const stableDeployed = ((100 - ethRatio) / 100) * (stableTotal / 100)
  const deployedPercent = Math.round((ethDeployed + stableDeployed) * 100)
  const isFullyDeployed = deployedPercent === 100

  // Calculate ETH product returns
  const ethProductReturns = ethAllocations
    .filter((a) => a.weight > 0)
    .map((allocation) => {
      const product = ETH_PRODUCTS.find((p) => p.id === allocation.productId)
      if (!product) return null
      const amount = ethAmount() * (allocation.weight / 100)
      const annualReturn = amount * (product.apy / 100)
      return {
        name: product.name,
        amount,
        apy: product.apy,
        annualReturn,
      }
    })
    .filter(Boolean)

  // Calculate Stablecoin product returns
  const stablecoinProductReturns = stablecoinAllocations
    .filter((a) => a.weight > 0)
    .map((allocation) => {
      const product = STABLECOIN_PRODUCTS.find((p) => p.id === allocation.productId)
      if (!product) return null
      const amount = stablecoinAmount() * (allocation.weight / 100)
      const annualReturn = amount * (product.apy / 100)
      return {
        name: product.name,
        protocol: product.protocol,
        amount,
        apy: product.apy,
        annualReturn,
      }
    })
    .filter(Boolean)

  // Calculate leverage cost
  const leverageDetails = ethAllocations
    .filter((a) => a.leverage?.enabled)
    .map((allocation) => {
      const product = ETH_PRODUCTS.find((p) => p.id === allocation.productId)
      if (!product || !allocation.leverage) return null

      const positionValue = ethAmount() * (allocation.weight / 100)
      const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
      const borrowed = collateralValue * (allocation.leverage.ltv / 100)
      const borrowRate = getBorrowRate(allocation.leverage.borrowAsset)
      const annualCost = borrowed * (borrowRate / 100)

      return {
        productName: product.name,
        borrowed,
        borrowRate,
        annualCost,
      }
    })
    .filter(Boolean)

  const totalBorrowed = totalBorrowedAmount()
  const totalLeverageCost = leverageDetails.reduce((sum, d) => sum + (d?.annualCost ?? 0), 0)

  // Total annual return
  const totalEthReturn = ethProductReturns.reduce((sum, p) => sum + (p?.annualReturn ?? 0), 0)
  const totalStableReturn = stablecoinProductReturns.reduce((sum, p) => sum + (p?.annualReturn ?? 0), 0)
  const netAnnualReturn = totalEthReturn + totalStableReturn - totalLeverageCost

  // Daily and monthly
  const dailyReturn = netAnnualReturn / 365
  const monthlyReturn = netAnnualReturn / 12

  const formatAmount = (amount: number): string => {
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

  return (
    <Card title="Annual Return" className="h-full">
      <div className="space-y-4">
        {/* Main Return Display */}
        <div>
          <span className="text-4xl font-bold text-gray-900">
            {formatAmount(netAnnualReturn)}
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
          {/* ETH Exposure */}
          {ethProductReturns.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">ETH Exposure</p>
              {ethProductReturns.map((p) => (
                <div key={p?.name} className="flex justify-between py-0.5">
                  <span className="text-gray-600">{p?.name}</span>
                  <span className="text-gray-900 tabular-nums">
                    <span className="text-gray-400 text-xs mr-2">{formatCompact(p?.amount ?? 0)} · {p?.apy}%</span>
                    {formatCompact(p?.annualReturn ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Stablecoin Exposure */}
          {stablecoinProductReturns.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Stablecoin Exposure</p>
              {stablecoinProductReturns.map((p) => (
                <div key={p?.name} className="flex justify-between py-0.5">
                  <span className="text-gray-600">{p?.protocol?.split(' ')[0]}</span>
                  <span className="text-gray-900 tabular-nums">
                    <span className="text-gray-400 text-xs mr-2">{formatCompact(p?.amount ?? 0)} · {p?.apy}%</span>
                    {formatCompact(p?.annualReturn ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Leverage Cost */}
          {totalBorrowed > 0 && (
            <div>
              <p className="text-xs font-medium text-red-500 mb-1">Leverage Cost</p>
              {leverageDetails.map((d) => (
                <div key={d?.productName} className="flex justify-between py-0.5">
                  <span className="text-gray-600">Borrow</span>
                  <span className="text-red-600 tabular-nums">
                    <span className="text-gray-400 text-xs mr-2">-{formatCompact(d?.borrowed ?? 0)} · {d?.borrowRate}%</span>
                    -{formatCompact(d?.annualCost ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Net Total */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between font-medium">
              <span className="text-gray-900">Net Total</span>
              <span className="text-gray-900 tabular-nums">
                <span className="text-gray-400 text-xs mr-2">{formatCompact(investmentAmount)}</span>
                {formatCompact(netAnnualReturn)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
