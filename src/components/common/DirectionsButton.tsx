'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  generateDirectionsUrls,
  detectPlatform,
  openDirections,
  type DirectionsUrls,
} from '@/lib/directions'

interface DirectionsButtonProps {
  lat: number
  lng: number
  destinationName?: string
  className?: string
}

interface MapAppOption {
  key: keyof DirectionsUrls
  label: string
  icon: string
  /** 표시할 플랫폼 (없으면 모든 플랫폼) */
  platforms?: Array<'ios' | 'android' | 'web'>
}

const MAP_APPS: MapAppOption[] = [
  { key: 'google', label: 'Google Maps', icon: '🗺️' },
  { key: 'apple', label: 'Apple Maps', icon: '🍎', platforms: ['ios'] },
  { key: 'kakao', label: '카카오맵', icon: '🟡' },
  { key: 'naver', label: '네이버 지도', icon: '🟢' },
]

/**
 * DirectionsButton 컴포넌트
 * 네이티브 지도 앱으로 길찾기 연결
 * - 플랫폼 감지 (iOS/Android/Web)
 * - 지도 앱 선택 모달
 * - 딥링크 URL 생성 및 열기
 *
 * @requirements 2.3
 */
export default function DirectionsButton({
  lat,
  lng,
  destinationName,
  className = '',
}: DirectionsButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPlatform(detectPlatform())
  }, [])

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const availableApps = MAP_APPS.filter(
    (app) => !app.platforms || app.platforms.includes(platform)
  )

  const urls = generateDirectionsUrls({
    destination: { lat, lng },
    destinationName,
  })

  const handleSelect = useCallback(
    (key: keyof DirectionsUrls) => {
      openDirections(urls[key])
      setIsOpen(false)
    },
    [urls]
  )

  return (
    <div className="relative" ref={modalRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 active:bg-primary-800 ${className}`}
        aria-label="길찾기"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        길찾기
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full left-0 z-50 mb-2 w-48 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5"
          role="menu"
          aria-label="지도 앱 선택"
        >
          <div className="px-3 py-2 text-xs font-medium text-muted">
            지도 앱 선택
          </div>
          {availableApps.map((app) => (
            <button
              key={app.key}
              onClick={() => handleSelect(app.key)}
              className="text-text-secondary flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-primary-50 active:bg-surface"
              role="menuitem"
            >
              <span className="text-base">{app.icon}</span>
              {app.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
