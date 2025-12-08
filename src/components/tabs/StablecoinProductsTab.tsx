'use client'

import { DualLogo } from '@/components/ui/Logo'
import { usePortfolioStore } from '@/store/portfolioStore'
import { getProtocolLogo, getTokenLogo } from '@/lib/logos'
import { useLiveProducts } from '@/hooks/useLiveApys'

export function StablecoinProductsTab() {
  const {
    stablecoinAllocations,
    toggleStablecoinAllocation,
    updateStablecoinAllocationWeight,
    setStablecoinAllocations,
    stablecoinAmount,
    totalBorrowedAmount,
    ethAllocations,
    ethAmount,
  } = usePortfolioStore()

  // Get live APY data
  const { stablecoinProducts } = useLiveProducts()

  const totalWeight = stablecoinAllocations.reduce((sum, a) => a.selected ? sum + a.weight : sum, 0)

  const formatUsd = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`
    }
    if (amount >= 1000) {
      return `$${Math.round(amount).toLocaleString()}`
    }
    return `$${amount.toLocaleString()}`
  }

  // Calculate total stablecoin amount
  const totalStablecoinUsd = stablecoinAmount()
  const borrowedTotal = totalBorrowedAmount()

  // Actual allocated base exposure (based on selected weights)
  const allocatedBaseExposure = totalStablecoinUsd * (totalWeight / 100)

  const handleWeightChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0

    // Calculate sum of other allocations (excluding current product)
    const otherAllocationsSum = stablecoinAllocations.reduce((sum, a) => {
      if (a.productId !== productId && a.selected) {
        return sum + a.weight
      }
      return sum
    }, 0)

    // Max allowed is 100% minus other allocations
    const maxAllowed = 100 - otherAllocationsSum
    const clampedValue = Math.min(maxAllowed, Math.max(0, numValue))

    updateStablecoinAllocationWeight(productId, clampedValue)
  }

  // Calculate leveraged amounts per product from ETH leverage configs
  const getLeveragedDeployments = () => {
    const deployments: { productId: string; productName: string; protocol: string; amount: number; apy: number }[] = []

    ethAllocations.forEach((allocation) => {
      if (allocation.leverage?.enabled && allocation.leverage.deployTargetId) {
        const positionValue = ethAmount() * (allocation.weight / 100)
        const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
        const borrowed = collateralValue * (allocation.leverage.ltv / 100)

        const product = stablecoinProducts.find(p => p.id === allocation.leverage?.deployTargetId)
        if (product && borrowed > 0) {
          // Check if we already have this product
          const existing = deployments.find(d => d.productId === product.id)
          if (existing) {
            existing.amount += borrowed
          } else {
            deployments.push({
              productId: product.id,
              productName: product.name,
              protocol: product.protocol,
              amount: borrowed,
              apy: product.apy,
            })
          }
        }
      }
    })

    return deployments
  }

  const leveragedDeployments = getLeveragedDeployments()
  const hasLeveragedFunds = borrowedTotal > 0

  const handleReset = () => {
    setStablecoinAllocations(
      stablecoinAllocations.map((a) => ({
        ...a,
        selected: false,
        weight: 0,
      }))
    )
  }

  const hasSelectedItems = stablecoinAllocations.some((a) => a.selected)

  return (
    <div className="space-y-4">
      {/* Card 1: Base Allocation */}
      <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-8">
        {/* Header */}
        <div className="pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Stablecoin Products</h2>
              <p className="text-sm text-gray-500 mt-1">Select products and allocate weights</p>
            </div>
            <div className="flex items-center gap-3">
              {hasSelectedItems && (
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Reset
                </button>
              )}
              <div className="bg-[#48104a] text-white px-4 py-2 rounded-full text-sm font-medium">
                Total: {formatUsd(totalStablecoinUsd)}
              </div>
            </div>
          </div>

          {/* Base Allocation Section Header */}
          <div className="mt-6 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Base Allocation</h3>
            <span className={`text-sm ${totalWeight === 100 ? 'text-green-600' : 'text-gray-500'}`}>
              {totalWeight}% allocated{totalWeight === 100 && ' ✓'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  totalWeight === 100 ? 'bg-green-500' : 'bg-[#48104a]'
                }`}
                style={{ width: `${totalWeight}%` }}
              />
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="space-y-4">
          {stablecoinProducts.map((product) => {
            const allocation = stablecoinAllocations.find((a) => a.productId === product.id)
            const weight = allocation?.weight ?? 0
            const isSelected = allocation?.selected ?? false

            return (
              <div
                key={product.id}
                className={`flex items-center gap-4 px-4 rounded-2xl transition-colors h-[92px] ${
                  isSelected
                    ? 'bg-[#F5F5F5] border-l-4 border-l-[#48104a]'
                    : 'bg-[#F5F5F5] opacity-60'
                }`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleStablecoinAllocation(product.id)}
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
                  {product.apy.toFixed(1)}% APY
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
                    className="w-16 px-3 py-2 text-sm text-center font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48104a]/20 focus:border-[#48104a] disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-sm text-gray-400">%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Card 2: Leveraged Funds (only if leverage active) */}
      {hasLeveragedFunds && (
        <div className="rounded-3xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-8" style={{ background: 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 70.71%)' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-gray-900">Leveraged Funds</h3>
              <span className="px-3 py-1 text-sm font-medium text-gray-700 border border-gray-300 rounded-full">
                {formatUsd(borrowedTotal)} borrowed
              </span>
            </div>
            <span className="text-sm text-green-600">100% deployed ✓</span>
          </div>

          {/* Explanation */}
          <p className="text-sm text-gray-500 mb-4">
            These funds are borrowed against your ETH collateral and deployed to stablecoin products.
          </p>

          {/* Deployed funds */}
          <div className="space-y-3">
            {leveragedDeployments.map((deployment) => (
              <div
                key={deployment.productId}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-[#F5F5F5] border-l-4 border-l-[#48104a]"
              >
                <DualLogo
                  tokenSrc={getTokenLogo(deployment.productName)}
                  protocolSrc={getProtocolLogo(deployment.protocol)}
                  tokenAlt={deployment.productName}
                  protocolAlt={deployment.protocol}
                  size={32}
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{deployment.protocol} {deployment.productName}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatUsd(deployment.amount)}</div>
                  <div className="text-xs text-gray-500">deployed</div>
                </div>
                <div className="text-sm font-medium text-[#15803d]">
                  {deployment.apy.toFixed(1)}% APY
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card 3: Summary */}
      <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Allocated Stablecoin Exposure</div>
            <div className="text-2xl font-bold text-gray-900">{formatUsd(allocatedBaseExposure + borrowedTotal)}</div>
          </div>
          <div className="text-right text-sm">
            <div className="text-gray-500">{formatUsd(allocatedBaseExposure)} <span className="text-gray-400">base</span></div>
            {borrowedTotal > 0 && (
              <div className="text-[#48104a]">{formatUsd(borrowedTotal)} <span className="text-gray-400">leveraged</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
