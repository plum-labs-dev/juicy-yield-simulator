'use client'

import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  src: string | undefined
  alt: string
  size?: number
  className?: string
}

export function Logo({ src, alt, size = 20, className = '' }: LogoProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    // Fallback: show first letter in a circle
    return (
      <div
        className={`rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      onError={() => setError(true)}
      unoptimized // External URLs need this
    />
  )
}

interface DualLogoProps {
  tokenSrc: string | undefined
  protocolSrc: string | undefined
  tokenAlt: string
  protocolAlt: string
  size?: number
  className?: string
}

export function DualLogo({
  tokenSrc,
  protocolSrc,
  tokenAlt,
  protocolAlt,
  size = 20,
  className = ''
}: DualLogoProps) {
  const offset = Math.round(size * 0.6)

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size + offset, height: size }}
    >
      {/* Token logo (background, right) */}
      <div className="absolute" style={{ left: offset, top: 0 }}>
        <Logo
          src={tokenSrc}
          alt={tokenAlt}
          size={size}
        />
      </div>
      {/* Protocol logo (foreground, left, on top) */}
      <div className="absolute" style={{ left: 0, top: 0 }}>
        <Logo
          src={protocolSrc}
          alt={protocolAlt}
          size={size}
          className="ring-2 ring-white"
        />
      </div>
    </div>
  )
}
