/**
 * fetchProofImages 함수 속성 기반 테스트 및 단위 테스트
 *
 * Feature: 39-landing-social-proof-real-data
 */

import * as fc from 'fast-check'
import { isPlaceholderPhoto } from '@/app/api/spots/showcase/helpers'
import type { ShowcaseSpotItem } from '@/app/api/spots/showcase/route'
import type { SpotCategory } from '@/types/spot'

// ============================================
// 테스트 대상 함수 (내부 로직 추출)
// fetchProofImages는 fetch를 사용하므로 변환 로직을 별도로 테스트
// ============================================

const SPOT_CATEGORIES: SpotCategory[] = [
  'animation',
  'sports',
  'movie_drama',
  'music',
  'game',
  'other',
]

/**
 * ShowcaseSpotItem[] → Record<SpotCategory, string[]> 변환 로직
 * fetchProofImages 내부 로직과 동일
 */
function transformToProofImages(
  spots: ShowcaseSpotItem[]
): Record<SpotCategory, string[]> {
  const result: Record<SpotCategory, string[]> = {
    animation: [],
    sports: [],
    movie_drama: [],
    music: [],
    game: [],
    other: [],
  }

  for (const spot of spots) {
    if (
      spot.category &&
      spot.thumbnailUrl &&
      !isPlaceholderPhoto(spot.thumbnailUrl)
    ) {
      result[spot.category].push(spot.thumbnailUrl)
    }
  }

  return result
}

// ============================================
// Arbitrary 정의
// ============================================

const arbitraryCategory = fc.constantFrom(...SPOT_CATEGORIES)

/** 실제 사진 URL arbitrary */
const arbitraryRealPhotoUrl = fc.oneof(
  fc.constant('https://example.com/photo.jpg'),
  fc.constant('https://cdn.not-a-trip.example/assets/photo.webp'),
  fc.constant('https://storage.googleapis.com/bucket/photo.jpg'),
  fc
    .webUrl()
    .filter(
      (url) =>
        !url.includes('picsum.photos/seed/') &&
        !url.startsWith('/icons/') &&
        !url.includes('upload.wikimedia.org') &&
        !url.includes('commons.wikimedia.org')
    )
)

/** 플레이스홀더 URL arbitrary */
const arbitraryPlaceholderUrl = fc.oneof(
  fc.constant('https://picsum.photos/seed/test/400/300'),
  fc.constant('https://upload.wikimedia.org/wikipedia/commons/test.jpg'),
  fc.constant('/icons/categories/animation.webp'),
  fc.constant('/icons/categories/sports.webp'),
  fc
    .string({ minLength: 1, maxLength: 20 })
    .map((s) => `https://picsum.photos/seed/${s}/400/300`),
  fc
    .string({ minLength: 1, maxLength: 20 })
    .map((s) => `/icons/categories/${s}.webp`)
)

/** ShowcaseSpotItem arbitrary (실제 사진 URL 사용) */
const arbitraryShowcaseSpotItemReal = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  category: arbitraryCategory,
  thumbnailUrl: arbitraryRealPhotoUrl,
})

/** ShowcaseSpotItem arbitrary (플레이스홀더 URL 사용) */
const arbitraryShowcaseSpotItemPlaceholder = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  category: arbitraryCategory,
  thumbnailUrl: arbitraryPlaceholderUrl,
})

/** ShowcaseSpotItem arbitrary (실제/플레이스홀더 혼합) */
const arbitraryShowcaseSpotItemMixed = fc.oneof(
  arbitraryShowcaseSpotItemReal,
  arbitraryShowcaseSpotItemPlaceholder
)

// ============================================
// Property 4: fetchProofImages 변환 결과는 항상 올바른 Record 형태다
// Validates: Requirements 2.2
// ============================================

