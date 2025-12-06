import { HydrationGuard } from '@/components/HydrationGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { PortfolioAllocationWidget } from '@/components/widgets/PortfolioAllocationWidget'
import { EthPriceCompactWidget } from '@/components/widgets/EthPriceCompactWidget'
import { EthProductsTab } from '@/components/tabs/EthProductsTab'

// Global Controls: Portfolio Allocation expands, ETH Price fits content with gap between
function GlobalControls() {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <PortfolioAllocationWidget />
      </div>
      <EthPriceCompactWidget />
    </div>
  )
}

// Placeholder components for tab content
function TabPlaceholder({ name }: { name: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 min-h-[400px] flex items-center justify-center text-gray-400">
      {name}
    </div>
  )
}

export default function Home() {
  return (
    <HydrationGuard>
      <AppLayout
        globalControls={<GlobalControls />}
        ethContent={<EthProductsTab />}
        stablecoinContent={<TabPlaceholder name="Content Area" />}
        hedgeContent={<TabPlaceholder name="Content Area" />}
        resultsContent={<TabPlaceholder name="Content Area" />}
      />
    </HydrationGuard>
  )
}
