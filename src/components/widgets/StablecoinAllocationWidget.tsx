'use client'

import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { STABLECOIN_PRODUCTS } from '@/lib/constants'

export function StablecoinAllocationWidget() {
  const {
    stablecoinAllocations,
    toggleStablecoinAllocation,
    updateStablecoinAllocationWeight,
    stablecoinAmount,
    totalBorrowedAmount,
    ethAllocations,
    ethAmount,
  } = usePortfolioStore()

  const totalWeight = stablecoinAllocations.reduce((sum, a) => sum + a.weight, 0)
  const isValid = totalWeight === 100

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`
    }
    return `$${amount.toLocaleString()}`
  }

  const handleWeightChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0
    const clampedValue = Math.min(100, Math.max(0, numValue))
    updateStablecoinAllocationWeight(productId, clampedValue)
  }

  // Calculate leveraged amounts per product from ETH leverage configs
  const getLeveragedAmount = (productId: string): number => {
    return ethAllocations.reduce((sum, allocation) => {
      if (allocation.leverage?.enabled && allocation.leverage.deployTargetId === productId) {
        const positionValue = ethAmount() * (allocation.weight / 100)
        const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
        const borrowed = collateralValue * (allocation.leverage.ltv / 100)
        return sum + borrowed
      }
      return sum
    }, 0)
  }

  const baseAmount = stablecoinAmount()
  const borrowedTotal = totalBorrowedAmount()

  return (
    <Card
      title="Stablecoin Allocation"
      subtitle={`${formatAmount(baseAmount)} base${borrowedTotal > 0 ? ` + ${formatAmount(borrowedTotal)} leveraged` : ''} · Must total 100%`}
      className="flex flex-col max-h-[500px]"
    >
      {/* Header Row - visible on lg screens */}
      <div className="hidden lg:flex items-center gap-3 px-3 py-2 text-xs text-gray-500 flex-shrink-0">
        <div className="w-4" /> {/* Checkbox spacer */}
        <div className="flex-1">Protocol</div>
        <div className="w-12 text-center">APY</div>
        <div className="w-20 text-center">Allocation</div>
        <div className="w-24 text-right">Leveraged</div>
      </div>

      {/* Scrollable product list */}
      <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
        {STABLECOIN_PRODUCTS.map((product) => {
          const allocation = stablecoinAllocations.find((a) => a.productId === product.id)
          const weight = allocation?.weight ?? 0
          const isSelected = allocation?.selected ?? false
          const leveragedAmount = getLeveragedAmount(product.id)

          return (
            <div
              key={product.id}
              className={`p-3 rounded-lg border transition-colors ${
                isSelected
                  ? 'border-purple-200 bg-purple-50/50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Desktop: Single row layout */}
              <div className="hidden lg:flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleStablecoinAllocation(product.id)}
                  className="w-4 h-4 text-purple-900 border-gray-300 rounded focus:ring-purple-500 cursor-pointer flex-shrink-0"
                />
                <span className="font-medium text-gray-900 text-sm flex-1 min-w-0 truncate">
                  {product.protocol} {product.name}
                </span>
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                  {product.apyRange
                    ? `${product.apyRange[0]}-${product.apyRange[1]}%`
                    : `${product.apy}%`}
                </span>
                <div className="flex items-center gap-1 w-20 justify-center">
                  <input
                    type="number"
                    value={weight || ''}
                    onChange={(e) => handleWeightChange(product.id, e.target.value)}
                    placeholder="—"
                    disabled={!isSelected}
                    className="w-12 px-2 py-1 text-sm text-center font-medium text-gray-900 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
                <div className="w-24 text-right">
                  {leveragedAmount > 0 ? (
                    <span className="text-xs font-medium text-purple-600">
                      +{formatAmount(leveragedAmount)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>
              </div>

              {/* Mobile/Tablet: Two row layout */}
              <div className="lg:hidden">
                {/* Row 1: Checkbox + Protocol + APY */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleStablecoinAllocation(product.id)}
                    className="w-4 h-4 text-purple-900 border-gray-300 rounded focus:ring-purple-500 cursor-pointer flex-shrink-0"
                  />
                  <span className="font-medium text-gray-900 text-sm flex-1 min-w-0 truncate">
                    {product.protocol} {product.name}
                  </span>
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                    {product.apyRange
                      ? `${product.apyRange[0]}-${product.apyRange[1]}%`
                      : `${product.apy}%`}
                  </span>
                </div>

                {/* Row 2: Allocation + Leveraged amount (only when selected) */}
                {isSelected && (
                  <div className="flex items-center justify-between mt-2 ml-7">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={weight || ''}
                        onChange={(e) => handleWeightChange(product.id, e.target.value)}
                        placeholder="—"
                        disabled={!isSelected}
                        className="w-14 px-2 py-1 text-sm text-center font-medium text-gray-900 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-xs text-gray-400">%</span>
                    </div>

                    {leveragedAmount > 0 && (
                      <span className="text-xs font-medium text-purple-600">
                        +{formatAmount(leveragedAmount)} leveraged
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Total Progress Bar - Always visible */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={isValid ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
            Total: {totalWeight}% · {formatAmount(baseAmount * (totalWeight / 100))}
          </span>
          {borrowedTotal > 0 && (
            <span className="text-purple-600">
              +{formatAmount(borrowedTotal)} leveraged
            </span>
          )}
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isValid ? 'bg-green-500' : totalWeight > 100 ? 'bg-red-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(totalWeight, 100)}%` }}
          />
        </div>
      </div>
    </Card>
  )
}
