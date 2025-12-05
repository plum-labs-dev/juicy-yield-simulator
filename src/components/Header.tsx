'use client';

import { usePortfolioStore } from '@/store/portfolioStore';

export function Header() {
    const reset = usePortfolioStore((state) => state.reset);

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#48104a]">MSWLabs</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-lg font-medium text-gray-600">DeFi Yield Simulator</span>
                </div>
                <button
                    onClick={reset}
                    className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors"
                >
                    Reset
                </button>
            </div>
        </header>
    );
}
