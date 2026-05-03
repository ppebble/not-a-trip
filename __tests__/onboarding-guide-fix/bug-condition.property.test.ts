/**
 * @jest-environment jsdom
 */

/**
 * Bug Condition Exploration Test - 온보딩 가이드 표시 로직 버그
 *
 * Feature: 31-onboarding-guide-fix, Property 1: Bug Condition
 *
 * 두 가지 버그 조건을 구체적 케이스로 검증한다:
 *
 * Bug 1: `useOnboarding` 훅에서 `skip()` 호출 후 재마운트 시
 *   `isActive`가 `true`여야 하지만 현재 `false` 반환
 *   (localStorage에 completed=true 저장되어 재방문 시 가이드 미표시)
 *
 * Bug 2: `useOnboarding` 훅에서 마지막 스텝 `next()` 호출 후 재마운트 시
 *   `isActive`가 `true`여야 하지만 현재 `false` 반환
 *
 * EXPECTED OUTCOME: 수정 전 코드에서 테스트 FAIL (버그 존재 확인)
 * DO NOT fix the test or the code when it fails.
 *
 * **Validates: Requirements 1.2, 1.3, 2.2, 2.3**
 */

import fc from 'fast-check'
import { renderHook, act } from '@testing-library/react'
import { useOnboarding, TourStep } from '@/hooks/useOnboarding'

// ============================================
// Helpers
// ============================================

const ONBOARDING_KEY = 'not-a-trip-onboarding-completed'

/** DOM에 data-tour 요소를 추가한다 */
function addTourTargets(steps: TourStep[]): void {
  steps.forEach((step) => {
    const selector = step.target
    // data-tour="xxx" 형태의 selector를 파싱
    const match = selector.match(/\[data-tour="(.+?)"\]/)
    if (match) {
      const el = document.createElement('div')
      el.setAttribute('data-tour', match[1])
      document.body.appendChild(el)
    }
  })
}

/** DOM에서 모든 data-tour 요소를 제거한다 */
function clearTourTargets(): void {
  document.querySelectorAll('[data-tour]').forEach((el) => el.remove())
}

// ============================================
// Generators
// ============================================

/** 유효한 TourStep 생성 arbitrary */
const tourStepArb = fc
  .record({
    id: fc.stringMatching(/^[a-z]{3,8}$/),
    title: fc.stringMatching(/^[가-힣a-zA-Z ]{2,20}$/),
    description: fc.stringMatching(/^[가-힣a-zA-Z ]{5,40}$/),
    placement: fc.constantFrom(
      'top' as const,
      'bottom' as const,
      'left' as const,
      'right' as const
    ),
  })
  .map(({ id, title, description, placement }) => ({
    target: `[data-tour="${id}"]`,
    title,
    description,
    placement,
  }))

/** 1~5개의 TourStep 배열 생성 */
const tourStepsArb = fc.array(tourStepArb, { minLength: 1, maxLength: 5 })

// ============================================
// Test Suite
// ============================================

beforeEach(() => {
  localStorage.clear()
  clearTourTargets()
})

afterEach(() => {
  localStorage.clear()
  clearTourTargets()
})

describe('온보딩 가이드 Bug Condition Exploration', () => {
  /**
   * Bug 1: skip() 호출 후 재마운트 시 isActive가 true여야 한다
   *
   * 현재 동작: skip() → localStorage에 completed=true 저장 → 재마운트 시 isActive=false
   * 기대 동작: skip() → localStorage에 저장하지 않음 → 재마운트 시 isActive=true
   *
   * dismissed 상태가 아닌 경우 매번 isActive=true 반환해야 함
   *
   * EXPECTED: 수정 전 코드에서 FAIL
   *
   * **Validates: Requirements 1.3, 2.3**
   */
  test('skip() 호출 후 재마운트 시 isActive가 true여야 한다 (dismissed 아닌 경우 매번 표시)', () => {
    fc.assert(
      fc.property(tourStepsArb, (steps) => {
        // Setup: DOM에 타겟 요소 추가
        clearTourTargets()
        localStorage.clear()
        addTourTargets(steps)

        // 1차 마운트: 투어 시작
        const { result, unmount } = renderHook(() => useOnboarding(steps))

        // 투어가 활성화되어야 함
        expect(result.current.isActive).toBe(true)

        // skip() 호출 → 투어 종료
        act(() => {
          result.current.skip()
        })
        expect(result.current.isActive).toBe(false)

        unmount()

        // 2차 마운트: 재방문 시뮬레이션
        // dismissed 상태가 아니므로 isActive=true여야 함
        const { result: result2, unmount: unmount2 } = renderHook(() =>
          useOnboarding(steps)
        )

        // 기대: dismissed가 아닌 경우 매번 isActive=true
        // 현재 버그: localStorage에 completed=true가 저장되어 isActive=false
        expect(result2.current.isActive).toBe(true)

        unmount2()
      }),
      { numRuns: 20 }
    )
  })

  /**
   * Bug 2: 마지막 스텝 next() 호출 후 재마운트 시 isActive가 true여야 한다
   *
   * 현재 동작: 마지막 스텝에서 next() → localStorage에 completed=true 저장 → 재마운트 시 isActive=false
   * 기대 동작: 마지막 스텝에서 next() → localStorage에 저장하지 않음 → 재마운트 시 isActive=true
   *
   * dismissed 상태가 아닌 경우 매번 isActive=true 반환해야 함
   *
   * EXPECTED: 수정 전 코드에서 FAIL
   *
   * **Validates: Requirements 1.2, 2.2**
   */
  test('마지막 스텝 next() 호출 후 재마운트 시 isActive가 true여야 한다 (dismissed 아닌 경우 매번 표시)', () => {
    fc.assert(
      fc.property(tourStepsArb, (steps) => {
        // Setup: DOM에 타겟 요소 추가
        clearTourTargets()
        localStorage.clear()
        addTourTargets(steps)

        // 1차 마운트: 투어 시작
        const { result, unmount } = renderHook(() => useOnboarding(steps))

        expect(result.current.isActive).toBe(true)

        // 모든 스텝을 next()로 진행하여 마지막까지 도달
        const totalSteps = steps.length
        for (let i = 0; i < totalSteps; i++) {
          act(() => {
            result.current.next()
          })
        }

        // 마지막 스텝 이후 투어 종료
        expect(result.current.isActive).toBe(false)

        unmount()

        // 2차 마운트: 재방문 시뮬레이션
        // dismissed 상태가 아니므로 isActive=true여야 함
        const { result: result2, unmount: unmount2 } = renderHook(() =>
          useOnboarding(steps)
        )

        // 기대: dismissed가 아닌 경우 매번 isActive=true
        // 현재 버그: localStorage에 completed=true가 저장되어 isActive=false
        expect(result2.current.isActive).toBe(true)

        unmount2()
      }),
      { numRuns: 20 }
    )
  })
})
