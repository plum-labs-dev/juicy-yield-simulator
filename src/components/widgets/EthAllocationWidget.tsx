'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { ETH_PRODUCTS, getCollateralParams } from '@/lib/constants'
import type { EthAllocation } from '@/types'

export function EthAllocationWidget() {
  const {
    ethAllocations,
    setEthAllocations,
    toggleEthAllocation,
    updateEthAllocationWeight,
    ethAmount,
  } = usePortfolioStore()

  // Initialize allocations if empty
  useEffect(() => {
    if (ethAllocations.length === 0) {
      const initialAllocations: EthAllocation[] = ETH_PRODUCTS.map((product) => ({
        productId: product.id,
        selected: false,
        weight: 0,
      }))
      setEthAllocations(initialAllocations)
    }
  }, [ethAllocations.length, setEthAllocations])

  const totalWeight = ethAllocations.reduce((sum, a) => sum + a.weight, 0)
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
    updateEthAllocationWeight(productId, clampedValue)
  }

  // Calculate total borrowed amount from leverage
  const totalBorrowed = ethAllocations.reduce((sum, allocation) => {
    if (allocation.leverage?.enabled) {
      const positionValue = ethAmount() * (allocation.weight / 100)
      const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
      const borrowed = collateralValue * (allocation.leverage.ltv / 100)
      return sum + borrowed
    }
    return sum
  }, 0)

  return (
    <Card
      title="ETH Allocation"
      subtitle={`${formatAmount(ethAmount())} · Must total 100%`}
    >
      {/* Header Row */}
      <div className="flex items-center gap-3 px-3 py-2 text-xs text-gray-500">
        <div className="w-4" /> {/* Checkbox spacer */}
        <div className="flex-1">Protocol</div>
        <div className="w-12 text-center">APY</div>
        <div className="w-16 text-center">Allocation</div>
        <div className="w-24 text-center">Leverage</div>
      </div>

      <div className="space-y-2">
        {ETH_PRODUCTS.map((product) => {
          const allocation = ethAllocations.find((a) => a.productId === product.id)
          const weight = allocation?.weight ?? 0
          const isSelected = allocation?.selected ?? false
          const leverage = allocation?.leverage
          const collateralParams = getCollateralParams(product.id)

          return (
            <div
              key={product.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                isSelected
                  ? 'border-purple-200 bg-purple-50/50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleEthAllocation(product.id)}
                className="w-4 h-4 text-purple-900 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
              />

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 text-sm">
                    {product.protocol} {product.name}
                  </span>
                </div>
              </div>

              {/* APY Badge */}
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {product.apy}%
              </span>

              {/* Weight Input */}
              <div className="flex items-center gap-1">
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

              {/* Leverage Button */}
              {product.isCollateralEligible && collateralParams ? (
                <button
                  disabled={!isSelected}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    leverage?.enabled
                      ? 'bg-purple-100 border-purple-300 text-purple-800'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                  onClick={() => {
                    // TODO: Open leverage modal
                    console.log('Open leverage modal for', product.id)
                  }}
                >
                  {leverage?.enabled
                    ? `${leverage.ltv}% LTV · ${formatAmount(
                        ethAmount() *
                          (weight / 100) *
                          (leverage.collateralPercent / 100) *
                          (leverage.ltv / 100)
                      )}`
                    : 'Leverage'}
                </button>
              ) : (
                <span className="text-xs text-gray-300 w-16" />
              )}
            </div>
          )
        })}
      </div>

      {/* Total Progress Bar */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={isValid ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
            Total: {totalWeight}% · {formatAmount(ethAmount() * (totalWeight / 100))}
          </span>
          {totalBorrowed > 0 && (
            <span className="text-purple-600">
              {formatAmount(totalBorrowed)} borrowed
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
