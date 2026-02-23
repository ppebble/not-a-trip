/**
 * useSwipeGesture 훅
 * 터치 이벤트 기반 스와이프 제스처 감지
 *
 * - 터치 이벤트 (touchstart, touchmove, touchend) 처리
 * - 스와이프 방향, 거리, 속도 계산
 * - 임계값 기반 스와이프 감지
 *
 * @requirements 1.3, 2.2
 */

import { useRef, useCallback, useEffect } from 'react'

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export interface SwipeEvent {
  /** 스와이프 방향 */
  direction: SwipeDirection
  /** X축 이동 거리 (px) */
  deltaX: number
  /** Y축 이동 거리 (px) */
  deltaY: number
  /** 스와이프 속도 (px/ms) */
  velocity: number
}

export interface UseSwipeGestureOptions {
  /** 최소 스와이프 거리 (px, 기본: 50) */
  threshold?: number
  /** 최소 스와이프 속도 (px/ms, 기본: 0.3) */
  velocityThreshold?: number
  /** 스와이프 감지 시 콜백 */
  onSwipe?: (event: SwipeEvent) => void
  /** 특정 방향만 감지 */
  directions?: SwipeDirection[]
  /** 스와이프 중 이동 콜백 (deltaX, deltaY) */
  onSwiping?: (deltaX: number, deltaY: number) => void
  /** 스와이프 종료 콜백 (스와이프 미달 포함) */
  onSwipeEnd?: () => void
  /** 비활성화 여부 */
  disabled?: boolean
}

interface TouchPoint {
  x: number
  y: number
  time: number
}

const DEFAULT_THRESHOLD = 50
const DEFAULT_VELOCITY_THRESHOLD = 0.3

export function useSwipeGesture<T extends HTMLElement = HTMLElement>(
  options: UseSwipeGestureOptions = {}
) {
  const {
    threshold = DEFAULT_THRESHOLD,
    velocityThreshold = DEFAULT_VELOCITY_THRESHOLD,
    onSwipe,
    directions,
    onSwiping,
    onSwipeEnd,
    disabled = false,
  } = options

  const elementRef = useRef<T | null>(null)
  const startRef = useRef<TouchPoint | null>(null)
  const isSwiping = useRef(false)

  // 최신 콜백 참조 유지
  const callbacksRef = useRef({ onSwipe, onSwiping, onSwipeEnd })
  callbacksRef.current = { onSwipe, onSwiping, onSwipeEnd }

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled) return
      const touch = e.touches[0]
      startRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }
      isSwiping.current = false
    },
    [disabled]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || !startRef.current) return
      const touch = e.touches[0]
      const deltaX = touch.clientX - startRef.current.x
      const deltaY = touch.clientY - startRef.current.y

      // 수평 스와이프가 우세하면 스크롤 방지
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        isSwiping.current = true
        e.preventDefault()
      }

      if (isSwiping.current) {
        callbacksRef.current.onSwiping?.(deltaX, deltaY)
      }
    },
    [disabled]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (disabled || !startRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - startRef.current.x
      const deltaY = touch.clientY - startRef.current.y
      const elapsed = Date.now() - startRef.current.time
      const velocity =
        Math.sqrt(deltaX * deltaX + deltaY * deltaY) / Math.max(elapsed, 1)

      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      // 임계값 체크 (거리 또는 속도)
      const meetsThreshold =
        Math.max(absDeltaX, absDeltaY) >= threshold ||
        velocity >= velocityThreshold

      if (meetsThreshold) {
        let direction: SwipeDirection
        if (absDeltaX > absDeltaY) {
          direction = deltaX > 0 ? 'right' : 'left'
        } else {
          direction = deltaY > 0 ? 'down' : 'up'
        }

        // 방향 필터링
        if (!directions || directions.includes(direction)) {
          callbacksRef.current.onSwipe?.({
            direction,
            deltaX,
            deltaY,
            velocity,
          })
        }
      }

      callbacksRef.current.onSwipeEnd?.()
      startRef.current = null
      isSwiping.current = false
    },
    [disabled, threshold, velocityThreshold, directions]
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element || disabled) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, disabled])

  return { ref: elementRef }
}
