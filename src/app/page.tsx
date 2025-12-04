import { Header } from '@/components/Header'
import { PortfolioSetupWidget } from '@/components/widgets/PortfolioSetupWidget'
import { EthPriceWidget } from '@/components/widgets/EthPriceWidget'
import { EthAllocationWidget } from '@/components/widgets/EthAllocationWidget'
import { StablecoinAllocationWidget } from '@/components/widgets/StablecoinAllocationWidget'
import { ApyWidget } from '@/components/widgets/ApyWidget'
import { HealthFactorWidget } from '@/components/widgets/HealthFactorWidget'
import { LiquidationPriceWidget } from '@/components/widgets/LiquidationPriceWidget'
import { TotalReturnWidget } from '@/components/widgets/TotalReturnWidget'
import { AnnualReturnWidget } from '@/components/widgets/AnnualReturnWidget'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

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
            <TotalReturnWidget />
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
            <AnnualReturnWidget />
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
