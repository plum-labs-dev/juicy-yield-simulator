'use client'

import { useState } from 'react'
import { DualLogo } from '@/components/ui/Logo'
import { LeverageConfigModal } from '@/components/modals/LeverageConfigModal'
import { usePortfolioStore } from '@/store/portfolioStore'
import { getCollateralParams } from '@/lib/constants'
import { getProtocolLogo, getTokenLogo } from '@/lib/logos'
import { useLiveProducts } from '@/hooks/useLiveApys'
import type { LeverageConfig } from '@/types'

export function EthProductsTab() {
  const {
    ethAllocations,
    toggleEthAllocation,
    updateEthAllocationWeight,
    setLeverageConfig,
    ethAmount,
    ethPrice,
  } = usePortfolioStore()

  // Get live APY data
  const { ethProducts } = useLiveProducts()

  // Modal state
  const [leverageModalOpen, setLeverageModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const totalWeight = ethAllocations.reduce((sum, a) => a.selected ? sum + a.weight : sum, 0)

  const formatUsd = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`
    }
    if (amount >= 1000) {
      return `$${Math.round(amount).toLocaleString()}`
    }
    return `$${amount.toLocaleString()}`
  }

  // Calculate total ETH amount
  const totalEthUsd = ethAmount()

  const handleWeightChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0

    // Calculate sum of other allocations (excluding current product)
    const otherAllocationsSum = ethAllocations.reduce((sum, a) => {
      if (a.productId !== productId && a.selected) {
        return sum + a.weight
      }
      return sum
    }, 0)

    // Max allowed is 100% minus other allocations
    const maxAllowed = 100 - otherAllocationsSum
    const clampedValue = Math.min(maxAllowed, Math.max(0, numValue))

    updateEthAllocationWeight(productId, clampedValue)
  }

  return (
    <div>
      {/* Header */}
      <div className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">ETH Products</h2>
            <p className="text-sm text-gray-500 mt-1">Select products and allocate weights</p>
          </div>
          <div className="bg-[#48104a] text-white px-4 py-2 rounded-full text-sm font-medium">
            Total: {formatUsd(totalEthUsd)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                totalWeight === 100 ? 'bg-green-500' : 'bg-[#48104a]'
              }`}
              style={{ width: `${totalWeight}%` }}
            />
          </div>
          <div className={`text-right text-sm mt-1 ${
            totalWeight === 100 ? 'text-green-600' : 'text-gray-500'
          }`}>
            {totalWeight}% allocated
          </div>
        </div>
      </div>

      {/* Product List */}
      <div>
        <div className="space-y-3">
          {ethProducts.map((product) => {
            const allocation = ethAllocations.find((a) => a.productId === product.id)
            const weight = allocation?.weight ?? 0
            const isSelected = allocation?.selected ?? false
            const leverage = allocation?.leverage
            const collateralParams = getCollateralParams(product.id)

            const positionValue = totalEthUsd * (weight / 100)
            const borrowedAmount = leverage?.enabled
              ? positionValue * (leverage.collateralPercent / 100) * (leverage.ltv / 100)
              : 0

            return (
              <div
                key={product.id}
                className={`flex items-center gap-4 px-4 rounded-2xl border transition-colors h-[92px] ${
                  isSelected
                    ? 'border-gray-200 bg-white border-l-4 border-l-[#48104a]'
                    : 'border-gray-200 bg-white opacity-60'
                }`}
              >

                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleEthAllocation(product.id)}
                  className="w-5 h-5 text-[#48104a] border-gray-300 rounded focus:ring-[#48104a] cursor-pointer flex-shrink-0"
                />

                {/* Logo */}
                <DualLogo
                  tokenSrc={getTokenLogo(product.name)}
                  protocolSrc={getProtocolLogo(product.protocol)}
                  tokenAlt={product.name}
                  protocolAlt={product.protocol}
                  size={32}
                />

                {/* Product Name */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.protocol}</div>
                </div>

                {/* APY Badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  isSelected
                    ? 'bg-[#f0fdf4] text-[#15803d]'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {product.apy.toFixed(2)}% APY
                  {isSelected && (
                    <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                  )}
                </div>

                {/* Weight Input */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={isSelected ? (weight || '') : ''}
                    onChange={(e) => handleWeightChange(product.id, e.target.value)}
                    placeholder="—"
                    disabled={!isSelected}
                    className="w-16 px-3 py-2 text-sm text-center font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48104a]/20 focus:border-[#48104a] disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-sm text-gray-400">%</span>
                </div>

                {/* Leverage Button */}
                <div className="flex justify-end">
                  {product.isCollateralEligible && collateralParams ? (
                    <button
                      disabled={!isSelected}
                      onClick={() => {
                        setSelectedProductId(product.id)
                        setLeverageModalOpen(true)
                      }}
                      className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
                        leverage?.enabled
                          ? 'bg-[#fef9e6] border-[#d4a84b] text-[#8b6914] font-medium'
                          : 'border-[#48104a] text-[#48104a] hover:bg-[#48104a]/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400'
                      }`}
                    >
                      {leverage?.enabled
                        ? `${leverage.ltv}% LTV · ${formatUsd(borrowedAmount)}`
                        : 'Leverage'}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-300">—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leverage Configuration Modal */}
      {selectedProductId && (
        <LeverageConfigModal
          isOpen={leverageModalOpen}
          onClose={() => {
            setLeverageModalOpen(false)
            setSelectedProductId(null)
          }}
          productId={selectedProductId}
          positionValue={
            totalEthUsd *
            ((ethAllocations.find((a) => a.productId === selectedProductId)?.weight ?? 0) / 100)
          }
          currentConfig={ethAllocations.find((a) => a.productId === selectedProductId)?.leverage}
          onApply={(config: LeverageConfig) => {
            setLeverageConfig(selectedProductId, config)
          }}
          onRemove={() => {
            setLeverageConfig(selectedProductId, undefined)
          }}
        />
      )}
    </div>
  )
}
