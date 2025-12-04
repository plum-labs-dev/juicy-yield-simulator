'use client'

import { Card } from '@/components/ui/Card'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useState, useEffect, ChangeEvent } from 'react'

interface EthPriceWidgetProps {
  className?: string
}

export function EthPriceWidget({ className }: EthPriceWidgetProps) {
  const {
    ethPrice,
    priceChangeScenario,
    setEthPrice,
    setPriceChangeScenario,
  } = usePortfolioStore()

  const [localPrice, setLocalPrice] = useState<string>(ethPrice.toLocaleString())
  const [localScenario, setLocalScenario] = useState<string>(priceChangeScenario.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLocalPrice(ethPrice.toLocaleString())
  }, [ethPrice])

  useEffect(() => {
    setLocalScenario(priceChangeScenario.toString())
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
    setLocalScenario(e.target.value)
    const numValue = parseFloat(e.target.value)
    if (!isNaN(numValue)) {
      setPriceChangeScenario(numValue)
    }
  }

  const handleScenarioBlur = () => {
    const numValue = parseFloat(localScenario)
    if (isNaN(numValue)) {
      setLocalScenario(priceChangeScenario.toString())
    } else {
      setLocalScenario(numValue.toString())
      setPriceChangeScenario(numValue)
    }
  }

  const projectedPrice = ethPrice * (1 + priceChangeScenario / 100)

  const formatPrice = (price: number): string => {
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  return (
    <Card title="ETH Price" className={className}>
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
              className="text-2xl font-semibold text-gray-900 bg-transparent border-b border-gray-300 hover:border-gray-400 focus:border-purple-900 outline-none w-full max-w-[120px] transition-colors"
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

        {/* Price Scenario Input */}
        <div className="pt-2 border-t border-gray-100">
          <label className="block text-xs text-gray-500 mb-1.5">
            Price Change Scenario
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={localScenario}
              onChange={handleScenarioChange}
              onBlur={handleScenarioBlur}
              className={`text-xl font-semibold bg-transparent border-b border-gray-300 hover:border-gray-400 focus:border-purple-900 outline-none w-16 text-right transition-colors ${
                priceChangeScenario >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            />
            <span className={`text-xl font-semibold ${priceChangeScenario >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              %
            </span>
            <span className="text-sm text-gray-500 ml-2">
              → {formatPrice(projectedPrice)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
