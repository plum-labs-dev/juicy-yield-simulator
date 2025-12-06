'use client'

import { useHydration } from '@/store/portfolioStore'
import { ReactNode } from 'react'

interface HydrationGuardProps {
  children: ReactNode
}

export function HydrationGuard({ children }: HydrationGuardProps) {
  const hydrated = useHydration()

  if (!hydrated) {
    // Show a minimal loading state that matches the layout
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#48104a]">Prism DeFi Labs</span>
            <span className="text-gray-300">|</span>
            <span className="text-lg font-medium text-gray-600">DeFi Yield Simulator</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-[#48104a] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2.5 h-2.5 bg-[#48104a] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2.5 h-2.5 bg-[#48104a] rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
