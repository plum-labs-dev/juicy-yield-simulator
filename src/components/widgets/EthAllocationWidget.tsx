'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { DualLogo, Logo } from '@/components/ui/Logo'
import { LeverageConfigModal } from '@/components/modals/LeverageConfigModal'
import { usePortfolioStore } from '@/store/portfolioStore'
import { getCollateralParams } from '@/lib/constants'
import { getProtocolLogo, getTokenLogo } from '@/lib/logos'
import { useLiveProducts } from '@/hooks/useLiveApys'
import type { LeverageConfig } from '@/types'

export function EthAllocationWidget() {
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

  const totalWeight = ethAllocations.reduce((sum, a) => sum + a.weight, 0)
  const isValid = totalWeight === 100

  const formatUsd = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`
    }
    return `$${amount.toLocaleString()}`
  }

  const formatEth = (amount: number): string => {
    if (amount >= 1000) {
      return `${amount.toFixed(1)} ETH`
    }
    if (amount >= 1) {
      return `${amount.toFixed(2)} ETH`
    }
    return `${amount.toFixed(4)} ETH`
  }

  // Calculate total ETH amount
  const totalEthUsd = ethAmount()
  const totalEthAmount = ethPrice > 0 ? totalEthUsd / ethPrice : 0

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
      subtitle={`${formatEth(totalEthAmount)} (${formatUsd(totalEthUsd)}) · Must total 100%`}
      className="h-full flex flex-col"
      contentClassName="flex flex-col flex-1"
    >
      <div className="flex-1">
        {/* Header Row - visible on lg screens */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-2 text-xs text-gray-500">
        <div className="w-4" /> {/* Checkbox spacer */}
        <div className="flex-1">Protocol</div>
        <div className="w-12 text-center">APY</div>
        <div className="w-20 text-center">Allocation</div>
        <div className="w-28 text-center">Leverage</div>
      </div>

      <div className="space-y-2">
        {ethProducts.map((product) => {
          const allocation = ethAllocations.find((a) => a.productId === product.id)
          const weight = allocation?.weight ?? 0
          const isSelected = allocation?.selected ?? false
          const leverage = allocation?.leverage
          const collateralParams = getCollateralParams(product.id)

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
                  onChange={() => toggleEthAllocation(product.id)}
                  className="w-4 h-4 text-purple-900 border-gray-300 rounded focus:ring-purple-500 cursor-pointer flex-shrink-0"
                />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <DualLogo
                    tokenSrc={getTokenLogo(product.name)}
                    protocolSrc={getProtocolLogo(product.protocol)}
                    tokenAlt={product.name}
                    protocolAlt={product.protocol}
                    size={24}
                  />
                  <span className="font-medium text-gray-900 text-sm truncate">
                    {product.protocol} {product.name}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                  {product.apy.toFixed(2)}%
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
                <div className="w-28 flex justify-center">
                  {product.isCollateralEligible && collateralParams ? (
                    <button
                      disabled={!isSelected}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        leverage?.enabled
                          ? 'bg-purple-100 border-purple-300 text-purple-800'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                      onClick={() => {
                        setSelectedProductId(product.id)
                        setLeverageModalOpen(true)
                      }}
                    >
                      {leverage?.enabled
                        ? `${leverage.ltv}% LTV · ${formatUsd(
                            ethAmount() *
                              (weight / 100) *
                              (leverage.collateralPercent / 100) *
                              (leverage.ltv / 100)
                          )}`
                        : 'Leverage'}
                    </button>
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
                    onChange={() => toggleEthAllocation(product.id)}
                    className="w-4 h-4 text-purple-900 border-gray-300 rounded focus:ring-purple-500 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <DualLogo
                      tokenSrc={getTokenLogo(product.name)}
                      protocolSrc={getProtocolLogo(product.protocol)}
                      tokenAlt={product.name}
                      protocolAlt={product.protocol}
                      size={24}
                    />
                    <span className="font-medium text-gray-900 text-sm truncate">
                      {product.protocol} {product.name}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                    {product.apy.toFixed(2)}%
                  </span>
                </div>

                {/* Row 2: Allocation + Leverage (only when selected) */}
                {isSelected && (
                  <div className="flex items-center gap-3 mt-2 ml-7">
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

                    {product.isCollateralEligible && collateralParams && (
                      <button
                        disabled={!isSelected}
                        className={`text-xs px-2 py-1 rounded border transition-colors flex-shrink-0 ${
                          leverage?.enabled
                            ? 'bg-purple-100 border-purple-300 text-purple-800'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                        onClick={() => {
                          setSelectedProductId(product.id)
                          setLeverageModalOpen(true)
                        }}
                      >
                        {leverage?.enabled
                          ? `${leverage.ltv}% LTV · ${formatUsd(
                              ethAmount() *
                                (weight / 100) *
                                (leverage.collateralPercent / 100) *
                                (leverage.ltv / 100)
                            )}`
                          : 'Leverage'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        </div>
      </div>

      {/* Total Progress Bar - sticky to bottom */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={isValid ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
            Total: {totalWeight}% · {formatEth(totalEthAmount * (totalWeight / 100))} ({formatUsd(totalEthUsd * (totalWeight / 100))})
          </span>
          {totalBorrowed > 0 && (
            <span className="text-purple-600">
              {formatUsd(totalBorrowed)} borrowed
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
            ethAmount() *
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
    </Card>
  )
}
