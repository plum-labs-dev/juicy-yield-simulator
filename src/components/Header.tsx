'use client'

import { usePortfolioStore } from '@/store/portfolioStore'

export function Header() {
  const reset = usePortfolioStore((state) => state.reset)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[#48104a]">Juicy Yield</h1>
          <span className="text-sm text-gray-500">
            Institutional DeFi Portfolio Simulator
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            Reset
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Export Summary
          </button>
        </div>
      </div>
    </header>
  )
}
