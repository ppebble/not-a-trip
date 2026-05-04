/**
 * @jest-environment jsdom
 */

/**
 * Preservation Property Test - findNextValidStep 동작 및 기존 동작 보존
 *
 * Feature: 31-onboarding-guide-fix, Property 2: Preservation
 *
 * 수정 전 코드에서 기존 동작이 올바르게 작동하는지 확인한다:
 * - findNextValidStep이 fromIndex 이상의 유효한 인덱스 또는 -1 반환
 * - 반환된 인덱스가 -1이 아닌 경우 해당 스텝의 target이 DOM에 존재
 * - Escape 키 입력 시 onSkip 호출
 *
 * EXPECTED OUTCOME: 수정 전 코드에서 테스트 PASS (기존 동작 보존 확인)
 *
 * **Validates: Requirements 3.2, 3.5, 3.6**
 */

import fc from 'fast-check'
import { createElement } from 'react'
import { render, fireEvent } from '@testing-library/react'
import { findNextValidStep, TourStep } from '@/hooks/useOnboarding'
import OnboardingTour from '@/components/common/OnboardingTour'

// ============================================
// Helpers
// ============================================

/** DOM에 data-tour 요소를 추가하고 추가된 요소 목록을 반환한다 */
function addTourTargets(ids: string[]): HTMLElement[] {
  return ids.map((id) => {
    const el = document.createElement('div')
    el.setAttribute('data-tour', id)
    document.body.appendChild(el)
    return el
  })
}

/** DOM에서 모든 data-tour 요소를 제거한다 */
function clearTourTargets(): void {
  document.querySelectorAll('[data-tour]').forEach((el) => el.remove())
}

// ============================================
// Generators
// ============================================

/** 유효한 tour ID 생성 arbitrary */
const tourIdArb = fc.stringMatching(/^[a-z]{3,8}$/)

/** TourStep 생성 arbitrary (target은 data-tour selector) */
const tourStepFromId = (id: string): TourStep => ({
  target: `[data-tour="${id}"]`,
  title: `${id} 안내`,
  description: `${id} 설명`,
  placement: 'bottom',
})

/**
 * DOM에 존재하는 스텝과 존재하지 않는 스텝이 섞인 배열 생성
 * - inDomIds: DOM에 추가할 ID 목록
 * - allIds: 전체 스텝 ID 목록 (inDomIds 포함)
 */
const mixedStepsArb = fc
  .record({
    inDomIds: fc.uniqueArray(tourIdArb, { minLength: 0, maxLength: 4 }),
    notInDomIds: fc.uniqueArray(tourIdArb, { minLength: 0, maxLength: 4 }),
  })
  .filter(({ inDomIds, notInDomIds }) => {
    // 최소 1개의 스텝이 있어야 함
    if (inDomIds.length + notInDomIds.length === 0) return false
    // ID 중복 방지
    const allIds = new Set([...inDomIds, ...notInDomIds])
    return allIds.size === inDomIds.length + notInDomIds.length
  })
  .chain(({ inDomIds, notInDomIds }) => {
    const allIds = [...inDomIds, ...notInDomIds]
    // 셔플된 순서로 스텝 배열 생성
    return fc
      .shuffledSubarray(allIds, {
        minLength: allIds.length,
        maxLength: allIds.length,
      })
      .map((shuffled) => ({
        inDomIds,
        steps: shuffled.map(tourStepFromId),
      }))
  })

// ============================================
// Test Suite
// ============================================

beforeEach(() => {
  clearTourTargets()
})

afterEach(() => {
  clearTourTargets()
})

describe('온보딩 가이드 Preservation Property Tests', () => {
  /**
   * Property: findNextValidStep은 fromIndex 이상의 유효한 인덱스 또는 -1을 반환한다
   *
   * 임의의 TourStep 배열과 fromIndex에 대해:
   * - 반환값이 -1이거나 fromIndex 이상이어야 한다
   * - 반환값이 steps.length 미만이어야 한다
   *
   * **Validates: Requirements 3.2**
   */
  test('findNextValidStep은 fromIndex 이상의 유효한 인덱스 또는 -1을 반환한다', () => {
    fc.assert(
      fc.property(
        mixedStepsArb,
        fc.nat({ max: 10 }),
        ({ inDomIds, steps }, fromIndex) => {
          // Setup: DOM에 inDomIds에 해당하는 요소만 추가
          clearTourTargets()
          addTourTargets(inDomIds)

          const result = findNextValidStep(steps, fromIndex)

          // 반환값은 -1이거나 fromIndex 이상이어야 한다
          if (result === -1) {
            // -1인 경우: fromIndex 이후에 DOM에 존재하는 스텝이 없어야 한다
            for (let i = fromIndex; i < steps.length; i++) {
              const match = steps[i].target.match(/\[data-tour="(.+?)"\]/)
              if (match) {
                expect(inDomIds).not.toContain(match[1])
              }
            }
          } else {
            // 유효한 인덱스인 경우
            expect(result).toBeGreaterThanOrEqual(fromIndex)
            expect(result).toBeLessThan(steps.length)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: 반환된 인덱스가 -1이 아닌 경우 해당 스텝의 target이 DOM에 존재한다
   *
   * findNextValidStep이 유효한 인덱스를 반환하면,
   * 해당 인덱스의 스텝 target selector로 DOM 요소를 찾을 수 있어야 한다.
   *
   * **Validates: Requirements 3.2**
   */
  test('반환된 인덱스가 -1이 아닌 경우 해당 스텝의 target이 DOM에 존재한다', () => {
    fc.assert(
      fc.property(
        mixedStepsArb,
        fc.nat({ max: 10 }),
        ({ inDomIds, steps }, fromIndex) => {
          // Setup: DOM에 inDomIds에 해당하는 요소만 추가
          clearTourTargets()
          addTourTargets(inDomIds)

          const result = findNextValidStep(steps, fromIndex)

          if (result !== -1) {
            // 반환된 인덱스의 스텝 target이 DOM에 존재해야 한다
            const targetSelector = steps[result].target
            const element = document.querySelector(targetSelector)
            expect(element).not.toBeNull()
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Escape 키 입력 시 onSkip이 호출된다
   *
   * OnboardingTour 컴포넌트가 활성 상태일 때 Escape 키를 누르면
   * onSkip 콜백이 호출되어야 한다.
   *
   * **Validates: Requirements 3.5**
   */
  test('Escape 키 입력 시 onSkip이 호출된다', () => {
    const steps: TourStep[] = [
      {
        target: '[data-tour="test-escape"]',
        title: '테스트',
        description: '테스트 설명',
        placement: 'bottom',
      },
    ]

    // DOM에 타겟 요소 추가
    addTourTargets(['test-escape'])

    const onSkip = jest.fn()
    const onNext = jest.fn()
    const onComplete = jest.fn()

    render(
      createElement(OnboardingTour, {
        steps,
        isActive: true,
        currentStep: 0,
        onNext,
        onSkip,
        onComplete,
      })
    )

    // Escape 키 입력
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onSkip).toHaveBeenCalledTimes(1)
  })
})
