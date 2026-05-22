'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { MASCOT_ASSETS, type MascotVariant } from './mascotAssets'

interface MascotLoaderProps {
  label?: string
  caption?: string
  size?: number
  className?: string
}

const LOADER_FRAMES: MascotVariant[] = ['main', 'greeting', 'confirm', 'cheer']

export function MascotLoader({
  label = '로딩 중',
  caption,
  size = 112,
  className = '',
}: MascotLoaderProps) {
  const [frameIndex, setFrameIndex] = useState(0)
  const frame = useMemo(
    () => LOADER_FRAMES[frameIndex % LOADER_FRAMES.length],
    [frameIndex]
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % LOADER_FRAMES.length)
    }, 700)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div
      className={`flex flex-col items-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className="relative overflow-hidden rounded-full border border-border bg-accent-surface/80 shadow-lg"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <Image
          key={frame}
          src={MASCOT_ASSETS[frame]}
          alt=""
          fill
          sizes={`${size}px`}
          className="animate-fade-in object-contain p-2"
        />
      </div>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {LOADER_FRAMES.map((variant, index) => (
          <span
            key={variant}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              index === frameIndex ? 'scale-110 bg-primary-500' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <p className="text-sm font-medium text-main-text">{label}</p>
      {caption ? (
        <p className="text-center text-xs text-sub-text">{caption}</p>
      ) : null}
    </div>
  )
}
