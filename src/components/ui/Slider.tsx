'use client'

import { ChangeEvent, useRef, useCallback } from 'react'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
}: SliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={`relative ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb"
        style={{
          background: `linear-gradient(to right, #48104a ${percentage}%, #e5e7eb ${percentage}%)`,
        }}
      />
    </div>
  )
}

// Three-segment allocation slider matching the reference image exactly
interface ThreeSegmentSliderProps {
  ethPercent: number
  stablePercent: number
  hedgePercent: number
  onEthChange: (value: number) => void
  onHedgeChange: (value: number) => void
  ethAmount?: number
  stableAmount?: number
  hedgeAmount?: number
  ethPrice?: number
}

export function ThreeSegmentSlider({
  ethPercent,
  stablePercent,
  hedgePercent,
  onEthChange,
  onHedgeChange,
  ethAmount,
  stableAmount,
  hedgeAmount,
  ethPrice,
}: ThreeSegmentSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const formatUsd = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`
    }
    if (amount >= 1000) {
      return `$${Math.round(amount).toLocaleString()}`
    }
    return `$${amount.toLocaleString()}`
  }

  const getPercentFromMouseEvent = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    return Math.round(percent)
  }, [])

  // Handle dragging the ETH/Stable divider (first handle)
  const handleEthDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const onMouseMove = (moveEvent: MouseEvent) => {
      const newEth = getPercentFromMouseEvent(moveEvent)
      // ETH can go from 0 to (100 - hedgePercent)
      const maxEth = 100 - hedgePercent
      const clampedEth = Math.max(0, Math.min(maxEth, newEth))
      onEthChange(clampedEth)
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [getPercentFromMouseEvent, hedgePercent, onEthChange])

  // Handle dragging the Stable/Hedge divider (second handle)
  const handleHedgeDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const onMouseMove = (moveEvent: MouseEvent) => {
      const pos = getPercentFromMouseEvent(moveEvent)
      const newHedge = 100 - pos
      // Hedge can go from 0 to (100 - ethPercent)
      const maxHedge = 100 - ethPercent
      const clampedHedge = Math.max(0, Math.min(maxHedge, newHedge))
      onHedgeChange(clampedHedge)
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [getPercentFromMouseEvent, ethPercent, onHedgeChange])

  // Handle positions (as percentage) - positioned at segment boundaries
  const handle1Pos = ethPercent // ETH/Stable divider
  const handle2Pos = 100 - hedgePercent // Stable/Hedge divider

  return (
    <div className="w-full">
      {/* Slider Track - height matches input field (py-2.5 = ~44px total) */}
      <div ref={trackRef} className="relative h-[44px] mb-3">
        {/* Background track with segments and handles inside */}
        <div className="absolute inset-0 rounded-xl overflow-hidden flex">
          {/* ETH segment - Purple */}
          <div
            className="h-full bg-[#48104a] relative"
            style={{ width: `${ethPercent}%` }}
          >
            {/* Handle inside ETH segment at right edge */}
            {ethPercent > 0 && (
              <div
                className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-8 cursor-ew-resize flex items-center justify-center"
                style={{ zIndex: handle1Pos >= handle2Pos ? 20 : 10 }}
                onMouseDown={handleEthDrag}
              >
                <div className="w-1.5 h-6 bg-white rounded-full" />
              </div>
            )}
          </div>

          {/* Stablecoin segment - Light Gray */}
          <div
            className="h-full bg-gray-200 relative"
            style={{ width: `${stablePercent}%` }}
          >
            {/* Handle inside Stable segment at right edge */}
            {stablePercent > 0 && hedgePercent > 0 && (
              <div
                className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-8 cursor-ew-resize flex items-center justify-center"
                style={{ zIndex: handle1Pos >= handle2Pos ? 10 : 20 }}
                onMouseDown={handleHedgeDrag}
              >
                <div className="w-1.5 h-6 bg-white rounded-full" />
              </div>
            )}
          </div>

          {/* Hedge segment - Medium Gray */}
          <div
            className="h-full bg-[#6B7280] relative"
            style={{ width: `${hedgePercent}%` }}
          />
        </div>

        {/* Fallback handle when ETH is 0 - at left edge */}
        {ethPercent === 0 && (
          <div
            className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-8 cursor-ew-resize flex items-center justify-center z-20"
            onMouseDown={handleEthDrag}
          >
            <div className="w-1.5 h-6 bg-white rounded-full shadow" />
          </div>
        )}

        {/* Fallback handle when Stable is 0 but Hedge > 0 */}
        {stablePercent === 0 && hedgePercent > 0 && ethPercent < 100 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-8 cursor-ew-resize flex items-center justify-center z-20"
            style={{ right: `calc(${hedgePercent}% + 4px)` }}
            onMouseDown={handleHedgeDrag}
          >
            <div className="w-1.5 h-6 bg-white rounded-full shadow" />
          </div>
        )}

        {/* Fallback handle when Hedge is 0 - at right edge */}
        {hedgePercent === 0 && ethPercent < 100 && (
          <div
            className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-8 cursor-ew-resize flex items-center justify-center z-20"
            onMouseDown={handleHedgeDrag}
          >
            <div className="w-1.5 h-6 bg-white rounded-full shadow" />
          </div>
        )}
      </div>

      {/* Labels - fixed positions to avoid overlap */}
      <div className="flex justify-between">
        {/* ETH label - left aligned */}
        <div>
          <div className="text-sm font-bold text-[#48104a]">ETH {ethPercent}%</div>
          {ethAmount !== undefined && ethPrice && ethPrice > 0 && (
            <div className="text-xs text-[#48104a]">
              {(ethAmount / ethPrice).toFixed(2)} ETH ({formatUsd(ethAmount)})
            </div>
          )}
          {ethAmount !== undefined && (!ethPrice || ethPrice <= 0) && (
            <div className="text-xs text-[#48104a]">{formatUsd(ethAmount)}</div>
          )}
        </div>

        {/* Stable label - center */}
        <div className="text-center">
          <div className="text-sm font-bold text-gray-400">Stable {stablePercent}%</div>
          {stableAmount !== undefined && (
            <div className="text-xs text-gray-400">{formatUsd(stableAmount)}</div>
          )}
        </div>

        {/* Hedge label - right aligned */}
        <div className="text-right">
          <div className="text-sm font-bold text-[#6B7280]">Hedge {hedgePercent}%</div>
          {hedgeAmount !== undefined && (
            <div className="text-xs text-[#6B7280]">{formatUsd(hedgeAmount)}</div>
          )}
        </div>
      </div>
    </div>
  )
}

// Legacy two-segment slider (keeping for backward compatibility)
interface AllocationSliderProps {
  value: number
  onChange: (value: number) => void
  leftLabel?: string
  rightLabel?: string
  leftAmount?: number
  rightAmount?: number
  ethPrice?: number
  max?: number
  hedgePercent?: number
  hedgeLabel?: string
}

export function AllocationSlider({
  value,
  onChange,
  leftLabel = 'ETH',
  rightLabel = 'Stablecoin',
  leftAmount,
  rightAmount,
  ethPrice,
  max = 100,
  hedgePercent = 0,
  hedgeLabel = 'Hedge',
}: AllocationSliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value))
  }

  const formatUsd = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`
    }
    return `$${amount.toLocaleString()}`
  }

  const formatEth = (amount: number): string => {
    if (amount >= 1000) {
      return `${amount.toFixed(1)} ETH`
    }
    if (amount >= 1) {
      return `${amount.toFixed(2)} ETH`
    }
    return `${amount.toFixed(4)} ETH`
  }

  const ethAmount = (leftAmount && ethPrice && ethPrice > 0) ? leftAmount / ethPrice : 0
  const stablecoinWidth = 100 - value
  const hedgeWidth = stablecoinWidth * (hedgePercent / 100)
  const pureStableWidth = stablecoinWidth - hedgeWidth

  return (
    <div className="w-full">
      <div className="relative h-2 mb-3">
        <div className="absolute inset-0 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-purple-900 transition-all duration-150"
            style={{ width: `${value}%` }}
          />
          <div
            className="h-full bg-gray-300 transition-all duration-150"
            style={{ width: `${pureStableWidth}%` }}
          />
          {hedgePercent > 0 && (
            <div
              className="h-full bg-blue-500 transition-all duration-150"
              style={{ width: `${hedgeWidth}%` }}
            />
          )}
        </div>

        <input
          type="range"
          min={0}
          max={max}
          step={1}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-purple-900 rounded-full shadow-md pointer-events-none transition-all duration-150"
          style={{ left: `calc(${value}% - 10px)` }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="font-medium text-purple-900">{value}% {leftLabel}</span>
        <span className="text-gray-400">·</span>
        <span className="font-medium text-gray-600">{Math.round(stablecoinWidth - hedgeWidth)}% {rightLabel}</span>
        {hedgePercent > 0 && (
          <>
            <span className="text-gray-400">·</span>
            <span className="font-medium text-blue-600">{Math.round(hedgeWidth)}% {hedgeLabel}</span>
          </>
        )}
      </div>

      {(leftAmount !== undefined && rightAmount !== undefined) && (
        <div className="text-xs text-gray-500 mt-1">
          {ethPrice && ethPrice > 0 ? (
            <>
              <span className="text-purple-600 font-medium">{formatEth(ethAmount)}</span>
              <span className="text-gray-400"> ({formatUsd(leftAmount)})</span>
            </>
          ) : (
            <>{formatUsd(leftAmount)} {leftLabel}</>
          )}
          <span className="mx-1">|</span>
          {formatUsd(rightAmount)} {rightLabel}
        </div>
      )}
    </div>
  )
}
