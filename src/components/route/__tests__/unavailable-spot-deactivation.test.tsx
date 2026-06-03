/**
 * @jest-environment jsdom
 */

/**
 * Feature: ux-quality-improvements, Property 4: unavailable spot deactivation
 * Validates: Requirements 3.9
 *
 * Property 4: 소실 스팟 비활성 처리
 *
 * 임의의 RouteSpot 배열에서 `isAvailable === false`인 스팟이
 * 비활성 스타일(line-through, 회색 배경)로 렌더링되고
 * 인증 버튼 대신 "건너뛰기" 표시가 있는지 검증한다.
 */

import fc from 'fast-check'
import { render } from '@testing-library/react'
import { GuidePanel } from '../GuidePanel'
import type { RouteSpot } from '@/types/route'

// ============================================
// Mocks
// ============================================

jest.mock('@/components/common/DirectionsButton', () => {
  return function MockDirectionsButton(_props: {
    lat: number
    lng: number
    destinationName?: string
    className?: string
  }) {
    return (
      <button data-testid="directions-btn" aria-label="길찾기">
        길찾기
      </button>
    )
  }
})

jest.mock('next/image', () => {
  return function MockImage(props: Record<string, unknown>) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  }
})

// ============================================
// Generators
// ============================================

/**
 * 유효한(available) RouteSpot을 생성하는 arbitrary.
 */
const availableSpotArbitrary = (idx: number): fc.Arbitrary<RouteSpot> =>
  fc.record({
    spotId: fc.constant(`spot-avail-${idx}`),
    spotName: fc.constant(`유효스팟${idx}`),
    coordinates: fc.record({
      lat: fc.double({ min: 33.0, max: 38.0, noNaN: true }),
      lng: fc.double({ min: 126.0, max: 132.0, noNaN: true }),
    }),
    thumbnailUrl: fc.constant(`https://example.com/thumb-${idx}.jpg`),
    distanceFromPrev: fc.integer({ min: 1, max: 50000 }),
    walkTimeFromPrev: fc.integer({ min: 1, max: 300 }),
    note: fc.constant(undefined),
    isAvailable: fc.constant(true),
  })

/**
 * 소실(unavailable) RouteSpot을 생성하는 arbitrary.
 */
const unavailableSpotArbitrary = (idx: number): fc.Arbitrary<RouteSpot> =>
  fc.record({
    spotId: fc.constant(`spot-unavail-${idx}`),
    spotName: fc.constant(`소실스팟${idx}`),
    coordinates: fc.record({
      lat: fc.double({ min: 33.0, max: 38.0, noNaN: true }),
      lng: fc.double({ min: 126.0, max: 132.0, noNaN: true }),
    }),
    thumbnailUrl: fc.constant(`https://example.com/thumb-unavail-${idx}.jpg`),
    distanceFromPrev: fc.integer({ min: 1, max: 50000 }),
    walkTimeFromPrev: fc.integer({ min: 1, max: 300 }),
    note: fc.constant(undefined),
    isAvailable: fc.constant(false),
  })

/**
 * available과 unavailable 스팟이 섞인 배열을 생성하는 arbitrary.
 * 최소 1개의 available + 최소 1개의 unavailable 스팟을 보장한다.
 */
const mixedSpotsArbitrary: fc.Arbitrary<RouteSpot[]> = fc
  .tuple(
    fc.integer({ min: 1, max: 4 }), // available 개수
    fc.integer({ min: 1, max: 4 }) // unavailable 개수
  )
  .chain(([availCount, unavailCount]) => {
    const availArbs = Array.from({ length: availCount }, (_, i) =>
      availableSpotArbitrary(i)
    )
    const unavailArbs = Array.from({ length: unavailCount }, (_, i) =>
      unavailableSpotArbitrary(i)
    )
    return fc
      .tuple(...availArbs, ...unavailArbs)
      .map((spotsArr) =>
        fc.shuffledSubarray([...spotsArr] as RouteSpot[], {
          minLength: spotsArr.length,
          maxLength: spotsArr.length,
        })
      )
      .chain((shuffled) => shuffled)
  })

// ============================================
// Default props factory
// ============================================

function makeDefaultProps(spots: RouteSpot[]) {
  return {
    spots,
    checkedSpotIds: [] as string[],
    currentSpotIndex: 0,
    progress: 0,
    currentPosition: null,
    accuracy: null,
    onCheckIn: jest.fn(),
    onEndRoute: jest.fn(),
    isCompleted: false,
  }
}

// ============================================
// Test Suite
// ============================================

describe('소실 스팟 비활성 처리 속성 테스트', () => {
  /**
   * Property 4-1: unavailable 스팟의 spotName에 line-through 클래스가 적용된다
   *
   * Validates: Requirements 3.9
   */
  test('Property 4: unavailable 스팟의 spotName에 line-through 클래스가 적용된다', () => {
    fc.assert(
      fc.property(mixedSpotsArbitrary, (spots) => {
        const { container, unmount } = render(
          <GuidePanel {...makeDefaultProps(spots)} />
        )

        const unavailableSpots = spots.filter((s) => s.isAvailable === false)

        for (const spot of unavailableSpots) {
          // spotName 텍스트를 포함하는 요소를 찾아 line-through 클래스 확인
          const nameElements = container.querySelectorAll('.line-through')
          const hasLineThrough = Array.from(nameElements).some(
            (el) => el.textContent === spot.spotName
          )
          expect(hasLineThrough).toBe(true)
        }

        unmount()
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 4-2: unavailable 스팟에 "건너뛰기" 텍스트가 표시된다
   *
   * Validates: Requirements 3.9
   */
  test('Property 4: unavailable 스팟에 "건너뛰기" 텍스트가 표시된다', () => {
    fc.assert(
      fc.property(mixedSpotsArbitrary, (spots) => {
        const { container, unmount } = render(
          <GuidePanel {...makeDefaultProps(spots)} />
        )

        const textContent = container.textContent ?? ''
        const unavailableCount = spots.filter(
          (s) => s.isAvailable === false
        ).length

        // "건너뛰기" 텍스트가 unavailable 스팟 수만큼 존재해야 한다
        const matches = textContent.match(/건너뛰기/g) ?? []
        expect(matches.length).toBe(unavailableCount)

        unmount()
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 4-3: unavailable 스팟에 "여기서 인증하기" 버튼이 없다
   *
   * Validates: Requirements 3.9
   */
  test('Property 4: unavailable 스팟에 "여기서 인증하기" 버튼이 없다', () => {
    fc.assert(
      fc.property(mixedSpotsArbitrary, (spots) => {
        const { container, unmount } = render(
          <GuidePanel {...makeDefaultProps(spots)} />
        )

        const availableUncheckedCount = spots.filter(
          (s) => s.isAvailable !== false
        ).length
        const checkInButtons = container.querySelectorAll('button')
        const checkInBtnTexts = Array.from(checkInButtons).filter(
          (btn) => btn.textContent === '여기서 인증하기'
        )

        // "여기서 인증하기" 버튼 수는 available 스팟 수와 같아야 한다
        expect(checkInBtnTexts.length).toBe(availableUncheckedCount)

        unmount()
      }),
      { numRuns: 100 }
    )
  })
})
