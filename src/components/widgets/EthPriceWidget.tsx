'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useState, useEffect, ChangeEvent } from 'react'

export function EthPriceWidget() {
  const {
    ethPrice,
    priceChangeScenario,
    setEthPrice,
    setPriceChangeScenario,
  } = usePortfolioStore()

  const [localPrice, setLocalPrice] = useState<string>(ethPrice.toLocaleString())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLocalPrice(ethPrice.toLocaleString())
  }, [ethPrice])

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
    setError(null)

    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      )

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      if (data.ethereum?.usd) {
        setEthPrice(data.ethereum.usd)
      } else {
        throw new Error('Invalid response')
      }
    } catch (err) {
      console.error('Failed to fetch ETH price:', err)
      setError('Failed to fetch price')
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScenarioChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPriceChangeScenario(parseFloat(e.target.value))
  }

  const projectedPrice = ethPrice * (1 + priceChangeScenario / 100)
  const percentage = ((priceChangeScenario - (-100)) / (1000 - (-100))) * 100

  const formatPrice = (price: number): string => {
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  return (
    <Card title="ETH Price">
      <div className="space-y-4">
        {/* Price Input */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-gray-900">$</span>
            <input
              type="text"
              value={localPrice}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              className="text-2xl font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-purple-900 outline-none w-full max-w-[120px] transition-colors"
            />
          </div>
          <button
            className="text-xs text-purple-900 hover:text-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            onClick={handleFetchLivePrice}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Fetching...
              </span>
            ) : (
              'Fetch Live'
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}

        {/* Price Scenario Slider with ETH Logo Handle */}
        <div className="pt-2">
          <div className="relative h-2">
            {/* Track background */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-150"
                style={{
                  background: `linear-gradient(to right, #dc2626 0%, #dc2626 9%, #fbbf24 9%, #fbbf24 15%, #22c55e 15%, #22c55e 100%)`,
                }}
              />
            </div>

            {/* Slider input */}
            <input
              type="range"
              min={-100}
              max={1000}
              step={5}
              value={priceChangeScenario}
              onChange={handleScenarioChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            {/* ETH Logo Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150"
              style={{ left: `calc(${percentage}% - 12px)` }}
            >
              <div className="w-6 h-6 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center">
                <Image
                  src="/eth-logo.svg"
                  alt="ETH"
                  width={14}
                  height={14}
                />
              </div>
            </div>
          </div>

          {/* Slider Labels */}
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>-100%</span>
            <span className={priceChangeScenario >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {priceChangeScenario >= 0 ? '+' : ''}{priceChangeScenario}%
            </span>
            <span>+1000%</span>
          </div>

          {/* Projected Price */}
          <div className="text-sm text-gray-500 mt-2">
            → {formatPrice(projectedPrice)}
          </div>
        </div>
      </div>
    </Card>
  )
}
