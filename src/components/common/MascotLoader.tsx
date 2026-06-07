'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { MASCOT_ASSETS, type MascotVariant } from './mascotAssets'

interface MascotLoaderProps {
  label?: string
  caption?: string
  size?: number
  className?: string
  frames?: MascotVariant[]
}

const LOADER_FRAMES: MascotVariant[] = ['main', 'greeting', 'confirm', 'cheer']

export function MascotLoader({
  label = '로딩 중',
  caption,
  size = 112,
  className = '',
  frames = LOADER_FRAMES,
}: MascotLoaderProps) {
  const [frameIndex, setFrameIndex] = useState(0)
  const activeFrames = frames.length > 0 ? frames : LOADER_FRAMES
  const frame = useMemo(
    () => activeFrames[frameIndex % activeFrames.length],
    [activeFrames, frameIndex]
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % activeFrames.length)
    }, 700)

    return () => window.clearInterval(timer)
  }, [activeFrames.length])

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
      <p className="text-sm font-medium text-main-text">{label}</p>
      {caption ? (
        <p className="text-center text-xs text-sub-text">{caption}</p>
      ) : null}
    </div>
  )
}
