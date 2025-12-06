'use client'

import { useState, ReactNode } from 'react'
import { Header } from '@/components/Header'
import { Sidebar, TabId } from './Sidebar'

interface AppLayoutProps {
  globalControls: ReactNode
  ethContent: ReactNode
  stablecoinContent: ReactNode
  hedgeContent: ReactNode
  resultsContent: ReactNode
}

export function AppLayout({
  globalControls,
  ethContent,
  stablecoinContent,
  hedgeContent,
  resultsContent,
}: AppLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('eth')

  const renderContent = () => {
    switch (activeTab) {
      case 'eth':
        return ethContent
      case 'stablecoin':
        return stablecoinContent
      case 'hedge':
        return hedgeContent
      case 'results':
        return resultsContent
      default:
        return ethContent
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Header />

      {/* Global Controls - edge-to-edge, no bottom border */}
      <div>
        {globalControls}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content Area */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
