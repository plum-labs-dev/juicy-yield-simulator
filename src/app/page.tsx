import { PortfolioSetupWidget } from '@/components/widgets/PortfolioSetupWidget'
import { EthPriceWidget } from '@/components/widgets/EthPriceWidget'
import { EthAllocationWidget } from '@/components/widgets/EthAllocationWidget'

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
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Widget Grid - will expand as we add more widgets */}
        <div className="grid grid-cols-4 gap-5">
          {/* Row 1 */}
          {/* Portfolio Setup - spans 3 columns */}
          <div className="col-span-3">
            <PortfolioSetupWidget />
          </div>

          {/* Placeholder for APY widget */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full flex items-center justify-center text-gray-400 text-sm">
              APY Widget
            </div>
          </div>

          {/* Row 2 */}
          {/* ETH Price - 1 column */}
          <div className="col-span-1">
            <EthPriceWidget />
          </div>

          {/* ETH Allocation - 2 columns */}
          <div className="col-span-2">
            <EthAllocationWidget />
          </div>

          {/* Placeholder for Total Return - 1 column */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full flex items-center justify-center text-gray-400 text-sm">
              Total Return Widget
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 text-center text-xs text-gray-400 bg-[#FAFAFA]">
        For simulation purposes only. Not financial advice.
      </footer>
    </div>
  )
}
