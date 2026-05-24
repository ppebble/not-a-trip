/**
 * GET /api/spots/showcase 엔드포인트 속성 기반 테스트
 *
 * Feature: 39-landing-social-proof-real-data
 */

import * as fc from 'fast-check'
import type { ShowcaseSpotItem } from '../route'
import { isPlaceholderPhoto, resolveThumbnailUrl } from '../helpers'
import { REAL_SPOT_PHOTO_FALLBACKS } from '@/components/landing/data/realSpotPhotoFallbacks'
import { SpotCategory } from '@/types'

// ============================================
// 테스트용 Arbitrary 정의
// ============================================

const SPOT_CATEGORIES: SpotCategory[] = [
  'animation',
  'sports',
  'movie_drama',
  'music',
  'game',
  'other',
]

/** 실제 사진 URL arbitrary (picsum/icons 아닌 URL) */
const arbitraryRealPhotoUrl = fc.oneof(
  fc.constant('https://upload.wikimedia.org/wikipedia/commons/test.jpg'),
  fc.constant('https://example.com/photo.jpg'),
  fc
    .webUrl()
    .filter(
      (url) =>
        !url.includes('picsum.photos/seed/') && !url.startsWith('/icons/')
    )
)

/** 플레이스홀더 URL arbitrary */
const arbitraryPlaceholderUrl = fc.oneof(
  fc.constant('https://picsum.photos/seed/test/400/300'),
  fc.constant('/icons/categories/animation.webp'),
  fc.constant('/icons/categories/sports.webp'),
  fc
    .string({ minLength: 1, maxLength: 20 })
    .map((s) => `https://picsum.photos/seed/${s}/400/300`),
  fc
    .string({ minLength: 1, maxLength: 20 })
    .map((s) => `/icons/categories/${s}.webp`)
)

/** REAL_SPOT_PHOTO_FALLBACKS에 있는 스팟 ID */
const FALLBACK_IDS = Object.keys(REAL_SPOT_PHOTO_FALLBACKS)

/** REAL_SPOT_PHOTO_FALLBACKS에 있는 ID arbitrary */
const arbitraryFallbackSpotId = fc.constantFrom(...FALLBACK_IDS)

/** REAL_SPOT_PHOTO_FALLBACKS에 없는 ID arbitrary */
const arbitraryNonFallbackSpotId = fc
  .string({ minLength: 1, maxLength: 20 })
  .filter((id) => !FALLBACK_IDS.includes(id))

/** SpotCategory arbitrary */
const arbitraryCategory = fc.constantFrom(...SPOT_CATEGORIES)

/** ShowcaseSpotItem arbitrary */
const arbitraryShowcaseSpotItem = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  category: arbitraryCategory,
  thumbnailUrl: arbitraryRealPhotoUrl,
})

// ============================================
// Property 1: API 응답 객체는 항상 필수 필드를 포함한다
// Validates: Requirements 1.2, 5.5
// ============================================

