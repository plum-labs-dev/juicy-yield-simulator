'use client'

import { useState, ReactNode } from 'react'
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
    <div className="h-screen bg-[#FAFAFA] flex overflow-hidden">
      {/* Sidebar - full height */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Right side: Global Controls + Content */}
      <div className="flex-1 flex flex-col">
        {/* Global Controls */}
        <div className="border-b border-gray-200">
          {globalControls}
        </div>

        {/* Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
