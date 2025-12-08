'use client'

import { usePortfolioStore } from '@/store/portfolioStore'
import { useHyperliquid, FALLBACK_FUNDING_RATE } from '@/hooks/useHyperliquid'

export function HedgeTab() {
  const {
    hedgeConfig,
    setHedgeConfig,
    hedgeCollateral,
    hedgePositionSize,
    investmentAmount,
    ethRatio,
    ethAmount,
  } = usePortfolioStore()

  const { data: hlData, isLoading, refresh } = useHyperliquid()

  const fundingRate = hlData?.fundingRate ?? FALLBACK_FUNDING_RATE
  const maxLeverage = hlData?.maxLeverage ?? 25

  // Hedge amount from global allocation
  const hedgeAllocationPercent = hedgeConfig.allocationPercent
  const hedgeAmount = investmentAmount * (hedgeAllocationPercent / 100)

  // Fund allocation (percentage of hedge funds to deploy as margin)
  const fundAllocation = hedgeConfig.fundAllocation ?? 80
  const deployedAmount = hedgeAmount * (fundAllocation / 100)

  // Leverage
  const leverage = hedgeConfig.leverage

  // Position calculations
  const collateral = deployedAmount
  const positionSize = collateral * leverage

  // ETH exposure
  const ethExposure = ethAmount()
  const hedgeCoverage = ethExposure > 0 ? (positionSize / ethExposure) * 100 : 0

  // Annual funding income (positive rate = shorts receive)
  const annualFundingIncome = positionSize * (fundingRate / 100)

  const formatUsd = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`
    }
    if (amount >= 1000) {
      return `$${Math.round(amount).toLocaleString()}`
    }
    return `$${amount.toLocaleString()}`
  }

  const handleFundAllocationChange = (value: number) => {
    setHedgeConfig({
      ...hedgeConfig,
      fundAllocation: value,
    })
  }

  const handleLeverageChange = (value: number) => {
    setHedgeConfig({
      ...hedgeConfig,
      leverage: value,
    })
  }

  // Leverage tick marks with custom positions
  const leverageTicks = [
    { value: 1, position: 0 },
    { value: 2, position: ((2 - 1) / (maxLeverage - 1)) * 100 },
    { value: 5, position: ((5 - 1) / (maxLeverage - 1)) * 100 },
    { value: 10, position: ((10 - 1) / (maxLeverage - 1)) * 100 },
    { value: 25, position: 100 },
  ]

  // Empty state when hedge allocation is 0
  if (hedgeAllocationPercent === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 mb-4 text-gray-300">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Hedge Allocation</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Adjust the hedge slider in Portfolio Allocation to enable hedging
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Card 1: Hedge Configuration */}
      <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">ETH Hedge</h2>
            <p className="text-sm text-gray-500 mt-1">Configure your Hyperliquid perpetual short position</p>
          </div>
          <div className="bg-[#48104a] text-white px-4 py-2 rounded-full text-sm font-medium">
            Hedge: {formatUsd(hedgeAmount)}
          </div>
        </div>

        {/* Fund Allocation Slider */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900">Fund Allocation</span>
            <span className="text-sm font-medium text-[#48104a]">
              {fundAllocation}% · {formatUsd(deployedAmount)} deployed
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={fundAllocation}
              onChange={(e) => handleFundAllocationChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #48104a 0%, #48104a ${fundAllocation}%, #E5E7EB ${fundAllocation}%, #E5E7EB 100%)`
              }}
            />
            {/* Tick marks */}
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Percentage of hedge funds to deploy as margin</p>
        </div>

        {/* Leverage Multiplier Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900">Leverage Multiplier</span>
            <span className="text-sm font-medium text-[#48104a]">{leverage}x</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="1"
              max={maxLeverage}
              value={leverage}
              onChange={(e) => handleLeverageChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #48104a 0%, #48104a ${((leverage - 1) / (maxLeverage - 1)) * 100}%, #E5E7EB ${((leverage - 1) / (maxLeverage - 1)) * 100}%, #E5E7EB 100%)`
              }}
            />
            {/* Tick marks */}
            <div className="relative mt-2 h-4">
              {leverageTicks.map((tick) => (
                <span
                  key={tick.value}
                  className="absolute text-xs text-gray-400 -translate-x-1/2"
                  style={{ left: `${tick.position}%` }}
                >
                  {tick.value}×
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Higher leverage = larger position, higher risk</p>
        </div>
      </div>

      {/* Card 2: Position Details */}
      <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-8">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Position Details</h3>

        <div className="bg-[#f9f7fa] rounded-xl p-6">
          <div className="grid grid-cols-3 gap-8">
            {/* Collateral */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Collateral</div>
              <div className="text-2xl font-bold text-gray-900">{formatUsd(collateral)}</div>
              <div className="text-xs text-gray-500 mt-1">From hedge allocation</div>
            </div>

            {/* Short Position */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Short Position</div>
              <div className="text-2xl font-bold text-gray-900">{formatUsd(positionSize)}</div>
              <div className="text-xs text-gray-500 mt-1">{leverage}x leverage</div>
            </div>

            {/* ETH Hedged */}
            <div>
              <div className="text-xs text-gray-500 mb-1">ETH Hedged</div>
              <div className={`text-2xl font-bold ${hedgeCoverage >= 100 ? 'text-[#2D6B4F]' : 'text-gray-900'}`}>
                {hedgeCoverage.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">of {formatUsd(ethExposure)} ETH exposure</div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Funding Rate */}
      <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-8 border-l-4 border-l-[#2D6B4F]">
        <div className="flex items-start justify-between">
          {/* Left side */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">Est. Funding Rate</span>
              <span className="flex items-center gap-1 text-xs text-[#2D6B4F]">
                <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
                Live
              </span>
            </div>
            <div className="text-2xl font-bold text-[#2D6B4F]">
              +{fundingRate.toFixed(1)}% APY
            </div>
            <div className="text-xs text-gray-500 mt-1">Paid to shorts (you earn this)</div>
          </div>

          {/* Right side */}
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Annual Funding Income</div>
            <div className="text-2xl font-bold text-[#2D6B4F]">
              +{formatUsd(annualFundingIncome)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Based on current rate</div>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="text-xs text-[#48104a] hover:underline mt-2 disabled:opacity-50"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
