'use client'

import { useEffect, useState, type RefObject } from 'react'

/**
 * 스크롤 위치 기반 섹션 진입/이탈 감지 훅
 *
 * IntersectionObserver를 활용하여 Hero 섹션 이탈 및
 * Conversion 섹션 진입을 감지한다.
 * FloatingCTA 표시 조건(heroExited && !conversionVisible)에 사용.
 *
 * Requirements: 4.5
 */

export interface ScrollState {
  scrollY: number
  heroExited: boolean
  conversionVisible: boolean
}

interface ScrollPositionRefs {
  heroRef: RefObject<HTMLElement | null>
  conversionRef: RefObject<HTMLElement | null>
}

export function useScrollPosition(refs: ScrollPositionRefs): ScrollState {
  const [state, setState] = useState<ScrollState>({
    scrollY: 0,
    heroExited: false,
    conversionVisible: false,
  })

  // scrollY 추적
  useEffect(() => {
    const handleScroll = () => {
      setState((prev) => ({ ...prev, scrollY: window.scrollY }))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Hero 섹션 이탈 감지
  useEffect(() => {
    const heroEl = refs.heroRef.current
    if (!heroEl) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setState((prev) => ({ ...prev, heroExited: !entry.isIntersecting }))
      },
      { threshold: 0 }
    )

    observer.observe(heroEl)
    return () => observer.disconnect()
  }, [refs.heroRef])

  // Conversion 섹션 진입 감지
  useEffect(() => {
    const conversionEl = refs.conversionRef.current
    if (!conversionEl) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setState((prev) => ({
          ...prev,
          conversionVisible: entry.isIntersecting,
        }))
      },
      { threshold: 0 }
    )

    observer.observe(conversionEl)
    return () => observer.disconnect()
  }, [refs.conversionRef])

  return state
}
