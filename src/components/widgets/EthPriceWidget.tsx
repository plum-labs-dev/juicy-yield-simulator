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
    <Card
      title={
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 256 417" preserveAspectRatio="xMidYMid">
            <path fill="#343434" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
            <path fill="#8C8C8C" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
            <path fill="#3C3C3B" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/>
            <path fill="#8C8C8C" d="M127.962 416.905v-104.72L0 236.585z"/>
            <path fill="#141414" d="M127.961 287.958l127.96-75.637-127.96-58.162z"/>
            <path fill="#393939" d="M0 212.32l127.96 75.638v-133.8z"/>
          </svg>
          ETH Price
        </span>
      }
      className={className}
    >
      <div className="space-y-4">
        {/* Price Input */}
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 flex-1">
              <span className="text-2xl font-semibold text-gray-900">$</span>
              <input
                type="text"
                value={localPrice}
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                className="text-2xl font-semibold text-gray-900 bg-transparent border-b border-gray-300 hover:border-gray-400 focus:border-purple-900 outline-none w-full max-w-[100px] text-right transition-colors"
              />
            </div>
            <button
              className="px-3 py-1.5 text-xs font-medium text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  <span>...</span>
                </span>
              ) : (
                'Fetch Live'
              )}
            </button>
          </div>
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
          </div>
          <div className={`text-2xl font-bold mt-2 ${priceChangeScenario >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            → {formatPrice(projectedPrice)}
          </div>
        </div>
      </div>
    </Card>
  )
}
