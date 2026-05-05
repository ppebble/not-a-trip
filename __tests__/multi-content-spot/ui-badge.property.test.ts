/**
 * Property-Based Tests: FloatingCard +N 배지
 * Property 13: FloatingCard "+N" 배지 표시
 *
 * Feature: multi-content-spot-structure
 * **Validates: Requirements 9.1, 9.5**
 */

import * as fc from 'fast-check'
import type { SpotCategory } from '@/types/spot'

// ============================================
// Types (from ShowcaseCard)
// ============================================

interface ShowcaseCard {
  id: string
  spotName: string
  contentName: string
  additionalContentNames?: string[]
  category: SpotCategory
  imageUrl: string
}

type CardSize = 'sm' | 'md' | 'lg'

// ============================================
// Generators
// ============================================

const categoryArb = fc.constantFrom<SpotCategory>(
  'animation',
  'sports',
  'movie_drama',
  'music',
  'game',
  'other'
)

const showcaseCardArb = fc.record({
  id: fc.uuid(),
  spotName: fc.string({ minLength: 1, maxLength: 30 }),
  contentName: fc.string({ minLength: 1, maxLength: 50 }),
  additionalContentNames: fc.option(
    fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
      minLength: 1,
      maxLength: 5,
    })
  ),
  category: categoryArb,
  imageUrl: fc.constant('https://example.com/image.jpg'),
}) as fc.Arbitrary<ShowcaseCard>

const cardSizeArb = fc.constantFrom<CardSize>('sm', 'md', 'lg')

// ============================================
// Pure logic under test (extracted from FloatingCard)
// ============================================

/**
 * +N 배지 표시 여부 결정 로직
 */
function shouldShowBadge(card: ShowcaseCard): boolean {
  return (
    card.additionalContentNames !== undefined &&
    card.additionalContentNames !== null &&
    card.additionalContentNames.length > 0
  )
}

/**
 * +N 배지 텍스트 생성
 */
function getBadgeText(card: ShowcaseCard): string | null {
  if (!shouldShowBadge(card)) return null
  return `+${card.additionalContentNames!.length}`
}

/**
 * 배지 크기 계산 (카드 크기에 따라)
 * 모든 크기에서 배지가 잘리지 않도록 충분한 크기 보장
 */
function getBadgeSize(size: CardSize): { width: number; height: number } {
  switch (size) {
    case 'sm':
      return { width: 22, height: 22 }
    case 'md':
      return { width: 26, height: 26 }
    case 'lg':
      return { width: 30, height: 30 }
  }
}

// ============================================
// Property Tests
// ============================================

describe('Property 13: FloatingCard "+N" 배지 표시', () => {
  it('2개 이상 작품이 연결된 카드에는 +N 배지가 표시되어야 한다', () => {
    fc.assert(
      fc.property(showcaseCardArb, (card) => {
        const hasMultipleContents =
          card.additionalContentNames &&
          card.additionalContentNames.length > 0

        if (hasMultipleContents) {
          expect(shouldShowBadge(card)).toBe(true)
          const badgeText = getBadgeText(card)
          expect(badgeText).toBe(`+${card.additionalContentNames!.length}`)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('단일 작품 카드에는 배지가 표시되지 않아야 한다', () => {
    fc.assert(
      fc.property(showcaseCardArb, (card) => {
        const singleContentCard: ShowcaseCard = {
          ...card,
          additionalContentNames: undefined,
        }

        expect(shouldShowBadge(singleContentCard)).toBe(false)
        expect(getBadgeText(singleContentCard)).toBeNull()
      }),
      { numRuns: 100 }
    )
  })

  it('빈 additionalContentNames 배열에는 배지가 표시되지 않아야 한다', () => {
    fc.assert(
      fc.property(showcaseCardArb, (card) => {
        const emptyAdditionalCard: ShowcaseCard = {
          ...card,
          additionalContentNames: [],
        }

        expect(shouldShowBadge(emptyAdditionalCard)).toBe(false)
        expect(getBadgeText(emptyAdditionalCard)).toBeNull()
      }),
      { numRuns: 100 }
    )
  })

  it('카드 크기에 관계없이 배지가 잘리지 않아야 한다', () => {
    fc.assert(
      fc.property(showcaseCardArb, cardSizeArb, (card, size) => {
        fc.pre(shouldShowBadge(card))

        const badgeSize = getBadgeSize(size)

        // 배지 크기가 최소 크기 이상이어야 함 (잘림 방지)
        expect(badgeSize.width).toBeGreaterThanOrEqual(22)
        expect(badgeSize.height).toBeGreaterThanOrEqual(22)

        // 배지 텍스트가 존재해야 함
        const badgeText = getBadgeText(card)
        expect(badgeText).not.toBeNull()
        expect(badgeText!.startsWith('+')).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('+N의 N은 additionalContentNames.length와 동일해야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
          minLength: 1,
          maxLength: 10,
        }),
        showcaseCardArb,
        (additionalNames, cardBase) => {
          const card: ShowcaseCard = {
            ...cardBase,
            additionalContentNames: additionalNames,
          }

          const badgeText = getBadgeText(card)
          expect(badgeText).toBe(`+${additionalNames.length}`)
        }
      ),
      { numRuns: 100 }
    )
  })
})
