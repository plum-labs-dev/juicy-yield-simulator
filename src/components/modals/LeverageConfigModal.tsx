'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { usePortfolioStore } from '@/store/portfolioStore'
import {
  ETH_PRODUCTS,
  STABLECOIN_PRODUCTS,
  BORROW_OPTIONS,
  getCollateralParams,
  getBorrowRate,
} from '@/lib/constants'
import type { LeverageConfig } from '@/types'

interface LeverageConfigModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  positionValue: number // USD value of the ETH position
  currentConfig?: LeverageConfig
  onApply: (config: LeverageConfig) => void
  onRemove: () => void
}

export function LeverageConfigModal({
  isOpen,
  onClose,
  productId,
  positionValue,
  currentConfig,
  onApply,
  onRemove,
}: LeverageConfigModalProps) {
  const product = ETH_PRODUCTS.find((p) => p.id === productId)
  const collateralParams = getCollateralParams(productId)
  const { ethPrice } = usePortfolioStore()

  // Local state for form
  const [collateralPercent, setCollateralPercent] = useState(50)
  const [ltv, setLtv] = useState(60)
  const [borrowAsset, setBorrowAsset] = useState<'USDC' | 'USDT' | 'USDS'>('USDC')
  const [deployTargetId, setDeployTargetId] = useState('maple-syrup-usdc')

  // Initialize from current config when modal opens
  useEffect(() => {
    if (isOpen && currentConfig?.enabled) {
      setCollateralPercent(currentConfig.collateralPercent)
      setLtv(currentConfig.ltv)
      setBorrowAsset(currentConfig.borrowAsset)
      setDeployTargetId(currentConfig.deployTargetId)
    } else if (isOpen) {
      // Reset to defaults
      setCollateralPercent(50)
      setLtv(60)
      setBorrowAsset('USDC')
      setDeployTargetId('maple-syrup-usdc')
    }
  }, [isOpen, currentConfig])

  // Calculations
  const collateralValue = positionValue * (collateralPercent / 100)
  const borrowedAmount = collateralValue * (ltv / 100)
  const borrowRate = getBorrowRate(borrowAsset)
  const deployTarget = STABLECOIN_PRODUCTS.find((p) => p.id === deployTargetId)
  const deployApy = deployTarget?.apy ?? 0

  // Health Factor = (Collateral × Liquidation Threshold) / Borrowed
  const liquidationThreshold = collateralParams?.liquidationThreshold ?? 82.5
  const healthFactor = borrowedAmount > 0
    ? (collateralValue * (liquidationThreshold / 100)) / borrowedAmount
    : Infinity

  // Liquidation Price calculation (ETH price at which health factor = 1)
  // Simplified: current price × (1 - 1/healthFactor)
  const liquidationPrice = healthFactor > 1
    ? ethPrice * (1 - 1 / healthFactor)
    : 0
  const liquidationPriceDropPercent = ((ethPrice - liquidationPrice) / ethPrice) * 100

  // Net Boost = (borrowed × deployAPY - borrowed × borrowRate) / position
  const netBoostPercent = positionValue > 0
    ? ((borrowedAmount * (deployApy / 100)) - (borrowedAmount * (borrowRate / 100))) / positionValue * 100
    : 0

  // Annual yield and cost
  const annualYieldGain = borrowedAmount * (deployApy / 100)
  const annualBorrowCost = borrowedAmount * (borrowRate / 100)
  const netGainPerYear = annualYieldGain - annualBorrowCost

  const maxLtv = collateralParams?.maxLtv ?? 75

  // LTV risk zone
  const getLtvRiskColor = (ltvValue: number) => {
    const ratio = ltvValue / maxLtv
    if (ratio < 0.5) return 'text-green-600'
    if (ratio < 0.75) return 'text-amber-600'
    return 'text-red-600'
  }

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`
    }
    return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const handleApply = () => {
    onApply({
      enabled: true,
      collateralPercent,
      ltv,
      borrowAsset,
      deployTargetId,
    })
    onClose()
  }

  const handleRemove = () => {
    onRemove()
    onClose()
  }

  if (!product || !collateralParams) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure Leverage for ${product.name}`}
      subtitle={`Use your ${product.name} as collateral to borrow stablecoins`}
      footer={
        <div className="flex items-center justify-between">
          <button
            onClick={handleRemove}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Remove Leverage
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-900 rounded-lg hover:bg-purple-800 transition-colors"
            >
              Apply Leverage
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Position Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Your {product.name} position: <span className="font-semibold text-gray-900">{formatCurrency(positionValue)}</span>
          </p>
        </div>

        {/* Collateral Amount */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-900">
              Collateral Amount
            </label>
            <span className="text-sm font-semibold text-purple-900">{collateralPercent}%</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Percentage of position to use as collateral
          </p>
          <div className="relative h-2">
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-900 transition-all"
                style={{ width: `${collateralPercent}%` }}
              />
              <div
                className="absolute top-0 right-0 h-full bg-gray-200"
                style={{ width: `${100 - collateralPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={collateralPercent}
              onChange={(e) => setCollateralPercent(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-purple-900 rounded-full shadow pointer-events-none"
              style={{ left: `calc(${collateralPercent}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="text-sm text-gray-700 mt-2">
            Using <span className="font-semibold">{formatCurrency(collateralValue)}</span> of {formatCurrency(positionValue)} as collateral
          </p>
        </div>

        {/* LTV Slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-900">
              Loan-to-Value (LTV)
            </label>
            <span className="text-sm font-semibold text-purple-900">{ltv}%</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            How much to borrow against collateral
          </p>
          <div className="relative h-2">
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-900 transition-all"
                style={{ width: `${(ltv / maxLtv) * 100}%` }}
              />
              <div
                className="absolute top-0 right-0 h-full bg-gray-200"
                style={{ width: `${100 - (ltv / maxLtv) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={maxLtv}
              step={1}
              value={ltv}
              onChange={(e) => setLtv(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-purple-900 rounded-full shadow pointer-events-none"
              style={{ left: `calc(${(ltv / maxLtv) * 100}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-green-600">Safe<br/>0%</span>
            <span className="text-amber-600">Moderate<br/>50%</span>
            <span className="text-red-600">Risky<br/>{maxLtv}% Max</span>
          </div>
          <p className="text-sm text-gray-700 mt-2">
            Borrowing <span className="font-semibold">{formatCurrency(borrowedAmount)}</span> against {formatCurrency(collateralValue)} collateral
          </p>
        </div>

        {/* Borrow Asset */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Borrow Asset
          </label>
          <div className="flex gap-2 mt-2">
            {BORROW_OPTIONS.map((option) => (
              <button
                key={option.asset}
                onClick={() => setBorrowAsset(option.asset)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  borrowAsset === option.asset
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {option.asset}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Est. Borrow Rate: <span className="font-medium text-gray-700">~{borrowRate}% APY</span>
          </p>
        </div>

        {/* Deploy Target */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Deploy Borrowed Funds To
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Which stablecoin product receives the borrowed funds
          </p>
          <select
            value={deployTargetId}
            onChange={(e) => setDeployTargetId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          >
            {STABLECOIN_PRODUCTS.map((product) => (
              <option key={product.id} value={product.id}>
                {product.protocol} {product.name} ({product.apy}% APY)
              </option>
            ))}
          </select>
        </div>

        {/* Leverage Impact Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900">Leverage Impact</h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Borrowed:</span>
              <span className="font-mono font-medium text-gray-900">{formatCurrency(borrowedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Deploy APY:</span>
              <span className="font-mono font-medium text-gray-900">{deployApy.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Borrow Cost:</span>
              <span className="font-mono font-medium text-gray-900">{borrowRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Net Boost:</span>
              <span className={`font-mono font-medium ${netBoostPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netBoostPercent >= 0 ? '+' : ''}{netBoostPercent.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Health Factor:</span>
              <span className={`font-mono font-medium px-2 py-0.5 rounded ${
                healthFactor >= 1.5 ? 'bg-green-100 text-green-700' :
                healthFactor >= 1.2 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {healthFactor === Infinity ? '∞' : healthFactor.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Liquidation Price:</span>
              <span className="font-mono font-medium text-gray-900">
                {formatCurrency(liquidationPrice)}{' '}
                <span className="text-amber-600 text-xs">(-{liquidationPriceDropPercent.toFixed(0)}%)</span>
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Yield Gain:</span>
              <span className="font-mono font-medium text-green-600">+{formatCurrency(annualYieldGain)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Borrow Cost:</span>
              <span className="font-mono font-medium text-red-600">-{formatCurrency(annualBorrowCost)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-gray-900">Net Gain:</span>
              <span className={`font-mono ${netGainPerYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netGainPerYear >= 0 ? '+' : ''}{formatCurrency(netGainPerYear)}/year
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
