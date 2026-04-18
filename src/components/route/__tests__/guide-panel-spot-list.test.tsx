/**
 * @jest-environment jsdom
 */

/**
 * Feature: ux-quality-improvements, Property 2: GuidePanel spot list completeness
 * Validates: Requirements 3.2, 3.3
 *
 * Property 2: GuidePanel 스팟 목록 렌더링 완전성
 *
 * 임의의 RouteSpot 배열에 대해 GuidePanel은 모든 스팟을 배열 순서대로 렌더링하며,
 * 각 항목에는 스팟 이름(spotName), 이전 스팟으로부터의 거리(distanceFromPrev),
 * 예상 이동 시간(walkTimeFromPrev) 정보가 포함되어야 한다.
 */

import fc from 'fast-check'
import { render } from '@testing-library/react'
import { GuidePanel } from '../GuidePanel'
import type { RouteSpot } from '@/types/route'

// ============================================
// Mocks
// ============================================

// DirectionsButton은 외부 지도 앱 연동이므로 mock 처리
jest.mock('@/components/common/DirectionsButton', () => {
  return function MockDirectionsButton(props: {
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

// next/image mock
jest.mock('next/image', () => {
  return function MockImage(props: Record<string, unknown>) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  }
})

// ============================================
// Helpers
// ============================================

/** formatDistance와 동일한 로직 (검증용) */
function expectedDistanceText(meters: number): string {
  if (meters < 1000) return `${meters}m`
  return `${(meters / 1000).toFixed(1)}km`
}

/** formatTime과 동일한 로직 (검증용) */
function expectedTimeText(minutes: number): string {
  if (minutes < 60) return `약 ${minutes}분`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `약 ${h}시간 ${m}분` : `약 ${h}시간`
}

// ============================================
// Generators
// ============================================

/**
 * 유효한(available) RouteSpot을 생성하는 arbitrary.
 * distanceFromPrev와 walkTimeFromPrev는 양수 값을 가진다.
 * (첫 번째 스팟은 null이 될 수 있지만, 렌더링 완전성 검증을 위해 양수로 생성)
 */
const availableSpotArbitrary = (idx: number): fc.Arbitrary<RouteSpot> =>
  fc.record({
    spotId: fc.stringMatching(/^[a-f0-9]{24}$/).map((id) => `${id}-${idx}`),
    spotName: fc
      .array(fc.constantFrom('가', '나', '다', '라', '마', '바', '사'), {
        minLength: 1,
        maxLength: 8,
      })
      .map((chars) => `스팟${idx}_${chars.join('')}`),
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
 * 1~8개의 유효한 RouteSpot 배열을 생성하는 arbitrary.
 */
const spotsArrayArbitrary: fc.Arbitrary<RouteSpot[]> = fc
  .integer({ min: 1, max: 8 })
  .chain((count) =>
    fc.tuple(
      ...Array.from({ length: count }, (_, i) => availableSpotArbitrary(i))
    )
  )
  .map((tuple) => tuple as RouteSpot[])

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

describe('GuidePanel 스팟 목록 렌더링 완전성 속성 테스트', () => {
  /**
   * Property 2-1: 모든 스팟이 순서대로 렌더링되며 spotName이 포함된다
   *
   * Validates: Requirements 3.2
   */
  test('Property 2: 임의의 RouteSpot 배열에 대해 모든 spotName이 순서대로 렌더링된다', () => {
    fc.assert(
      fc.property(spotsArrayArbitrary, (spots) => {
        const { container, unmount } = render(
          <GuidePanel {...makeDefaultProps(spots)} />
        )

        const textContent = container.textContent ?? ''

        // 모든 spotName이 렌더링 결과에 포함되어야 한다
        for (const spot of spots) {
          expect(textContent).toContain(spot.spotName)
        }

        // 순서 검증: 각 spotName의 출현 위치가 배열 순서와 일치해야 한다
        let lastIndex = -1
        for (const spot of spots) {
          const currentIndex = textContent.indexOf(spot.spotName, lastIndex + 1)
          expect(currentIndex).toBeGreaterThan(lastIndex)
          lastIndex = currentIndex
        }

        unmount()
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 2-2: 각 스팟의 distanceFromPrev 정보가 포맷팅되어 렌더링된다
   *
   * Validates: Requirements 3.3
   */
  test('Property 2: 임의의 RouteSpot 배열에 대해 distanceFromPrev가 포맷팅되어 표시된다', () => {
    fc.assert(
      fc.property(spotsArrayArbitrary, (spots) => {
        const { container, unmount } = render(
          <GuidePanel {...makeDefaultProps(spots)} />
        )

        const textContent = container.textContent ?? ''

        for (const spot of spots) {
          if (
            spot.distanceFromPrev !== null &&
            spot.distanceFromPrev > 0 &&
            spot.isAvailable !== false
          ) {
            const expected = expectedDistanceText(spot.distanceFromPrev)
            expect(textContent).toContain(expected)
          }
        }

        unmount()
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 2-3: 각 스팟의 walkTimeFromPrev 정보가 포맷팅되어 렌더링된다
   *
   * Validates: Requirements 3.3
   */
  test('Property 2: 임의의 RouteSpot 배열에 대해 walkTimeFromPrev가 포맷팅되어 표시된다', () => {
    fc.assert(
      fc.property(spotsArrayArbitrary, (spots) => {
        const { container, unmount } = render(
          <GuidePanel {...makeDefaultProps(spots)} />
        )

        const textContent = container.textContent ?? ''

        for (const spot of spots) {
          if (
            spot.walkTimeFromPrev !== null &&
            spot.distanceFromPrev !== null &&
            spot.distanceFromPrev > 0 &&
            spot.isAvailable !== false
          ) {
            const expected = expectedTimeText(spot.walkTimeFromPrev)
            expect(textContent).toContain(expected)
          }
        }

        unmount()
      }),
      { numRuns: 100 }
    )
  })
})
