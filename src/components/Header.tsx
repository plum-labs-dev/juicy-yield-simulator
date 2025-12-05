'use client'

import { useState } from 'react'

export function Header() {
  const [lang, setLang] = useState<'en' | 'kr'>('en')

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#48104a]">PlumLabs</span>
          <span className="text-gray-300">|</span>
          <span className="text-base font-medium text-gray-500">DeFi Yield Simulator</span>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              lang === 'en'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            EN
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <button
            onClick={() => setLang('kr')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              lang === 'kr'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            KR
          </button>
        </div>
      </div>
    </header>
  )
}
