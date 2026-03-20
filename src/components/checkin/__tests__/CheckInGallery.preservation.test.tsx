/**
 * @jest-environment jsdom
 */

/**
 * Preservation Property Tests - 갤러리 기존 레이아웃 보존
 *
 * Property 2: Preservation - 4개 이상 갤러리 그리드 및 모달 동작 보존
 *
 * 수정 전/후 코드에서 모두 PASS해야 하며, 기존 동작이 변경되지 않았음을 보장합니다.
 *
 * EXPECTED OUTCOME: 수정 전 코드에서 테스트 PASS (기존 동작 보존 확인)
 *
 * Requirements: 3.3, 3.4
 */

import fc from 'fast-check'
import { render, fireEvent } from '@testing-library/react'
import { CheckIn } from '@/types'

// ============================================
// Mocks
// ============================================

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

let capturedCheckIn: CheckIn | null = null

jest.mock('../CheckInDetailModal', () => ({
  CheckInDetailModal: ({ checkIn }: { checkIn: CheckIn }) => {
    capturedCheckIn = checkIn
    return <div data-testid="checkin-detail-modal">{checkIn.id}</div>
  },
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
    likeCount: id * 2,
    createdAt: new Date('2025-01-01'),
  }
}

/** 4~20개 범위의 체크인 수 생성 (preservation 대상) */
const manyItemCountArbitrary = fc.integer({ min: 4, max: 20 })

/** 클릭할 아이템 인덱스 생성 (count에 의존) */
function clickIndexArbitrary(count: number) {
  return fc.integer({ min: 0, max: count - 1 })
}

// ============================================
// Test Suite
// ============================================

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { CheckInGallery } = require('../CheckInGallery')

afterEach(() => {
  mockCheckins = []
  mockIsLoading = false
  capturedCheckIn = null
})

describe('CheckInGallery Preservation - 갤러리 기존 레이아웃 보존', () => {
  /**
   * Property 2-1: 아이템 4~20개일 때 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 클래스 유지
   *
   * 아이템 수가 4개 이상인 경우 기존 반응형 그리드 레이아웃이
   * 수정 전후 동일하게 유지되어야 한다.
   *
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('아이템 4~20개일 때 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 클래스가 유지된다', () => {
    fc.assert(
      fc.property(manyItemCountArbitrary, (count) => {
        mockCheckins = Array.from({ length: count }, (_, i) =>
          createMockCheckIn(i)
        )

        const { container, unmount } = render(
          <CheckInGallery spotId="test-spot" />
        )

        const gridContainer = container.querySelector('.grid')
        expect(gridContainer).not.toBeNull()

        const className = gridContainer!.className
        expect(className).toContain('grid-cols-2')
        expect(className).toContain('sm:grid-cols-3')
        expect(className).toContain('md:grid-cols-4')
        expect(className).toContain('gap-3')

        unmount()
      }),
      { numRuns: 20 }
    )
  })

  /**
   * Property 2-2: 아이템 4~20개일 때 모든 아이템이 렌더링된다
   *
   * 갤러리에 전달된 체크인 수만큼 정확히 아이템이 렌더링되어야 한다.
   *
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('아이템 4~20개일 때 모든 아이템이 정확히 렌더링된다', () => {
    fc.assert(
      fc.property(manyItemCountArbitrary, (count) => {
        mockCheckins = Array.from({ length: count }, (_, i) =>
          createMockCheckIn(i)
        )

        const { container, unmount } = render(
          <CheckInGallery spotId="test-spot" />
        )

        const galleryItems = container.querySelectorAll('button.group')
        expect(galleryItems.length).toBe(count)

        unmount()
      }),
      { numRuns: 20 }
    )
  })

  /**
   * Property 2-3: 아이템 클릭 시 CheckInDetailModal이 렌더링된다
   *
   * 갤러리 아이템을 클릭하면 selectedCheckIn 상태가 설정되고
   * CheckInDetailModal이 해당 체크인 데이터와 함께 렌더링되어야 한다.
   *
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('아이템 클릭 시 selectedCheckIn이 설정되고 CheckInDetailModal이 렌더링된다', () => {
    fc.assert(
      fc.property(
        manyItemCountArbitrary.chain((count) =>
          clickIndexArbitrary(count).map((idx) => ({ count, idx }))
        ),
        ({ count, idx }) => {
          mockCheckins = Array.from({ length: count }, (_, i) =>
            createMockCheckIn(i)
          )
          capturedCheckIn = null

          const { container, unmount, getByTestId } = render(
            <CheckInGallery spotId="test-spot" />
          )

          const galleryItems = container.querySelectorAll('button.group')
          fireEvent.click(galleryItems[idx])

          // CheckInDetailModal이 렌더링되었는지 확인
          const modal = getByTestId('checkin-detail-modal')
          expect(modal).toBeTruthy()

          // 클릭한 아이템의 체크인 데이터가 전달되었는지 확인
          expect(capturedCheckIn).not.toBeNull()
          expect(capturedCheckIn!.id).toBe(`checkin-${idx}`)

          unmount()
        }
      ),
      { numRuns: 20 }
    )
  })

  /**
   * Property 2-4: 정렬 옵션 버튼이 항상 렌더링된다
   *
   * 아이템이 있을 때 최신순/인기순 정렬 버튼이 항상 표시되어야 한다.
   *
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('아이템이 있을 때 정렬 옵션(최신순/인기순) 버튼이 렌더링된다', () => {
    fc.assert(
      fc.property(manyItemCountArbitrary, (count) => {
        mockCheckins = Array.from({ length: count }, (_, i) =>
          createMockCheckIn(i)
        )

        const { getByText, unmount } = render(
          <CheckInGallery spotId="test-spot" />
        )

        // 정렬 버튼 존재 확인
        const latestBtn = getByText('최신순')
        const popularBtn = getByText('인기순')
        expect(latestBtn).toBeTruthy()
        expect(popularBtn).toBeTruthy()

        // 기본 정렬은 최신순 (활성 스타일)
        expect(latestBtn.className).toContain('bg-blue-100')
        expect(popularBtn.className).not.toContain('bg-blue-100')

        unmount()
      }),
      { numRuns: 10 }
    )
  })

  /**
   * Property 2-5: 정렬 옵션 전환 시 활성 스타일이 변경된다
   *
   * 인기순 버튼 클릭 시 활성 스타일이 인기순으로 전환되어야 한다.
   *
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('정렬 옵션 전환 시 활성 스타일이 올바르게 변경된다', () => {
    fc.assert(
      fc.property(manyItemCountArbitrary, (count) => {
        mockCheckins = Array.from({ length: count }, (_, i) =>
          createMockCheckIn(i)
        )

        const { getByText, unmount } = render(
          <CheckInGallery spotId="test-spot" />
        )

        const popularBtn = getByText('인기순')
        fireEvent.click(popularBtn)

        // 인기순이 활성화되어야 함
        expect(popularBtn.className).toContain('bg-blue-100')

        const latestBtn = getByText('최신순')
        expect(latestBtn.className).not.toContain('bg-blue-100')

        unmount()
      }),
      { numRuns: 10 }
    )
  })

  /**
   * Property 2-6: 총 인증 수 텍스트가 표시된다
   *
   * 아이템이 있을 때 "총 N개의 인증" 텍스트가 표시되어야 한다.
   *
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('아이템이 있을 때 총 인증 수 텍스트가 표시된다', () => {
    fc.assert(
      fc.property(manyItemCountArbitrary, (count) => {
        mockCheckins = Array.from({ length: count }, (_, i) =>
          createMockCheckIn(i)
        )

        const { getByText, unmount } = render(
          <CheckInGallery spotId="test-spot" />
        )

        const totalText = getByText(`총 ${count}개의 인증`)
        expect(totalText).toBeTruthy()

        unmount()
      }),
      { numRuns: 10 }
    )
  })
})