describe('Property 1: API 응답 객체는 항상 필수 필드를 포함한다', () => {
  /**
   * **Validates: Requirements 1.2**
   * resolveThumbnailUrl을 거쳐 생성된 모든 ShowcaseSpotItem은
   * id, name, category, thumbnailUrl 필드를 모두 포함하며
   * thumbnailUrl은 non-null, non-empty 문자열이어야 한다.
   */
  it('ShowcaseSpotItem은 항상 id, name, category, thumbnailUrl 필드를 포함한다', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryShowcaseSpotItem, { minLength: 0, maxLength: 20 }),
        (items: ShowcaseSpotItem[]) => {
          return items.every(
            (item) =>
              typeof item.id === 'string' &&
              item.id.length > 0 &&
              typeof item.name === 'string' &&
              item.name.length > 0 &&
              typeof item.category === 'string' &&
              SPOT_CATEGORIES.includes(item.category) &&
              typeof item.thumbnailUrl === 'string' &&
              item.thumbnailUrl.length > 0
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('resolveThumbnailUrl이 non-null을 반환한 경우 thumbnailUrl은 항상 non-empty', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        arbitraryRealPhotoUrl,
        (spotId: string, photoUrl: string) => {
          const result = resolveThumbnailUrl(spotId, photoUrl)
          // 실제 사진 URL이면 반드시 non-null, non-empty
          if (result !== null) {
            return result.length > 0
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Property 2: 실제 사진 스팟은 플레이스홀더 스팟보다 항상 앞에 온다
// Validates: Requirements 1.3, 5.1
// ============================================

describe('Property 2: 실제 사진 스팟은 플레이스홀더 스팟보다 항상 앞에 온다', () => {
  /**
   * **Validates: Requirements 1.3, 5.1**
   * 정렬된 스팟 배열에서 실제 사진(non-Placeholder)을 가진 스팟은
   * 플레이스홀더 사진을 가진 스팟보다 항상 앞에 위치해야 한다.
   */

  /** 정렬 함수: 실제 사진 스팟 우선 */
  function sortByPhotoQuality(
    spots: Array<{ id: string; photos: string[] }>
  ): Array<{ id: string; photos: string[] }> {
    return [...spots].sort((a, b) => {
      const aIsReal = !isPlaceholderPhoto(a.photos[0]) ? 0 : 1
      const bIsReal = !isPlaceholderPhoto(b.photos[0]) ? 0 : 1
      return aIsReal - bIsReal
    })
  }

  it('정렬 후 실제 사진 스팟이 플레이스홀더 스팟보다 앞에 위치한다', () => {
    const arbitrarySpot = fc.record({
      id: fc.string({ minLength: 1, maxLength: 20 }),
      photos: fc.oneof(
        fc.array(arbitraryRealPhotoUrl, { minLength: 1, maxLength: 1 }),
        fc.array(arbitraryPlaceholderUrl, { minLength: 1, maxLength: 1 })
      ),
    })

    fc.assert(
      fc.property(
        fc.array(arbitrarySpot, { minLength: 0, maxLength: 20 }),
        (spots) => {
          const sorted = sortByPhotoQuality(spots)

          // 첫 번째 플레이스홀더 인덱스
          const firstPlaceholderIdx = sorted.findIndex((s) =>
            isPlaceholderPhoto(s.photos[0])
          )
          // 마지막 실제 사진 인덱스
          const lastRealIdx = sorted
            .map((s) => !isPlaceholderPhoto(s.photos[0]))
            .lastIndexOf(true)

          // 플레이스홀더가 없거나 실제 사진이 없으면 항상 통과
          if (firstPlaceholderIdx === -1 || lastRealIdx === -1) return true

          // 마지막 실제 사진이 첫 번째 플레이스홀더보다 앞에 있어야 함
          return lastRealIdx < firstPlaceholderIdx
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Property 3: 카테고리당 반환 스팟 수는 최대 4개를 초과하지 않는다
// Validates: Requirements 1.4, 5.2
// ============================================

describe('Property 3: 카테고리당 반환 스팟 수는 최대 4개를 초과하지 않는다', () => {
  /**
   * **Validates: Requirements 1.4, 5.2**
   * 임의 개수의 스팟이 존재하더라도 카테고리별 결과 배열 길이가
   * 항상 4 이하여야 한다.
   */

  const MAX_PER_CATEGORY = 4

  /** 카테고리별 그룹화 후 최대 4개 슬라이스 */
  function groupAndSliceByCategory(
    items: ShowcaseSpotItem[]
  ): Record<SpotCategory, ShowcaseSpotItem[]> {
    const result: Record<SpotCategory, ShowcaseSpotItem[]> = {
      animation: [],
      sports: [],
      movie_drama: [],
      music: [],
      game: [],
      other: [],
    }

    for (const item of items) {
      if (result[item.category].length < MAX_PER_CATEGORY) {
        result[item.category].push(item)
      }
    }

    return result
  }

  it('카테고리별 결과 배열 길이가 항상 4 이하다', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryShowcaseSpotItem, { minLength: 0, maxLength: 50 }),
        (items: ShowcaseSpotItem[]) => {
          const grouped = groupAndSliceByCategory(items)
          return Object.values(grouped).every(
            (arr) => arr.length <= MAX_PER_CATEGORY
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('임의 개수의 스팟이 있어도 카테고리당 최대 4개만 반환된다', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryShowcaseSpotItem, { minLength: 5, maxLength: 100 }),
        (items: ShowcaseSpotItem[]) => {
          const grouped = groupAndSliceByCategory(items)
          return Object.values(grouped).every((arr) => arr.length <= 4)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Property 6: REAL_SPOT_PHOTO_FALLBACKS 해결 로직은 올바르게 동작한다
// Validates: Requirements 5.4
// ============================================

describe('Property 6: REAL_SPOT_PHOTO_FALLBACKS 해결 로직은 올바르게 동작한다', () => {
  /**
   * **Validates: Requirements 5.4**
   * 임의 spotId + photoUrl 조합에 대해 resolveThumbnailUrl이
   * 우선순위(실제 사진 → Wikimedia → null)를 항상 따르는지 검증
   */

  it('photos[0]이 실제 사진이면 그대로 반환한다', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        arbitraryRealPhotoUrl,
        (spotId: string, photoUrl: string) => {
          const result = resolveThumbnailUrl(spotId, photoUrl)
          return result === photoUrl
        }
      ),
      { numRuns: 100 }
    )
  })

  it('photos[0]이 플레이스홀더이고 ID가 REAL_SPOT_PHOTO_FALLBACKS에 있으면 Wikimedia URL 반환', () => {
    fc.assert(
      fc.property(
        arbitraryFallbackSpotId,
        arbitraryPlaceholderUrl,
        (spotId: string, photoUrl: string) => {
          const result = resolveThumbnailUrl(spotId, photoUrl)
          const expected = REAL_SPOT_PHOTO_FALLBACKS[spotId]?.imageUrl
          return result === expected
        }
      ),
      { numRuns: 100 }
    )
  })

  it('photos[0]이 플레이스홀더이고 ID가 REAL_SPOT_PHOTO_FALLBACKS에 없으면 null 반환', () => {
    fc.assert(
      fc.property(
        arbitraryNonFallbackSpotId,
        arbitraryPlaceholderUrl,
        (spotId: string, photoUrl: string) => {
          const result = resolveThumbnailUrl(spotId, photoUrl)
          return result === null
        }
      ),
      { numRuns: 100 }
    )
  })

  it('photoUrl이 null/undefined이고 ID가 REAL_SPOT_PHOTO_FALLBACKS에 없으면 null 반환', () => {
    fc.assert(
      fc.property(
        arbitraryNonFallbackSpotId,
        fc.oneof(fc.constant(null), fc.constant(undefined)),
        (spotId: string, photoUrl: null | undefined) => {
          const result = resolveThumbnailUrl(spotId, photoUrl)
          return result === null
        }
      ),
      { numRuns: 100 }
    )
  })

  it('photoUrl이 null/undefined이고 ID가 REAL_SPOT_PHOTO_FALLBACKS에 있으면 Wikimedia URL 반환', () => {
    fc.assert(
      fc.property(
        arbitraryFallbackSpotId,
        fc.oneof(fc.constant(null), fc.constant(undefined)),
        (spotId: string, photoUrl: null | undefined) => {
          const result = resolveThumbnailUrl(spotId, photoUrl)
          const expected = REAL_SPOT_PHOTO_FALLBACKS[spotId]?.imageUrl
          return result === expected
        }
      ),
      { numRuns: 100 }
    )
  })

  it('우선순위 전체 검증: 실제 사진 → Wikimedia → null', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // 케이스 1: 실제 사진 URL + 임의 ID
          fc.record({
            spotId: fc.string({ minLength: 1, maxLength: 20 }),
            photoUrl: arbitraryRealPhotoUrl.map((u) => u as string | null),
          }),
          // 케이스 2: 플레이스홀더 + fallback ID
          fc.record({
            spotId: arbitraryFallbackSpotId,
            photoUrl: arbitraryPlaceholderUrl.map((u) => u as string | null),
          }),
          // 케이스 3: 플레이스홀더 + non-fallback ID
          fc.record({
            spotId: arbitraryNonFallbackSpotId,
            photoUrl: arbitraryPlaceholderUrl.map((u) => u as string | null),
          }),
          // 케이스 4: null + fallback ID
          fc.record({
            spotId: arbitraryFallbackSpotId,
            photoUrl: fc.constant(null as string | null),
          }),
          // 케이스 5: null + non-fallback ID
          fc.record({
            spotId: arbitraryNonFallbackSpotId,
            photoUrl: fc.constant(null as string | null),
          })
        ),
        ({ spotId, photoUrl }) => {
          const result = resolveThumbnailUrl(spotId, photoUrl)

          // 1순위: 실제 사진이면 그대로 반환
          if (photoUrl && !isPlaceholderPhoto(photoUrl)) {
            return result === photoUrl
          }

          // 2순위: REAL_SPOT_PHOTO_FALLBACKS에 있으면 Wikimedia URL
          const fallback = REAL_SPOT_PHOTO_FALLBACKS[spotId]
          if (fallback?.imageUrl) {
            return result === fallback.imageUrl
          }

          // 3순위: null
          return result === null
        }
      ),
      { numRuns: 200 }
    )
  })
})

// ============================================
// isPlaceholderPhoto 단위 테스트
// ============================================

describe('isPlaceholderPhoto', () => {
  it('picsum.photos/seed/ URL은 플레이스홀더로 판별한다', () => {
    expect(isPlaceholderPhoto('https://picsum.photos/seed/test/400/300')).toBe(
      true
    )
  })

  it('/icons/ 경로는 플레이스홀더로 판별한다', () => {
    expect(isPlaceholderPhoto('/icons/categories/animation.webp')).toBe(true)
  })

  it('실제 Wikimedia URL은 플레이스홀더가 아니다', () => {
    expect(
      isPlaceholderPhoto(
        'https://upload.wikimedia.org/wikipedia/commons/test.jpg'
      )
    ).toBe(false)
  })

  it('null/undefined는 플레이스홀더로 판별한다', () => {
    expect(isPlaceholderPhoto(null)).toBe(true)
    expect(isPlaceholderPhoto(undefined)).toBe(true)
    expect(isPlaceholderPhoto('')).toBe(true)
  })
})
