import { PortfolioSetupWidget } from '@/components/widgets/PortfolioSetupWidget'
import { EthPriceWidget } from '@/components/widgets/EthPriceWidget'
import { EthAllocationWidget } from '@/components/widgets/EthAllocationWidget'
import { StablecoinAllocationWidget } from '@/components/widgets/StablecoinAllocationWidget'
import { ApyWidget } from '@/components/widgets/ApyWidget'
import { HealthFactorWidget } from '@/components/widgets/HealthFactorWidget'
import { LiquidationPriceWidget } from '@/components/widgets/LiquidationPriceWidget'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-[#48104a]">Juicy Yield</h1>
            <span className="text-sm text-gray-500">
              Institutional DeFi Portfolio Simulator
            </span>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Export Summary
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Widget Grid - responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Row 1: Portfolio Setup + APY */}
          <div className="md:col-span-2 lg:col-span-3">
            <PortfolioSetupWidget />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <ApyWidget />
          </div>

          {/* Row 2: ETH Price + ETH Allocation + Total Return */}
          <div className="md:col-span-1 lg:col-span-1">
            <EthPriceWidget className="h-full" />
          </div>
          <div className="md:col-span-1 lg:col-span-2">
            <EthAllocationWidget />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full flex items-center justify-center text-gray-400 text-sm min-h-[120px]">
              Total Return Widget
            </div>
          </div>

          {/* Row 3: Health Factor/Liquidation stacked + Stablecoin Allocation + Annual Return placeholder */}
          <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-4 sm:gap-5">
            <div className="flex-1">
              <HealthFactorWidget />
            </div>
            <div className="flex-1">
              <LiquidationPriceWidget />
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <StablecoinAllocationWidget />
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full flex items-center justify-center text-gray-400 text-sm min-h-[120px]">
              Annual Return Widget
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400">
        For simulation purposes only. Not financial advice.
      </footer>
    </div>
  )
}
