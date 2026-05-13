/**
 * SocialProofSection 속성 기반 테스트
 *
 * Feature: 39-landing-social-proof-real-data
 * Property 7: 라운드로빈 배분은 카테고리 내 카드 순서를 따른다
 */

import * as fc from 'fast-check'
import { getExtendedData } from '../SocialProofSection'
import type { SpotCategory } from '@/types/spot'

// ============================================
// 상수 정의
// ============================================

const CLONE_COUNT = 4

// ============================================
// Arbitrary 정의
// ============================================

/** 실제 사진 URL arbitrary (플레이스홀더 아닌 URL) */
const arbitraryRealPhotoUrl = fc.oneof(
  fc.constant('https://upload.wikimedia.org/wikipedia/commons/test.jpg'),
  fc.constant('https://example.com/photo.jpg'),
  fc.constant('https://storage.googleapis.com/bucket/photo.jpg'),
  fc
    .webUrl()
    .filter(
      (url) =>
        !url.includes('picsum.photos/seed/') && !url.startsWith('/icons/')
    )
)

/** 카테고리별 이미지 배열 arbitrary (M > 0 보장) */
const arbitraryProofImages = fc.record({
  animation: fc.array(arbitraryRealPhotoUrl, { minLength: 1, maxLength: 5 }),
  sports: fc.array(arbitraryRealPhotoUrl, { minLength: 1, maxLength: 5 }),
  movie_drama: fc.array(arbitraryRealPhotoUrl, { minLength: 1, maxLength: 5 }),
  music: fc.array(arbitraryRealPhotoUrl, { minLength: 1, maxLength: 5 }),
  game: fc.array(arbitraryRealPhotoUrl, { minLength: 1, maxLength: 5 }),
  other: fc.array(arbitraryRealPhotoUrl, { minLength: 1, maxLength: 5 }),
})

// ============================================
// Property 7: 라운드로빈 배분은 카테고리 내 카드 순서를 따른다
// Validates: Requirements 3.4
// ============================================

