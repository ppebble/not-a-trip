/**
 * @jest-environment jsdom
 */

/**
 * Bug Condition Exploration Test - 갤러리 아이템 크기 제한
 *
 * Property 1: Bug Condition - 갤러리 아이템 과도한 크기
 * 아이템 수가 1~3개일 때 각 아이템의 렌더링 너비가 max-width를 초과하는지 검증합니다.
 *
 * Bug Condition:
 *   input.component == "CheckInGallery"
 *   AND input.checkinCount IN [1, 2, 3]
 *   AND input.viewportWidth > singleItemMaxWidth
 *
 * EXPECTED OUTCOME: 수정 전 코드에서 테스트 FAIL (버그 존재 확인)
 *
 * Requirements: 2.3, 2.4
 */

import fc from 'fast-check'
import { render } from '@testing-library/react'
import { CheckIn } from '@/types'

// ============================================
// Mocks
// ============================================

// 모듈 레벨 mock 데이터 저장소
let mockCheckins: CheckIn[] = []
let mockIsLoading = false

jest.mock('@/hooks/useGalleryQueries', () => ({
  useCheckInGallery: () => ({
    data: {
      checkins: mockCheckins,
      total: mockCheckins.length,
      page: 1,
      limit: 12,
    },
    isLoading: mockIsLoading,
  }),
}))

jest.mock('../CheckInDetailModal', () => ({
  CheckInDetailModal: () => <div data-testid="checkin-detail-modal" />,
}))

jest.mock('next/image', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockImage(props: any) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  }
})

// ============================================
// Generators
// ============================================

/** 체크인 아이템 생성 */
function createMockCheckIn(id: number): CheckIn {
  return {
    id: `checkin-${id}`,
    spotId: `spot-${id}`,
    userId: `user-${id}`,
    userName: `유저${id}`,
    photoUrl: `https://example.com/photo-${id}.jpg`,
    visitedAt: new Date('2025-01-01'),
    likeCount: 0,
    createdAt: new Date('2025-01-01'),
  }
}

/** 1~3개 범위의 체크인 수 생성 */
const fewItemCountArbitrary = fc.integer({ min: 1, max: 3 })

// ============================================
// Test Suite
// ============================================

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { CheckInGallery } = require('../CheckInGallery')

afterEach(() => {
  mockCheckins = []
  mockIsLoading = false
})

describe('CheckInGallery Bug Condition Exploration - 갤러리 아이템 크기 제한', () => {
  /**
   * Property 1-1: 아이템 1~3개일 때 max-width 제한 클래스가 적용되어야 한다
   *
   * 아이템 수가 1~3개인 경우 각 갤러리 아이템에 max-w-[200px] 등의
   * max-width 제한 클래스가 적용되어 과도한 크기를 방지해야 한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (max-width 클래스 미적용)
   */
  test('아이템 1~3개일 때 각 아이템에 max-width 제한 클래스가 적용되어야 한다', () => {
    fc.assert(
      fc.property(fewItemCountArbitrary, (count) => {
        mockCheckins = Array.from({ length: count }, (_, i) =>
          createMockCheckIn(i)
        )

        const { container, unmount } = render(
          <CheckInGallery spotId="test-spot" />
        )

        // 갤러리 아이템(button) 요소들을 찾음
        const galleryItems = container.querySelectorAll('button.group')

        expect(galleryItems.length).toBe(count)

        // 각 아이템에 max-width 제한 클래스가 있어야 함
        galleryItems.forEach((item) => {
          const hasMaxWidth = item.className.includes('max-w-')
          expect(hasMaxWidth).toBe(true)
        })

        unmount()
      }),
      { numRuns: 10 }
    )
  })

  /**
   * Property 1-2: 아이템 1~3개일 때 좌측 정렬이 적용되어야 한다
   *
   * 아이템 수가 적을 때 그리드 컨테이너에 justify-items-start 또는
   * flex 기반 좌측 정렬이 적용되어야 한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (좌측 정렬 미적용)
   */
  test('아이템 1~3개일 때 그리드 컨테이너에 좌측 정렬이 적용되어야 한다', () => {
    fc.assert(
      fc.property(fewItemCountArbitrary, (count) => {
        mockCheckins = Array.from({ length: count }, (_, i) =>
          createMockCheckIn(i)
        )

        const { container, unmount } = render(
          <CheckInGallery spotId="test-spot" />
        )

        // 갤러리 그리드 컨테이너 찾기
        const gridContainer = container.querySelector('.grid')

        expect(gridContainer).not.toBeNull()

        // 좌측 정렬 클래스가 있어야 함
        const className = gridContainer!.className
        const hasLeftAlign =
          className.includes('justify-items-start') ||
          className.includes('justify-start') ||
          className.includes('items-start')

        expect(hasLeftAlign).toBe(true)

        unmount()
      }),
      { numRuns: 10 }
    )
  })

  /**
   * Property 1-3: 스켈레톤 UI에도 max-width 제한이 적용되어야 한다
   *
   * 로딩 상태의 스켈레톤 UI에서도 아이템 수가 적을 때
   * 동일한 max-width 제한이 적용되어 레이아웃 시프트를 방지해야 한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (스켈레톤에 max-width 미적용)
   */
  test('스켈레톤 UI에도 max-width 제한이 적용되어야 한다', () => {
    // 로딩 상태 시뮬레이션
    mockCheckins = []
    mockIsLoading = true

    const { container } = render(
      <CheckInGallery spotId="test-spot" limit={3} />
    )

    // 스켈레톤 아이템 찾기
    const skeletonItems = container.querySelectorAll('.animate-pulse')

    // 스켈레톤 아이템이 3개 이하일 때 max-width 제한이 있어야 함
    if (skeletonItems.length <= 3) {
      skeletonItems.forEach((item) => {
        const hasMaxWidth = item.className.includes('max-w-')
        expect(hasMaxWidth).toBe(true)
      })
    }
  })

  /**
   * Property 1-4: 소스코드에 아이템 수 기반 조건부 스타일링이 존재해야 한다
   *
   * CheckInGallery 소스코드에서 아이템 수가 적을 때(1~3개)
   * 조건부로 max-width를 적용하는 로직이 있어야 한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (조건부 스타일링 로직 미존재)
   */
  test('소스코드에 아이템 수 기반 조건부 max-width 스타일링이 존재해야 한다', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')
    const sourceCode = fs.readFileSync(
      path.resolve(__dirname, '../CheckInGallery.tsx'),
      'utf-8'
    )

    // max-width 관련 클래스가 소스코드에 존재하는지 확인
    const hasMaxWidthClass = /max-w-/.test(sourceCode)

    // 수정 후에는 max-width 클래스가 존재해야 함
    // 수정 전에는 없으므로 테스트 FAIL
    expect(hasMaxWidthClass).toBe(true)
  })
})
