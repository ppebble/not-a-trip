/**
 * useBottomSheet 훅
 *
 * 드래그 제스처 처리, 스냅 포인트 계산 (Safe Area 고려), 높이 상태 전환 로직
 *
 * @requirements 1.2, 1.3, 4.4
 */

import { useRef, useCallback, useEffect, useState } from 'react'
import {
  useBottomSheetStore,
  type BottomSheetHeight,
} from '@/stores/bottomSheetStore'

/** 스냅 포인트 높이 비율 (뷰포트 기준) */
const SNAP_RATIOS = {
  collapsed: 0.15, // 15vh
  half: 0.5, // 50vh
  full: 0.9, // 90vh
} as const

/** 드래그 임계값 (px) - 이 이상 드래그해야 상태 전환 */
const DRAG_THRESHOLD = 50

/** 속도 임계값 (px/ms) - 빠른 스와이프 감지 */
const VELOCITY_THRESHOLD = 0.5

interface UseBottomSheetReturn {
  /** 바텀 시트 요소에 연결할 ref */
  sheetRef: React.RefObject<HTMLDivElement | null>
  /** 현재 translateY 값 (px, 애니메이션용) */
  translateY: number
  /** 드래그 중 여부 */
  isDragging: boolean
  /** 현재 높이 상태의 스냅 포인트 (px) */
  currentSnapHeight: number
  /** 각 상태별 스냅 포인트 (px) */
  snapPoints: Record<BottomSheetHeight, number>
}

export function useBottomSheet(): UseBottomSheetReturn {
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const { heightState, expandUp, collapseDown, setHeightState, close } =
    useBottomSheetStore()

  const [isDragging, setIsDragging] = useState(false)
  const [translateY, setTranslateY] = useState(0)

  // 터치 시작 정보
  const touchStartRef = useRef<{ y: number; time: number } | null>(null)
  const currentTranslateRef = useRef(0)

  /** 뷰포트 높이 기반 스냅 포인트 계산 (Safe Area 고려) */
  const getSnapPoints = useCallback((): Record<BottomSheetHeight, number> => {
    const vh = window.innerHeight
    // CSS env() 값은 JS에서 직접 읽기 어려우므로 CSS 변수 폴백 사용
    const safeAreaBottom = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--safe-area-inset-bottom'
      ) || '0',
      10
    )

    return {
      collapsed: vh * SNAP_RATIOS.collapsed,
      half: vh * SNAP_RATIOS.half - safeAreaBottom,
      full: vh * SNAP_RATIOS.full - safeAreaBottom,
    }
  }, [])

  const [snapPoints, setSnapPoints] = useState<
    Record<BottomSheetHeight, number>
  >(() => ({
    collapsed: 0,
    half: 0,
    full: 0,
  }))

  // 뷰포트 변경 시 스냅 포인트 재계산
  useEffect(() => {
    const updateSnapPoints = () => setSnapPoints(getSnapPoints())
    updateSnapPoints()

    window.addEventListener('resize', updateSnapPoints)
    return () => window.removeEventListener('resize', updateSnapPoints)
  }, [getSnapPoints])

  const currentSnapHeight = snapPoints[heightState]

  /** 가장 가까운 스냅 포인트 찾기 */
  const findClosestSnap = useCallback(
    (height: number): BottomSheetHeight => {
      const entries = Object.entries(snapPoints) as [
        BottomSheetHeight,
        number,
      ][]
      let closest = entries[0]
      let minDist = Math.abs(height - closest[1])

      for (const entry of entries) {
        const dist = Math.abs(height - entry[1])
        if (dist < minDist) {
          minDist = dist
          closest = entry
        }
      }
      return closest[0]
    },
    [snapPoints]
  )

  // 터치 이벤트 핸들러
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { y: touch.clientY, time: Date.now() }
    currentTranslateRef.current = 0
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current) return
      const touch = e.touches[0]
      const deltaY = touch.clientY - touchStartRef.current.y
      currentTranslateRef.current = deltaY

      // 위로 드래그(음수) = 확장, 아래로 드래그(양수) = 축소
      // collapsed 상태에서 아래로 더 드래그하는 것은 제한
      const currentHeight = snapPoints[heightState]
      const newHeight = currentHeight - deltaY

      if (newHeight < 0) {
        setTranslateY(currentHeight) // 최소 0까지만
      } else if (newHeight > snapPoints.full) {
        setTranslateY(currentHeight - snapPoints.full) // 최대 full까지만
      } else {
        setTranslateY(deltaY)
      }

      e.preventDefault()
    },
    [heightState, snapPoints]
  )

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return

    const deltaY = currentTranslateRef.current
    const elapsed = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(deltaY) / Math.max(elapsed, 1)

    // 빠른 스와이프 감지
    if (velocity > VELOCITY_THRESHOLD) {
      if (deltaY < 0) {
        // 위로 빠른 스와이프 → 확장
        expandUp()
      } else {
        // 아래로 빠른 스와이프 → 축소
        collapseDown()
      }
    } else if (Math.abs(deltaY) > DRAG_THRESHOLD) {
      // 느린 드래그 → 가장 가까운 스냅 포인트로
      const currentHeight = snapPoints[heightState] - deltaY
      const closestSnap = findClosestSnap(currentHeight)

      if (closestSnap === heightState) {
        // 같은 상태면 방향에 따라 전환
        if (deltaY < -DRAG_THRESHOLD) expandUp()
        else if (deltaY > DRAG_THRESHOLD) collapseDown()
      } else {
        setHeightState(closestSnap)
      }
    }
    // 임계값 미달 → 원래 위치로 복귀

    setTranslateY(0)
    setIsDragging(false)
    touchStartRef.current = null
    currentTranslateRef.current = 0
  }, [
    heightState,
    snapPoints,
    expandUp,
    collapseDown,
    setHeightState,
    findClosestSnap,
  ])

  // 드래그 핸들에 터치 이벤트 바인딩
  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return

    // 드래그 핸들 영역만 터치 이벤트 감지
    const handle = sheet.querySelector('[data-drag-handle]') as HTMLElement
    const target = handle || sheet

    target.addEventListener('touchstart', handleTouchStart, { passive: true })
    target.addEventListener('touchmove', handleTouchMove, { passive: false })
    target.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      target.removeEventListener('touchstart', handleTouchStart)
      target.removeEventListener('touchmove', handleTouchMove)
      target.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // 바깥 영역 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sheet = sheetRef.current
      if (sheet && !sheet.contains(e.target as Node)) {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [close])

  return {
    sheetRef,
    translateY,
    isDragging,
    currentSnapHeight,
    snapPoints,
  }
}
