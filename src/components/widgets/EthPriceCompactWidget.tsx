'use client'

import { usePortfolioStore } from '@/store/portfolioStore'
import { useState, useEffect, ChangeEvent } from 'react'

export function EthPriceCompactWidget() {
  const {
    ethPrice,
    priceChangeScenario,
    setEthPrice,
    setPriceChangeScenario,
  } = usePortfolioStore()

  const [localPrice, setLocalPrice] = useState<string>(ethPrice.toLocaleString())
  const [localScenario, setLocalScenario] = useState<string>(
    priceChangeScenario >= 0 ? `+${priceChangeScenario}` : `${priceChangeScenario}`
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setLocalPrice(ethPrice.toLocaleString())
  }, [ethPrice])

  useEffect(() => {
    setLocalScenario(priceChangeScenario >= 0 ? `+${priceChangeScenario}` : `${priceChangeScenario}`)
  }, [priceChangeScenario])

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '')
    setLocalPrice(e.target.value)
    const numValue = parseFloat(rawValue)
    if (!isNaN(numValue) && numValue >= 0) {
      setEthPrice(numValue)
    }
  }

  const handlePriceBlur = () => {
    const rawValue = localPrice.replace(/,/g, '')
    const numValue = parseFloat(rawValue)
    if (isNaN(numValue) || numValue < 0) {
      setLocalPrice(ethPrice.toLocaleString())
    } else {
      setLocalPrice(numValue.toLocaleString())
      setEthPrice(numValue)
    }
  }

  const handleFetchLivePrice = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      )
      if (!response.ok) throw new Error('API request failed')
      const data = await response.json()
      if (data.ethereum?.usd) {
        setEthPrice(data.ethereum.usd)
      }
    } catch (err) {
      console.error('Failed to fetch ETH price:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScenarioChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalScenario(e.target.value)
    const numValue = parseFloat(e.target.value.replace('+', ''))
    if (!isNaN(numValue)) {
      setPriceChangeScenario(numValue)
    }
  }

  const handleScenarioBlur = () => {
    const numValue = parseFloat(localScenario.replace('+', ''))
    if (isNaN(numValue)) {
      setLocalScenario(priceChangeScenario >= 0 ? `+${priceChangeScenario}` : `${priceChangeScenario}`)
    } else {
      setLocalScenario(numValue >= 0 ? `+${numValue}` : `${numValue}`)
      setPriceChangeScenario(numValue)
    }
  }

  const handleReset = () => {
    setEthPrice(3500)
    setPriceChangeScenario(5)
  }

  const projectedPrice = ethPrice * (1 + priceChangeScenario / 100)

  return (
    <div className="bg-white pt-6 px-6 pb-10 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">ETH Price</h3>
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Content - Price and Scenario side by side */}
      <div className="flex items-start gap-4">
        {/* Price - 128px width */}
        <div className="w-32">
          <label className="block text-xs text-gray-400 mb-1.5">Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="text"
              value={localPrice}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              className="w-full pl-7 pr-3 py-2.5 text-base font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48104a]/20 focus:border-[#48104a]"
            />
          </div>
          <button
            onClick={handleFetchLivePrice}
            disabled={isLoading}
            className="mt-1.5 text-xs text-[#48104a] hover:underline disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Fetch'}
          </button>
        </div>

        {/* Scenario - 128px width */}
        <div className="w-32">
          <label className="block text-xs text-gray-400 mb-1.5">Scenario</label>
          <div className="relative">
            <input
              type="text"
              value={localScenario}
              onChange={handleScenarioChange}
              onBlur={handleScenarioBlur}
              className="w-full pl-3 pr-6 py-2.5 text-base font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48104a]/20 focus:border-[#48104a]"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
          <div className="mt-1.5 text-xs text-gray-500">
            → ${projectedPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>
    </div>
  )
}
