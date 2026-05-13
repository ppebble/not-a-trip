import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { SpotCategory } from '@/types'
import { REAL_SPOT_PHOTO_FALLBACKS } from '@/components/landing/data/realSpotPhotoFallbacks'

// ============================================
// 응답 타입
// ============================================

export interface ShowcaseSpotItem {
  id: string
  name: string
  category: SpotCategory
  thumbnailUrl: string // 항상 non-null, non-empty (필터링 후)
}

// ============================================
// 내부 DB 문서 타입
// ============================================

interface SpotDocument {
  id: string
  name: string
  photos: string[]
  category?: SpotCategory
}

// ============================================
// 유틸 함수
// ============================================

/**
 * 플레이스홀더 사진 여부 판별
 * picsum.photos/seed/ 또는 /icons/ 경로인 경우 플레이스홀더로 간주
 */
export function isPlaceholderPhoto(url?: string | null): boolean {
  if (!url) return true
  return url.includes('picsum.photos/seed/') || url.startsWith('/icons/')
}

/**
 * 스팟의 썸네일 URL 해결
 * 우선순위: 실제 사진 → REAL_SPOT_PHOTO_FALLBACKS → null
 */
export function resolveThumbnailUrl(
  spotId: string,
  photoUrl?: string | null
): string | null {
  // 1순위: photos[0]이 실제 사진이면 그대로 반환
  if (photoUrl && !isPlaceholderPhoto(photoUrl)) {
    return photoUrl
  }
  // 2순위: REAL_SPOT_PHOTO_FALLBACKS에 ID가 있으면 Wikimedia URL 반환
  const fallback = REAL_SPOT_PHOTO_FALLBACKS[spotId]
  if (fallback?.imageUrl) {
    return fallback.imageUrl
  }
  // 3순위: null 반환
  return null
}

// ============================================
// 카테고리 목록
// ============================================

const SHOWCASE_CATEGORIES: SpotCategory[] = [
  'animation',
  'sports',
  'movie_drama',
  'music',
  'game',
  'other',
]

// 카테고리당 조회 수 (필터링 후 4개 보장을 위해 여유있게 조회)
const FETCH_LIMIT = 8
// 카테고리당 최대 반환 수
const MAX_PER_CATEGORY = 4

// ============================================
// GET /api/spots/showcase
// ============================================

/**
 * GET /api/spots/showcase
 * 카테고리별 대표 스팟을 반환한다.
 * - 6개 카테고리를 Promise.all로 병렬 조회
 * - 카테고리당 최대 4개 반환
 * - 실제 사진 스팟 우선 정렬 ($cond 활용)
 * - thumbnailUrl이 null/empty인 스팟 제외
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 5.1, 5.2, 5.3, 5.4, 5.5
 */
export async function GET(): Promise<NextResponse> {
  try {
    const collection = await getCollection<SpotDocument>('spots')

    // 6개 카테고리를 병렬 조회
    const categoryResults = await Promise.all(
      SHOWCASE_CATEGORIES.map(async (category) => {
        // 실제 사진 스팟 우선 정렬: $cond로 정렬 필드 생성
        // photos[0]이 플레이스홀더가 아닌 경우 0 (우선), 그 외 1 (후순위)
        const spots = await collection
          .aggregate<SpotDocument>([
            {
              $match: {
                category,
                'photos.0': { $exists: true, $ne: '' },
              },
            },
            {
              $addFields: {
                _photoQuality: {
                  $cond: {
                    if: {
                      $and: [
                        {
                          $not: [
                            {
                              $regexMatch: {
                                input: { $arrayElemAt: ['$photos', 0] },
                                regex: 'picsum\\.photos/seed/',
                              },
                            },
                          ],
                        },
                        {
                          $not: [
                            {
                              $regexMatch: {
                                input: { $arrayElemAt: ['$photos', 0] },
                                regex: '^/icons/',
                              },
                            },
                          ],
                        },
                      ],
                    },
                    then: 0, // 실제 사진: 우선순위 높음
                    else: 1, // 플레이스홀더: 우선순위 낮음
                  },
                },
              },
            },
            { $sort: { _photoQuality: 1 } },
            { $limit: FETCH_LIMIT },
            { $project: { _photoQuality: 0 } },
          ])
          .toArray()

        return spots
      })
    )

    // 결과 변환: resolveThumbnailUrl 적용 후 null 제외, 최대 4개 슬라이스
    const showcaseItems: ShowcaseSpotItem[] = []

    for (const spots of categoryResults) {
      const categoryItems: ShowcaseSpotItem[] = []

      for (const spot of spots) {
        if (!spot.category) continue

        const thumbnailUrl = resolveThumbnailUrl(spot.id, spot.photos?.[0])
        if (!thumbnailUrl) continue

        categoryItems.push({
          id: spot.id,
          name: spot.name,
          category: spot.category,
          thumbnailUrl,
        })

        if (categoryItems.length >= MAX_PER_CATEGORY) break
      }

      showcaseItems.push(...categoryItems)
    }

    return NextResponse.json(showcaseItems)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[GET /api/spots/showcase] DB 조회 실패:', error)
    return NextResponse.json(
      { error: 'Failed to fetch showcase spots' },
      { status: 500 }
    )
  }
}
