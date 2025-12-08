'use client'

import { useState } from 'react'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useLiveProducts, useLiveBorrowRate } from '@/hooks/useLiveApys'
import { useHyperliquid, FALLBACK_FUNDING_RATE } from '@/hooks/useHyperliquid'
import { COLLATERAL_PARAMS } from '@/lib/constants'
import { DualLogo } from '@/components/ui/Logo'
import { getProtocolLogo, getTokenLogo } from '@/lib/logos'

// Note: DualLogo imports are kept for the Allocation Breakdown section on the right side

type BreakdownView = 'eth' | 'stablecoin' | 'hedge'

export function ResultsTab() {
  const {
    investmentAmount,
    investmentPeriod,
    ethRatio,
    ethPrice,
    priceChangeScenario,
    hedgeConfig,
    ethAllocations,
    stablecoinAllocations,
    ethAmount,
    stablecoinAmount,
    totalBorrowedAmount,
  } = usePortfolioStore()

  const { ethProducts, stablecoinProducts } = useLiveProducts()
  const { data: hlData } = useHyperliquid()

  // Get borrow rates for leverage calculations
  const usdcBorrowRate = useLiveBorrowRate('USDC')
  const usdeBorrowRate = useLiveBorrowRate('USDe')

  const fundingRate = hlData?.fundingRate ?? FALLBACK_FUNDING_RATE

  // Accordion state for Return Breakdown
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    ethYield: true,
    ethPriceImpact: false,
    stablecoinYield: false,
    leverageNet: false,
    hedgeNet: false,
  })

  // Pie chart hover/click state
  const [activeBreakdown, setActiveBreakdown] = useState<BreakdownView>('eth')

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // ============ CALCULATIONS ============

  // Base amounts
  const ethTotal = ethAmount()
  const stableTotal = stablecoinAmount()
  const borrowedTotal = totalBorrowedAmount()

  // Hedge amounts
  const hedgeAllocationPercent = hedgeConfig.allocationPercent
  const hedgeAmount = investmentAmount * (hedgeAllocationPercent / 100)
  const fundAllocation = hedgeConfig.fundAllocation ?? 80
  const deployedHedgeAmount = hedgeAmount * (fundAllocation / 100)
  const hedgeLeverage = hedgeConfig.leverage
  const hedgePositionSize = deployedHedgeAmount * hedgeLeverage

  // ETH in base currency
  const ethInEth = ethTotal / ethPrice

  // Calculate ETH yield per product
  const ethYieldDetails = ethAllocations
    .filter(a => a.selected && a.weight > 0)
    .map(allocation => {
      const product = ethProducts.find(p => p.id === allocation.productId)
      if (!product) return null
      const positionValue = ethTotal * (allocation.weight / 100)
      const positionInEth = positionValue / ethPrice
      const yieldValue = positionValue * (product.apy / 100) * investmentPeriod
      const yieldInEth = yieldValue / ethPrice
      return {
        id: product.id,
        name: product.name,
        protocol: product.protocol,
        apy: product.apy,
        positionValue,
        positionInEth,
        yieldValue,
        yieldInEth,
        weight: allocation.weight,
      }
    })
    .filter(Boolean) as Array<{
      id: string
      name: string
      protocol: string
      apy: number
      positionValue: number
      positionInEth: number
      yieldValue: number
      yieldInEth: number
      weight: number
    }>

  // Total ETH yield
  const totalEthYield = ethYieldDetails.reduce((sum, d) => sum + d.yieldValue, 0)
  const totalEthYieldInEth = ethYieldDetails.reduce((sum, d) => sum + d.yieldInEth, 0)

  // Weighted ETH APY
  const weightedEthApy = ethYieldDetails.reduce((sum, d) => sum + (d.apy * d.weight / 100), 0)

  // ETH price impact (on principal and yield)
  const ethPriceChange = priceChangeScenario / 100
  const newEthPrice = ethPrice * (1 + ethPriceChange)
  const ethPrincipalImpact = ethTotal * ethPriceChange
  const ethYieldImpact = totalEthYield * ethPriceChange
  const ethPriceImpact = ethPrincipalImpact + ethYieldImpact

  // Calculate stablecoin yield per product (base allocation only)
  const stablecoinYieldDetails = stablecoinAllocations
    .filter(a => a.selected && a.weight > 0)
    .map(allocation => {
      const product = stablecoinProducts.find(p => p.id === allocation.productId)
      if (!product) return null
      const positionValue = stableTotal * (allocation.weight / 100)
      const yieldValue = positionValue * (product.apy / 100) * investmentPeriod
      return {
        id: product.id,
        name: product.name,
        protocol: product.protocol,
        apy: product.apy,
        positionValue,
        yieldValue,
        weight: allocation.weight,
      }
    })
    .filter(Boolean) as Array<{
      id: string
      name: string
      protocol: string
      apy: number
      positionValue: number
      yieldValue: number
      weight: number
    }>

  // Total stablecoin yield (base)
  const totalStablecoinYield = stablecoinYieldDetails.reduce((sum, d) => sum + d.yieldValue, 0)

  // Weighted stablecoin APY
  const stablecoinTotalWeight = stablecoinYieldDetails.reduce((sum, d) => sum + d.weight, 0)
  const weightedStablecoinApy = stablecoinTotalWeight > 0
    ? stablecoinYieldDetails.reduce((sum, d) => sum + (d.apy * d.weight / stablecoinTotalWeight), 0)
    : 0

  // Leverage calculations
  const leverageDetails = ethAllocations
    .filter(a => a.leverage?.enabled)
    .map(allocation => {
      const product = ethProducts.find(p => p.id === allocation.productId)
      if (!product || !allocation.leverage) return null

      const positionValue = ethTotal * (allocation.weight / 100)
      const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
      const borrowed = collateralValue * (allocation.leverage.ltv / 100)

      const borrowRate = allocation.leverage.borrowAsset === 'USDC' ? usdcBorrowRate : usdeBorrowRate
      const borrowCost = borrowed * (borrowRate / 100) * investmentPeriod

      const deployTarget = stablecoinProducts.find(p => p.id === allocation.leverage?.deployTargetId)
      const deployYield = deployTarget ? borrowed * (deployTarget.apy / 100) * investmentPeriod : 0

      const netYield = deployYield - borrowCost

      return {
        productName: product.name,
        productProtocol: product.protocol,
        deployTargetName: deployTarget?.name ?? 'Unknown',
        deployTargetProtocol: deployTarget?.protocol ?? '',
        borrowed,
        borrowRate,
        borrowCost,
        deployYield,
        netYield,
      }
    })
    .filter(Boolean) as Array<{
      productName: string
      productProtocol: string
      deployTargetName: string
      deployTargetProtocol: string
      borrowed: number
      borrowRate: number
      borrowCost: number
      deployYield: number
      netYield: number
    }>

  const totalLeverageYield = leverageDetails.reduce((sum, d) => sum + d.deployYield, 0)
  const totalBorrowCost = leverageDetails.reduce((sum, d) => sum + d.borrowCost, 0)
  const totalLeverageNet = totalLeverageYield - totalBorrowCost

  // Hedge calculations
  const hedgeFundingIncome = hedgePositionSize * (fundingRate / 100) * investmentPeriod
  // Hedge P&L from price change (short position profits when price drops)
  const hedgePnL = hedgePositionSize * (-ethPriceChange)
  const hedgeNetReturn = hedgeFundingIncome + hedgePnL

  // Total returns
  const totalReturn = totalEthYield + ethPriceImpact + totalStablecoinYield + totalLeverageNet + (hedgeConfig.enabled ? hedgeNetReturn : 0)
  const expectedBalance = investmentAmount + totalReturn

  // ETH balance after yield and price change
  const finalEthInEth = ethInEth + totalEthYieldInEth
  const finalEthValue = finalEthInEth * newEthPrice

  // USD portion (stablecoins + borrowed deployed)
  const finalUsdValue = stableTotal + totalStablecoinYield + borrowedTotal + totalLeverageNet

  // Portfolio APY (yield only, excluding price change)
  const yieldOnlyReturn = totalEthYield + totalStablecoinYield + totalLeverageNet + (hedgeConfig.enabled ? hedgeFundingIncome : 0)
  const portfolioApy = investmentPeriod > 0 ? (yieldOnlyReturn / investmentAmount) / investmentPeriod * 100 : 0

  // Health Factor calculation
  const calculateHealthFactor = () => {
    let totalCollateralValue = 0
    let totalBorrowValue = 0

    ethAllocations.forEach(allocation => {
      if (allocation.leverage?.enabled) {
        const positionValue = ethTotal * (allocation.weight / 100)
        const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
        const borrowed = collateralValue * (allocation.leverage.ltv / 100)

        const params = COLLATERAL_PARAMS[allocation.productId]
        const liqThreshold = params?.liquidationThreshold ?? 80

        totalCollateralValue += collateralValue * (liqThreshold / 100)
        totalBorrowValue += borrowed
      }
    })

    if (totalBorrowValue === 0) return null
    return totalCollateralValue / totalBorrowValue
  }

  const healthFactor = calculateHealthFactor()

  // Liquidation price calculation
  const calculateLiquidationPrice = () => {
    if (!healthFactor || healthFactor === null) return null

    const dropPercent = 1 - (1 / healthFactor)
    return {
      price: ethPrice * (1 - dropPercent),
      dropPercent: dropPercent * 100,
    }
  }

  const liquidationData = calculateLiquidationPrice()

  // ============ FORMATTERS ============

  const formatUsd = (amount: number, showSign = false): string => {
    const isNegative = amount < 0
    const absAmount = Math.abs(amount)
    const sign = showSign && amount > 0 ? '+' : (isNegative ? '-' : '')

    if (absAmount >= 1000000) {
      return `${sign}$${(absAmount / 1000000).toFixed(2)}M`
    }
    if (absAmount >= 1000) {
      return `${sign}$${Math.round(absAmount).toLocaleString()}`
    }
    return `${sign}$${absAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const formatEth = (amount: number): string => {
    return `${amount.toFixed(1)} ETH`
  }

  const formatPercent = (value: number, showSign = false): string => {
    const sign = showSign && value > 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  const getHealthFactorColor = (hf: number) => {
    if (hf >= 1.5) return 'text-[#2D6B4F]'
    if (hf >= 1.2) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthFactorLabel = (hf: number) => {
    if (hf >= 1.5) return 'Safe'
    if (hf >= 1.2) return 'Caution'
    return 'At Risk'
  }

  // ============ RENDER ============

  return (
    <div className="space-y-4">
      {/* Card 1: Expected Balance Hero */}
      <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-8">
        <div className="flex items-start justify-between">
          {/* Left: Expected Balance */}
          <div>
            <div className="text-sm text-gray-500 mb-1">Expected Balance</div>
            <div className="text-5xl font-bold text-[#48104a]">{formatUsd(expectedBalance)}</div>
            <div className="text-sm text-gray-500 mt-2">After {investmentPeriod} year{investmentPeriod !== 1 ? 's' : ''}</div>
          </div>

          {/* Right: ETH and USD breakdown */}
          <div className="text-right">
            <div className="text-sm text-[#2D6B4F] font-semibold">
              ETH: {formatEth(ethInEth)} → {formatEth(finalEthInEth)} (+{formatEth(totalEthYieldInEth)})
            </div>
            <div className="text-sm text-gray-500">→ {formatUsd(finalEthValue)}</div>
            <div className="text-sm text-[#2D6B4F] font-semibold mt-2">
              USD: {formatUsd(stableTotal + borrowedTotal)} → {formatUsd(finalUsdValue)} ({formatUsd(totalStablecoinYield + totalLeverageNet, true)})
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Total Return & Portfolio APY (side by side) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Return */}
        <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-6">
          <div className="text-sm text-gray-500 mb-1">Total Return</div>
          <div className={`text-4xl font-bold ${totalReturn >= 0 ? 'text-[#2D6B4F]' : 'text-red-600'}`}>
            {formatUsd(totalReturn, true)}
          </div>
          <div className={`text-sm ${totalReturn >= 0 ? 'text-[#2D6B4F]' : 'text-red-600'} mt-1`}>
            ({formatPercent((totalReturn / investmentAmount) * 100, true)})
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Including {formatPercent(priceChangeScenario, true)} ETH scenario
          </div>
        </div>

        {/* Portfolio APY */}
        <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-6">
          <div className="text-sm text-gray-500 mb-1">Portfolio APY</div>
          <div className="text-4xl font-bold text-[#48104a]">
            {formatPercent(portfolioApy)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Blended yield rate</div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ETH:</span>
              <span className="font-semibold text-[#1a1a1a]">{formatPercent(weightedEthApy)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Stablecoin:</span>
              <span className="font-semibold text-[#1a1a1a]">{formatPercent(weightedStablecoinApy)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Risk Metrics (only if leverage active) */}
      {(healthFactor !== null || hedgeConfig.enabled) && (
        <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Risk Metrics</h3>
          <div className="grid grid-cols-2 gap-8">
            {/* Health Factor */}
            {healthFactor !== null && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Health Factor</div>
                <div className={`text-4xl font-bold ${getHealthFactorColor(healthFactor)}`}>
                  {healthFactor.toFixed(2)}
                </div>
                <div className={`text-sm ${getHealthFactorColor(healthFactor)}`}>
                  {getHealthFactorLabel(healthFactor)}
                </div>
              </div>
            )}

            {/* Liquidation Price */}
            {liquidationData && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Liquidation Price</div>
                <div className="text-4xl font-bold text-gray-900">
                  {formatUsd(liquidationData.price)}
                </div>
                <div className="text-sm text-[#B8860B]">
                  -{liquidationData.dropPercent.toFixed(0)}% from current ({formatUsd(ethPrice)})
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card 4: Return Breakdown */}
      <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Return Breakdown</h3>
        <p className="text-xs text-gray-500 mb-4">Click each category to see per-product details</p>

        <div className="divide-y divide-gray-200">
          {/* ETH Yield Section */}
          <div>
            <button
              onClick={() => toggleSection('ethYield')}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.ethYield ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-medium text-gray-900">ETH Yield</span>
              </div>
              <span className="text-[#2D6B4F] font-medium">
                +{formatEth(totalEthYieldInEth)} ({formatUsd(totalEthYield)})
              </span>
            </button>
            {expandedSections.ethYield && ethYieldDetails.length > 0 && (
              <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-2">
                {ethYieldDetails.map((detail) => (
                  <div key={detail.name} className="flex items-center justify-between text-sm pl-6">
                    <span className="text-gray-500">└ {detail.name}</span>
                    <span className="text-gray-600">
                      +{detail.yieldInEth.toFixed(2)} ETH ({formatUsd(detail.yieldValue)})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ETH Price Impact Section */}
          <div>
            <button
              onClick={() => toggleSection('ethPriceImpact')}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.ethPriceImpact ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-medium text-gray-900">ETH Price Impact ({formatPercent(priceChangeScenario, true)})</span>
              </div>
              <span className={`font-medium ${ethPriceImpact >= 0 ? 'text-[#2D6B4F]' : 'text-red-600'}`}>
                {formatUsd(ethPriceImpact, true)}
              </span>
            </button>
            {expandedSections.ethPriceImpact && (
              <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-2">
                <div className="flex items-center justify-between text-sm pl-6">
                  <span className="text-gray-500">└ Principal ({formatUsd(ethTotal)})</span>
                  <span className={ethPrincipalImpact >= 0 ? 'text-[#2D6B4F]' : 'text-red-600'}>
                    {formatUsd(ethPrincipalImpact, true)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pl-6">
                  <span className="text-gray-500">└ Yield ({formatUsd(totalEthYield)})</span>
                  <span className={ethYieldImpact >= 0 ? 'text-[#2D6B4F]' : 'text-red-600'}>
                    {formatUsd(ethYieldImpact, true)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Stablecoin Yield Section */}
          <div>
            <button
              onClick={() => toggleSection('stablecoinYield')}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.stablecoinYield ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-medium text-gray-900">Stablecoin Yield</span>
              </div>
              <span className="text-[#2D6B4F] font-medium">
                {formatUsd(totalStablecoinYield, true)}
              </span>
            </button>
            {expandedSections.stablecoinYield && stablecoinYieldDetails.length > 0 && (
              <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-2">
                {stablecoinYieldDetails.map((detail) => (
                  <div key={detail.name} className="flex items-center justify-between text-sm pl-6">
                    <span className="text-gray-500">└ {detail.protocol} {detail.name}</span>
                    <span className="text-gray-600">{formatUsd(detail.yieldValue, true)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leverage Net Section (only if leverage active) */}
          {leverageDetails.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('leverageNet')}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.leverageNet ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium text-gray-900">Leverage Net</span>
                </div>
                <span className={`font-medium ${totalLeverageNet >= 0 ? 'text-[#2D6B4F]' : 'text-red-600'}`}>
                  {formatUsd(totalLeverageNet, true)}
                </span>
              </button>
              {expandedSections.leverageNet && (
                <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-2">
                  {leverageDetails.map((detail) => (
                    <div key={detail.productName} className="space-y-2">
                      <div className="flex items-center justify-between text-sm pl-6">
                        <span className="text-gray-500">└ {detail.productName} → {detail.deployTargetProtocol} {detail.deployTargetName}</span>
                        <span className="text-[#2D6B4F]">{formatUsd(detail.deployYield, true)} yield</span>
                      </div>
                      <div className="flex items-center justify-between text-sm pl-6">
                        <span className="text-gray-500">└ Borrow cost</span>
                        <span className="text-red-600">{formatUsd(-detail.borrowCost)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pl-6 pt-2 border-t border-gray-200">
                    <span className="text-[#2D6B4F] font-medium">Net</span>
                    <span className={`font-medium ${totalLeverageNet >= 0 ? 'text-[#2D6B4F]' : 'text-red-600'}`}>
                      {formatUsd(totalLeverageNet, true)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hedge Net Section (only if hedge active) */}
          {hedgeConfig.enabled && hedgeConfig.allocationPercent > 0 && (
            <div>
              <button
                onClick={() => toggleSection('hedgeNet')}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.hedgeNet ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium text-gray-900">Hedge Net</span>
                </div>
                <span className={`font-medium ${hedgeNetReturn >= 0 ? 'text-[#2D6B4F]' : 'text-red-600'}`}>
                  {formatUsd(hedgeNetReturn, true)}
                </span>
              </button>
              {expandedSections.hedgeNet && (
                <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between text-sm pl-6">
                    <span className="text-gray-500">└ Funding income</span>
                    <span className="text-[#2D6B4F]">{formatUsd(hedgeFundingIncome, true)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pl-6">
                    <span className="text-gray-500">└ Price hedge P&L</span>
                    <span className={hedgePnL >= 0 ? 'text-[#2D6B4F]' : 'text-red-600'}>
                      {formatUsd(hedgePnL, true)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Total Return - with colored divider */}
          <div className="border-t-2 border-[#48104a]">
            <div
              className="flex items-center justify-between px-4 py-4"
              style={{ background: 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 100%)' }}
            >
              <span className="font-semibold text-[#48104a]">Total Return</span>
              <span className={`font-bold text-lg ${totalReturn >= 0 ? 'text-[#2D6B4F]' : 'text-red-600'}`}>
                {formatUsd(totalReturn, true)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 5: Allocation by Category (with pie chart) */}
      <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Left: Pie Chart */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-6">Allocation by Category</h3>
            <div className="flex justify-center mb-8">
              <AllocationPieChart
                ethPercent={ethRatio}
                stablePercent={100 - ethRatio - hedgeAllocationPercent}
                hedgePercent={hedgeAllocationPercent}
                activeSegment={activeBreakdown}
                onSegmentClick={setActiveBreakdown}
              />
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setActiveBreakdown('eth')}
                className={`flex items-center gap-2 ${activeBreakdown === 'eth' ? 'opacity-100' : 'opacity-50'}`}
              >
                <div className="w-3 h-3 rounded-full bg-[#48104a]" />
                <span className="text-xs text-gray-600">ETH</span>
              </button>
              <button
                onClick={() => setActiveBreakdown('stablecoin')}
                className={`flex items-center gap-2 ${activeBreakdown === 'stablecoin' ? 'opacity-100' : 'opacity-50'}`}
              >
                <div className="w-3 h-3 rounded-full bg-[#9B6B9B]" />
                <span className="text-xs text-gray-600">Stablecoin</span>
              </button>
              {hedgeAllocationPercent > 0 && (
                <button
                  onClick={() => setActiveBreakdown('hedge')}
                  className={`flex items-center gap-2 ${activeBreakdown === 'hedge' ? 'opacity-100' : 'opacity-50'}`}
                >
                  <div className="w-3 h-3 rounded-full bg-[#6B7280]" />
                  <span className="text-xs text-gray-600">Hedge</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Breakdown based on active segment */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              {activeBreakdown === 'eth' && 'ETH Breakdown'}
              {activeBreakdown === 'stablecoin' && 'Stablecoin Breakdown'}
              {activeBreakdown === 'hedge' && 'Hedge Breakdown'}
            </h3>
            <div className="divide-y divide-gray-100">
              {activeBreakdown === 'eth' && ethYieldDetails.map((detail) => (
                <div key={detail.name} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <DualLogo
                      tokenSrc={getTokenLogo(detail.name)}
                      protocolSrc={getProtocolLogo(detail.protocol)}
                      tokenAlt={detail.name}
                      protocolAlt={detail.protocol}
                      size={24}
                    />
                    <span className="text-gray-900">{detail.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">{detail.weight}%</span>
                    <span className="text-[#48104a] font-medium">
                      {formatEth(detail.positionInEth)} ({formatUsd(detail.positionValue)})
                    </span>
                  </div>
                </div>
              ))}
              {activeBreakdown === 'stablecoin' && stablecoinYieldDetails.map((detail) => (
                <div key={detail.name} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <DualLogo
                      tokenSrc={getTokenLogo(detail.name)}
                      protocolSrc={getProtocolLogo(detail.protocol)}
                      tokenAlt={detail.name}
                      protocolAlt={detail.protocol}
                      size={24}
                    />
                    <span className="text-gray-900">{detail.protocol} {detail.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">{detail.weight}%</span>
                    <span className="text-[#48104a] font-medium">
                      {formatUsd(detail.positionValue)}
                    </span>
                  </div>
                </div>
              ))}
              {activeBreakdown === 'hedge' && (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#6B7280] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">H</span>
                    </div>
                    <span className="text-gray-900">Hyperliquid Short</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">{hedgeAllocationPercent}%</span>
                    <span className="text-[#48104a] font-medium">
                      {formatUsd(hedgeAmount)}
                    </span>
                  </div>
                </div>
              )}
              {activeBreakdown === 'eth' && ethYieldDetails.length === 0 && (
                <div className="py-4 text-center text-gray-400 text-sm">No ETH products selected</div>
              )}
              {activeBreakdown === 'stablecoin' && stablecoinYieldDetails.length === 0 && (
                <div className="py-4 text-center text-gray-400 text-sm">No stablecoin products selected</div>
              )}
              {activeBreakdown === 'hedge' && hedgeAllocationPercent === 0 && (
                <div className="py-4 text-center text-gray-400 text-sm">No hedge configured</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// SVG Donut Chart Component with gaps and labels
function AllocationPieChart({
  ethPercent,
  stablePercent,
  hedgePercent,
  activeSegment,
  onSegmentClick,
}: {
  ethPercent: number
  stablePercent: number
  hedgePercent: number
  activeSegment: BreakdownView
  onSegmentClick: (segment: BreakdownView) => void
}) {
  const size = 220
  const strokeWidth = 52 // Thick stroke for all segments
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2
  const gapPercent = 2 // Gap between segments (in percentage)

  // Threshold for displaying label outside (if segment is less than this %)
  const outsideLabelThreshold = 15

  // Adjust percentages to account for gaps
  const adjustedEth = ethPercent > 0 ? ethPercent - gapPercent : 0
  const adjustedStable = stablePercent > 0 ? stablePercent - gapPercent : 0
  const adjustedHedge = hedgePercent > 0 ? hedgePercent - gapPercent : 0

  // Calculate dash lengths
  const ethDash = (adjustedEth / 100) * circumference
  const stableDash = (adjustedStable / 100) * circumference
  const hedgeDash = (adjustedHedge / 100) * circumference
  const gapDash = (gapPercent / 100) * circumference

  // Calculate starting angles for labels
  const ethStartAngle = -90
  const ethEndAngle = ethStartAngle + (ethPercent / 100) * 360
  const ethMidAngle = (ethStartAngle + ethEndAngle) / 2

  const stableStartAngle = ethEndAngle
  const stableEndAngle = stableStartAngle + (stablePercent / 100) * 360
  const stableMidAngle = (stableStartAngle + stableEndAngle) / 2

  const hedgeStartAngle = stableEndAngle
  const hedgeEndAngle = hedgeStartAngle + (hedgePercent / 100) * 360
  const hedgeMidAngle = (hedgeStartAngle + hedgeEndAngle) / 2

  // Calculate label positions - inside or outside based on segment size
  const getLabelPosition = (angle: number, percent: number) => {
    const rad = (angle * Math.PI) / 180
    const isOutside = percent < outsideLabelThreshold
    const labelRadius = isOutside ? radius + 45 : radius
    return {
      x: center + labelRadius * Math.cos(rad),
      y: center + labelRadius * Math.sin(rad),
      isOutside,
    }
  }

  const ethLabel = getLabelPosition(ethMidAngle, ethPercent)
  const stableLabel = getLabelPosition(stableMidAngle, stablePercent)
  const hedgeLabel = getLabelPosition(hedgeMidAngle, hedgePercent)

  // Get opacity based on active state (no size difference)
  const getSegmentOpacity = (segment: BreakdownView) =>
    activeSegment === segment ? 1 : 0.35

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="cursor-pointer">
      {/* ETH segment (purple) */}
      {ethPercent > 0 && (
        <g onClick={() => onSegmentClick('eth')} className="cursor-pointer">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#48104a"
            strokeWidth={strokeWidth}
            strokeDasharray={`${ethDash} ${circumference}`}
            strokeDashoffset={0}
            transform={`rotate(-90 ${center} ${center})`}
            opacity={getSegmentOpacity('eth')}
            className="transition-opacity duration-200 hover:opacity-80"
          />
          {/* ETH Label */}
          <text
            x={ethLabel.x}
            y={ethLabel.y - 6}
            textAnchor="middle"
            fill={ethLabel.isOutside ? '#48104a' : '#ffffff'}
            className="text-[10px] font-medium pointer-events-none"
          >
            ETH
          </text>
          <text
            x={ethLabel.x}
            y={ethLabel.y + 8}
            textAnchor="middle"
            fill={ethLabel.isOutside ? '#48104a' : '#ffffff'}
            className="text-[10px] font-medium pointer-events-none"
          >
            {ethPercent}%
          </text>
        </g>
      )}
      {/* Stablecoin segment */}
      {stablePercent > 0 && (
        <g onClick={() => onSegmentClick('stablecoin')} className="cursor-pointer">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#9B6B9B"
            strokeWidth={strokeWidth}
            strokeDasharray={`${stableDash} ${circumference}`}
            strokeDashoffset={-(ethDash + gapDash)}
            transform={`rotate(-90 ${center} ${center})`}
            opacity={getSegmentOpacity('stablecoin')}
            className="transition-opacity duration-200 hover:opacity-80"
          />
          {/* Stablecoin Label */}
          <text
            x={stableLabel.x}
            y={stableLabel.y - 6}
            textAnchor="middle"
            fill={stableLabel.isOutside ? '#9B6B9B' : '#ffffff'}
            className="text-[10px] font-medium pointer-events-none"
          >
            Stable
          </text>
          <text
            x={stableLabel.x}
            y={stableLabel.y + 8}
            textAnchor="middle"
            fill={stableLabel.isOutside ? '#9B6B9B' : '#ffffff'}
            className="text-[10px] font-medium pointer-events-none"
          >
            {stablePercent}%
          </text>
        </g>
      )}
      {/* Hedge segment */}
      {hedgePercent > 0 && (
        <g onClick={() => onSegmentClick('hedge')} className="cursor-pointer">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#6B7280"
            strokeWidth={strokeWidth}
            strokeDasharray={`${hedgeDash} ${circumference}`}
            strokeDashoffset={-(ethDash + gapDash + stableDash + gapDash)}
            transform={`rotate(-90 ${center} ${center})`}
            opacity={getSegmentOpacity('hedge')}
            className="transition-opacity duration-200 hover:opacity-80"
          />
          {/* Hedge Label */}
          <text
            x={hedgeLabel.x}
            y={hedgeLabel.y - 6}
            textAnchor="middle"
            fill={hedgeLabel.isOutside ? '#6B7280' : '#ffffff'}
            className="text-[10px] font-medium pointer-events-none"
          >
            Hedge
          </text>
          <text
            x={hedgeLabel.x}
            y={hedgeLabel.y + 8}
            textAnchor="middle"
            fill={hedgeLabel.isOutside ? '#6B7280' : '#ffffff'}
            className="text-[10px] font-medium pointer-events-none"
          >
            {hedgePercent}%
          </text>
        </g>
      )}
    </svg>
  )
}