describe('Property 4: fetchProofImages 변환 결과는 항상 올바른 Record 형태다', () => {
  /**
   * **Validates: Requirements 2.2**
   * 임의 ShowcaseSpotItem[] 배열에 대해 변환 결과가 항상
   * 6개 카테고리 키를 모두 포함하는 Record<SpotCategory, string[]> 형태여야 하며,
   * 각 값은 string 배열이어야 한다.
   */

  it('변환 결과는 항상 6개 카테고리 키를 모두 포함한다', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryShowcaseSpotItemReal, {
          minLength: 0,
          maxLength: 30,
        }),
        (items: ShowcaseSpotItem[]) => {
          const result = transformToProofImages(items)

          // 6개 카테고리 키가 모두 존재해야 함
          return SPOT_CATEGORIES.every((cat) => cat in result)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('변환 결과의 각 값은 string 배열이다', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryShowcaseSpotItemReal, {
          minLength: 0,
          maxLength: 30,
        }),
        (items: ShowcaseSpotItem[]) => {
          const result = transformToProofImages(items)

          return Object.values(result).every(
            (arr) =>
              Array.isArray(arr) && arr.every((url) => typeof url === 'string')
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('빈 배열 입력에도 6개 카테고리 키를 포함한 빈 Record를 반환한다', () => {
    fc.assert(
      fc.property(
        fc.constant([] as ShowcaseSpotItem[]),
        (items: ShowcaseSpotItem[]) => {
          const result = transformToProofImages(items)

          return (
            SPOT_CATEGORIES.every((cat) => cat in result) &&
            Object.values(result).every((arr) => arr.length === 0)
          )
        }
      ),
      { numRuns: 10 }
    )
  })

  it('스팟의 thumbnailUrl이 올바른 카테고리 배열에 추가된다', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryShowcaseSpotItemReal, {
          minLength: 1,
          maxLength: 20,
        }),
        (items: ShowcaseSpotItem[]) => {
          const result = transformToProofImages(items)

          // 각 스팟의 thumbnailUrl이 해당 카테고리 배열에 포함되어야 함
          return items.every((item) => {
            if (!isPlaceholderPhoto(item.thumbnailUrl)) {
              return result[item.category].includes(item.thumbnailUrl)
            }
            return true
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Property 5: 플레이스홀더 URL은 fetchProofImages 결과에 포함되지 않는다
// Validates: Requirements 2.5, 4.4
// ============================================

describe('Property 5: 플레이스홀더 URL은 fetchProofImages 결과에 포함되지 않는다', () => {
  /**
   * **Validates: Requirements 2.5, 4.4**
   * 플레이스홀더 URL이 포함된 임의 API 응답에 대해
   * 변환 결과에 플레이스홀더 URL이 없어야 한다.
   */

  it('플레이스홀더 URL만 있는 응답에서 모든 카테고리 배열이 비어있다', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryShowcaseSpotItemPlaceholder, {
          minLength: 1,
          maxLength: 20,
        }),
        (items: ShowcaseSpotItem[]) => {
          const result = transformToProofImages(items)

          // 플레이스홀더만 있으면 모든 배열이 비어야 함
          return Object.values(result).every((arr) => arr.length === 0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('혼합 응답에서 플레이스홀더 URL이 결과에 포함되지 않는다', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryShowcaseSpotItemMixed, {
          minLength: 0,
          maxLength: 30,
        }),
        (items: ShowcaseSpotItem[]) => {
          const result = transformToProofImages(items)

          // 결과의 모든 URL이 플레이스홀더가 아니어야 함
          return Object.values(result)
            .flat()
            .every((url) => !isPlaceholderPhoto(url))
        }
      ),
      { numRuns: 100 }
    )
  })

  it('picsum.photos/seed/ URL은 결과에 포함되지 않는다', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryShowcaseSpotItemMixed, {
          minLength: 0,
          maxLength: 30,
        }),
        (items: ShowcaseSpotItem[]) => {
          const result = transformToProofImages(items)

          return Object.values(result)
            .flat()
            .every((url) => !url.includes('picsum.photos/seed/'))
        }
      ),
      { numRuns: 100 }
    )
  })

  it('/icons/ 경로 URL은 결과에 포함되지 않는다', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryShowcaseSpotItemMixed, {
          minLength: 0,
          maxLength: 30,
        }),
        (items: ShowcaseSpotItem[]) => {
          const result = transformToProofImages(items)

          return Object.values(result)
            .flat()
            .every((url) => !url.startsWith('/icons/'))
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// 단위 테스트: fetchProofImages 함수 동작 검증
// Requirements: 2.1, 2.4, 2.6
// ============================================

describe('단위 테스트: fetchProofImages 함수 동작 검증', () => {
  const originalFetch = global.fetch
  const originalConsoleWarn = console.warn

  beforeEach(() => {
    jest.resetAllMocks()
    console.warn = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    console.warn = originalConsoleWarn
    delete process.env.NEXTAUTH_URL
  })

  /**
   * 정상 API 응답 → 올바른 Record 변환 확인
   * Requirements: 2.1, 2.2
   */
  it('정상 API 응답을 올바른 Record<SpotCategory, string[]>로 변환한다', async () => {
    const mockSpots: ShowcaseSpotItem[] = [
      {
        id: 'spot-1',
        name: '스팟 1',
        category: 'animation',
        thumbnailUrl: 'https://example.com/photo1.jpg',
      },
      {
        id: 'spot-2',
        name: '스팟 2',
        category: 'sports',
        thumbnailUrl: 'https://example.com/photo2.jpg',
      },
      {
        id: 'spot-3',
        name: '스팟 3',
        category: 'animation',
        thumbnailUrl: 'https://example.com/photo3.jpg',
      },
    ]

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSpots,
    } as Response)

    const { fetchProofImages } = await import('../fetchShowcaseSpots')
    const result = await fetchProofImages()

    expect(result.animation).toEqual([
      'https://example.com/photo1.jpg',
      'https://example.com/photo3.jpg',
    ])
    expect(result.sports).toEqual(['https://example.com/photo2.jpg'])
    expect(result.movie_drama).toEqual([])
    expect(result.music).toEqual([])
    expect(result.game).toEqual([])
    expect(result.other).toEqual([])
  })

  /**
   * API 실패(non-2xx) → iconFallback 반환 + console.warn 호출 확인
   * Requirements: 2.4, 4.1, 4.5
   */
  it('API가 non-2xx 응답을 반환하면 iconFallback을 반환하고 console.warn을 호출한다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    const { fetchProofImages } = await import('../fetchShowcaseSpots')
    const result = await fetchProofImages()

    // iconFallback 반환 확인
    expect(result.animation).toEqual(['/icons/categories/animation.webp'])
    expect(result.sports).toEqual(['/icons/categories/sports.webp'])
    expect(result.movie_drama).toEqual(['/icons/categories/movie_drama.webp'])
    expect(result.music).toEqual(['/icons/categories/music.webp'])
    expect(result.game).toEqual(['/icons/categories/game.webp'])
    expect(result.other).toEqual(['/icons/categories/other.webp'])

    // console.warn 호출 확인
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[fetchProofImages]'),
      expect.any(Error)
    )
  })

  /**
   * 네트워크 오류 → iconFallback 반환 + console.warn 호출 확인
   * Requirements: 2.4, 4.1, 4.5
   */
  it('네트워크 오류 발생 시 iconFallback을 반환하고 console.warn을 호출한다', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

    const { fetchProofImages } = await import('../fetchShowcaseSpots')
    const result = await fetchProofImages()

    // iconFallback 반환 확인
    expect(result.animation).toEqual(['/icons/categories/animation.webp'])
    expect(result.sports).toEqual(['/icons/categories/sports.webp'])

    // console.warn 호출 확인
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[fetchProofImages]'),
      expect.any(Error)
    )
  })

  /**
   * NEXTAUTH_URL 환경 변수 → 올바른 base URL 사용 확인
   * Requirements: 2.6
   */
  it('NEXTAUTH_URL 환경 변수가 설정된 경우 해당 URL을 base URL로 사용한다', async () => {
    process.env.NEXTAUTH_URL = 'https://not-a-trip.vercel.app'

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)

    const { fetchProofImages } = await import('../fetchShowcaseSpots')
    await fetchProofImages()

    expect(global.fetch).toHaveBeenCalledWith(
      'https://not-a-trip.vercel.app/api/spots/showcase',
      expect.objectContaining({ next: { revalidate: 3600 } })
    )
  })

  /**
   * NEXTAUTH_URL 미설정 → localhost:3000 사용 확인
   * Requirements: 2.6
   */
  it('NEXTAUTH_URL이 없으면 http://localhost:3000을 base URL로 사용한다', async () => {
    delete process.env.NEXTAUTH_URL

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)

    const { fetchProofImages } = await import('../fetchShowcaseSpots')
    await fetchProofImages()

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/spots/showcase',
      expect.objectContaining({ next: { revalidate: 3600 } })
    )
  })

  /**
   * 플레이스홀더 URL 필터링 확인
   * Requirements: 2.5
   */
  it('API 응답에 플레이스홀더 URL이 포함되어 있으면 필터링한다', async () => {
    const mockSpots: ShowcaseSpotItem[] = [
      {
        id: 'spot-1',
        name: '스팟 1',
        category: 'animation',
        thumbnailUrl: 'https://picsum.photos/seed/test/400/300',
      },
      {
        id: 'spot-2',
        name: '스팟 2',
        category: 'animation',
        thumbnailUrl: 'https://example.com/real-photo.jpg',
      },
      {
        id: 'spot-3',
        name: '스팟 3',
        category: 'sports',
        thumbnailUrl: '/icons/categories/sports.webp',
      },
    ]

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSpots,
    } as Response)

    const { fetchProofImages } = await import('../fetchShowcaseSpots')
    const result = await fetchProofImages()

    // 플레이스홀더 URL은 제외되어야 함
    expect(result.animation).toEqual(['https://example.com/real-photo.jpg'])
    expect(result.sports).toEqual([])
  })

  /**
   * 1시간 캐시 설정 확인
   * Requirements: 2.1
   */
  it('fetch 호출 시 next.revalidate: 3600 옵션을 사용한다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)

    const { fetchProofImages } = await import('../fetchShowcaseSpots')
    await fetchProofImages()

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        next: { revalidate: 3600 },
      })
    )
  })
})
