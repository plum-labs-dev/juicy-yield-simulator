'use client'

import { usePortfolioStore } from '@/store/portfolioStore'
import { ThreeSegmentSlider } from '@/components/ui/Slider'

export function PortfolioAllocationWidget() {
  const {
    investmentAmount,
    ethRatio,
    ethPrice,
    hedgeConfig,
    setInvestmentAmount,
    setEthRatio,
    setHedgeConfig,
    reset,
  } = usePortfolioStore()

  // Always show hedge allocation (don't check enabled flag for display)
  const hedgePercent = hedgeConfig.allocationPercent
  const stablePercent = 100 - ethRatio - hedgePercent

  // Calculate amounts
  const ethAmount = investmentAmount * (ethRatio / 100)
  const stableAmount = investmentAmount * (stablePercent / 100)
  const hedgeAmount = investmentAmount * (hedgePercent / 100)

  const handleEthChange = (newEthPercent: number) => {
    setEthRatio(newEthPercent)
  }

  const handleHedgeChange = (newHedgePercent: number) => {
    // Enable hedge and set allocation when user drags the handle
    setHedgeConfig({
      ...hedgeConfig,
      enabled: newHedgePercent > 0,
      allocationPercent: newHedgePercent,
    })
  }

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US')
  }

  const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^0-9.]/g, '')
    return parseFloat(cleaned) || 0
  }

  return (
    <div className="bg-white p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Portfolio Allocation</h3>
        <button
          onClick={reset}
          className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Content - 50/50 split */}
      <div className="flex gap-8">
        {/* Left: Investment Amount (50%) */}
        <div className="w-1/2">
          <label className="block text-xs text-gray-400 mb-1.5">Investment Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="text"
              value={formatCurrency(investmentAmount)}
              onChange={(e) => setInvestmentAmount(parseCurrency(e.target.value))}
              className="w-full pl-7 pr-3 py-2.5 text-base font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48104a]/20 focus:border-[#48104a]"
            />
          </div>
        </div>

        {/* Right: Allocation Slider (50%) */}
        <div className="w-1/2">
          <label className="block text-xs text-gray-400 mb-1.5">ETH / Stablecoin / Hedge</label>
          <ThreeSegmentSlider
            ethPercent={ethRatio}
            stablePercent={stablePercent}
            hedgePercent={hedgePercent}
            onEthChange={handleEthChange}
            onHedgeChange={handleHedgeChange}
            ethAmount={ethAmount}
            stableAmount={stableAmount}
            hedgeAmount={hedgeAmount}
            ethPrice={ethPrice}
          />
        </div>
      </div>
    </div>
  )
}
