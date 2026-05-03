'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

const ONBOARDING_KEY_PREFIX = 'not-a-trip-onboarding'

export interface TourStep {
  /** 대상 요소의 CSS selector 또는 data-tour 속성값 */
  target: string
  /** 툴팁 제목 */
  title: string
  /** 툴팁 설명 */
  description: string
  /** 툴팁 위치 */
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export interface UseOnboardingReturn {
  isActive: boolean
  currentStep: number
  next: () => void
  skip: () => void
  dismiss: () => void
  reset: () => void
}

/**
 * 페이지별 localStorage 키를 생성한다.
 * pageKey가 없으면 기본 키를 사용한다.
 */
function getStorageKey(pageKey?: string): string {
  return pageKey
    ? `${ONBOARDING_KEY_PREFIX}-${pageKey}-dismissed`
    : `${ONBOARDING_KEY_PREFIX}-dismissed`
}

/**
 * localStorage에서 온보딩 dismissed 상태를 읽는다.
 * dismissed=true이면 가이드 숨김.
 * 접근 실패 시 null 반환 (graceful degradation — 매번 표시).
 */
function getStoredDismissed(key: string): boolean | null {
  try {
    const value = localStorage.getItem(key)
    return value === 'true'
  } catch {
    return null
  }
}

/**
 * localStorage에 온보딩 dismissed 상태를 저장한다.
 * 접근 실패 시 무시 (graceful degradation).
 */
function setStoredDismissed(key: string, dismissed: boolean): void {
  try {
    if (dismissed) {
      localStorage.setItem(key, 'true')
    } else {
      localStorage.removeItem(key)
    }
  } catch {
    // localStorage 접근 실패 시 무시
  }
}

/**
 * 주어진 target selector에 해당하는 DOM 요소가 존재하는지 확인한다.
 */
function isTargetInDOM(target: string): boolean {
  if (typeof document === 'undefined') return false
  return document.querySelector(target) !== null
}

/**
 * 현재 인덱스부터 DOM에 존재하는 다음 유효한 스텝 인덱스를 찾는다.
 * 유효한 스텝이 없으면 -1을 반환한다.
 */
export function findNextValidStep(
  steps: TourStep[],
  fromIndex: number
): number {
  for (let i = fromIndex; i < steps.length; i++) {
    if (isTargetInDOM(steps[i].target)) {
      return i
    }
  }
  return -1
}

/**
 * useOnboarding 훅
 *
 * 온보딩 가이드 투어의 상태를 관리한다.
 * - dismissed 상태가 아니면 매번 투어 표시
 * - "다시 보지 않기"(dismiss) 시 localStorage에 저장하여 이후 숨김
 * - DOM에 존재하지 않는 대상 요소는 자동 건너뛰기
 * - localStorage 접근 실패 시 매번 투어 표시 (graceful degradation)
 * - pageKey로 페이지별 독립적인 dismissed 상태 관리
 *
 * @requirements 1.2, 1.3, 2.2, 2.3, 2.4, 3.3
 */
export function useOnboarding(
  steps: TourStep[],
  pageKey?: string
): UseOnboardingReturn {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const initializedRef = useRef(false)
  const storageKey = getStorageKey(pageKey)

  // 마운트 시 localStorage 확인하여 투어 시작 여부 결정
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const dismissed = getStoredDismissed(storageKey)

    // dismissed=true일 때만 투어 비활성화, 그 외(false/null)에는 매번 활성화
    if (dismissed === true) {
      setIsActive(false)
      return
    }

    // 첫 번째 유효한 스텝 찾기
    const firstValid = findNextValidStep(steps, 0)
    if (firstValid === -1) {
      // 모든 스텝의 대상 요소가 미존재 → 투어 자동 종료 (localStorage 저장 안 함)
      setIsActive(false)
      return
    }

    setIsActive(true)
    setCurrentStep(firstValid)
  }, [steps, storageKey])

  const next = useCallback(() => {
    const nextValid = findNextValidStep(steps, currentStep + 1)

    if (nextValid === -1) {
      // 남은 유효한 스텝 없음 → 투어 종료 (localStorage 저장 안 함)
      setIsActive(false)
      return
    }

    setCurrentStep(nextValid)
  }, [steps, currentStep])

  const skip = useCallback(() => {
    setIsActive(false)
  }, [])

  const dismiss = useCallback(() => {
    setStoredDismissed(storageKey, true)
    setIsActive(false)
  }, [storageKey])

  const reset = useCallback(() => {
    setStoredDismissed(storageKey, false)
    initializedRef.current = false

    const firstValid = findNextValidStep(steps, 0)
    if (firstValid === -1) {
      setIsActive(false)
      return
    }

    setIsActive(true)
    setCurrentStep(firstValid)
  }, [steps, storageKey])

  return { isActive, currentStep, next, skip, dismiss, reset }
}