describe('Property 7: 라운드로빈 배분은 카테고리 내 카드 순서를 따른다', () => {
  /**
   * **Validates: Requirements 3.4**
   *
   * 임의 N개 카드와 M개 이미지(M > 0)에 대해,
   * getExtendedData의 이미지 배분 결과에서
   * 같은 카테고리의 k번째 카드(checkin 제외)의 이미지는 images[k % M]이어야 한다.
   */

  it('같은 카테고리의 k번째 카드 이미지는 images[k % M]이다', () => {
    fc.assert(
      fc.property(
        arbitraryProofImages,
        (proofImages: Record<SpotCategory, string[]>) => {
          const { extended } = getExtendedData(proofImages, undefined)

          // 클론 제외한 원본 카드만 추출
          const originalCards = extended.slice(
            CLONE_COUNT,
            extended.length - CLONE_COUNT
          )

          // 카테고리별로 카드를 그룹화하여 순서 추적
          const categoryCounters: Record<string, number> = {}

          for (const card of originalCards) {
            // checkin 카드는 이미지 교체 대상이 아니므로 제외
            if (card.id.startsWith('checkin-')) continue

            const cat = card.categoryTag
            const images = proofImages[cat] || []

            if (images.length === 0) continue

            const k = categoryCounters[cat] ?? 0
            categoryCounters[cat] = k + 1

            const expectedImage = images[k % images.length]

            if (card.image !== expectedImage) {
              return false
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('이미지가 1개인 카테고리의 모든 카드는 동일한 이미지를 가진다', () => {
    fc.assert(
      fc.property(
        fc.record({
          animation: fc.array(arbitraryRealPhotoUrl, {
            minLength: 1,
            maxLength: 1,
          }),
          sports: fc.array(arbitraryRealPhotoUrl, {
            minLength: 1,
            maxLength: 1,
          }),
          movie_drama: fc.array(arbitraryRealPhotoUrl, {
            minLength: 1,
            maxLength: 1,
          }),
          music: fc.array(arbitraryRealPhotoUrl, {
            minLength: 1,
            maxLength: 1,
          }),
          game: fc.array(arbitraryRealPhotoUrl, {
            minLength: 1,
            maxLength: 1,
          }),
          other: fc.array(arbitraryRealPhotoUrl, {
            minLength: 1,
            maxLength: 1,
          }),
        }),
        (proofImages: Record<SpotCategory, string[]>) => {
          const { extended } = getExtendedData(proofImages, undefined)

          const originalCards = extended.slice(
            CLONE_COUNT,
            extended.length - CLONE_COUNT
          )

          // 카테고리별로 카드를 그룹화
          const cardsByCategory: Record<string, string[]> = {}
          for (const card of originalCards) {
            if (card.id.startsWith('checkin-')) continue
            const cat = card.categoryTag
            const images = proofImages[cat] || []
            if (images.length === 0) continue

            if (!cardsByCategory[cat]) cardsByCategory[cat] = []
            cardsByCategory[cat].push(card.image)
          }

          // 이미지가 1개인 카테고리의 모든 카드는 동일한 이미지여야 함
          for (const [cat, cardImages] of Object.entries(cardsByCategory)) {
            const images = proofImages[cat as SpotCategory] || []
            if (images.length === 1) {
              const allSame = cardImages.every((img) => img === images[0])
              if (!allSame) return false
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('이미지 배분은 카테고리 간 독립적으로 동작한다', () => {
    fc.assert(
      fc.property(
        arbitraryProofImages,
        (proofImages: Record<SpotCategory, string[]>) => {
          const { extended } = getExtendedData(proofImages, undefined)

          const originalCards = extended.slice(
            CLONE_COUNT,
            extended.length - CLONE_COUNT
          )

          // 카테고리별 카운터를 독립적으로 추적
          const counters: Record<string, number> = {}

          for (const card of originalCards) {
            if (card.id.startsWith('checkin-')) continue

            const cat = card.categoryTag
            const images = proofImages[cat] || []
            if (images.length === 0) continue

            const k = counters[cat] ?? 0
            counters[cat] = k + 1

            // 다른 카테고리의 카운터에 영향을 받지 않아야 함
            const expectedImage = images[k % images.length]
            if (card.image !== expectedImage) return false
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('이미지가 없는 카테고리의 카드는 원본 이미지를 유지한다', () => {
    // animation 카테고리에만 이미지 없음
    const proofImages: Record<SpotCategory, string[]> = {
      animation: [],
      sports: ['https://example.com/sport1.jpg'],
      movie_drama: ['https://example.com/movie1.jpg'],
      music: ['https://example.com/music1.jpg'],
      game: ['https://example.com/game1.jpg'],
      other: ['https://example.com/other1.jpg'],
    }

    const { extended } = getExtendedData(proofImages, undefined)

    const originalCards = extended.slice(
      CLONE_COUNT,
      extended.length - CLONE_COUNT
    )

    // animation 카테고리 카드는 원본 이미지를 유지해야 함
    const animationCards = originalCards.filter(
      (card) =>
        card.categoryTag === 'animation' && !card.id.startsWith('checkin-')
    )

    // 원본 proofData의 animation 이미지는 /icons/categories/animation.webp
    for (const card of animationCards) {
      expect(card.image).toBe('/icons/categories/animation.webp')
    }
  })

  it('라운드로빈 순환: M개 이미지에 대해 M+1번째 카드는 첫 번째 이미지를 사용한다', () => {
    // animation 카테고리에 정확히 2개 이미지
    const img1 = 'https://example.com/anim1.jpg'
    const img2 = 'https://example.com/anim2.jpg'

    const proofImages: Record<SpotCategory, string[]> = {
      animation: [img1, img2],
      sports: [],
      movie_drama: [],
      music: [],
      game: [],
      other: [],
    }

    const { extended } = getExtendedData(proofImages, undefined)

    const originalCards = extended.slice(
      CLONE_COUNT,
      extended.length - CLONE_COUNT
    )

    const animationCards = originalCards.filter(
      (card) =>
        card.categoryTag === 'animation' && !card.id.startsWith('checkin-')
    )

    // k=0 → img1, k=1 → img2, k=2 → img1 (순환), ...
    animationCards.forEach((card, k) => {
      const expectedImage = k % 2 === 0 ? img1 : img2
      expect(card.image).toBe(expectedImage)
    })
  })
})
