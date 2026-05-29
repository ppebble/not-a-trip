import { getCollection } from '@/lib/db'
import { COLLECTIONS } from '@/lib/db'
import type { DataReviewStatus } from '@/lib/real-image-data'
import { isExternalHotlinkUrl } from '@/lib/real-image-data'
import type { SpotCategory } from '@/types/spot'
import type { ShowcaseCard } from './showcaseCards'
import { REAL_SPOT_PHOTO_FALLBACKS } from './realSpotPhotoFallbacks'
import { CARD_PLACEMENTS } from './showcaseCards'
import type { ShowcaseSpotItem } from '@/app/api/spots/showcase/route'

/**
 * 카테고리 순환 순서 (6장 슬라이스 시 각 카테고리 1장씩 보장)
 */
const CATEGORY_ORDER: SpotCategory[] = [
  'animation',
  'sports',
  'movie_drama',
  'music',
  'game',
  'other',
]

interface SpotDocument {
  id: string
  name: string
  photos: string[]
  category?: SpotCategory
  relatedContent?: { name: string }[]
  reviewStatus?: DataReviewStatus
}

interface RelationDocument {
  spotId: string
  contentName: string
  status: string
  displayPriority: number
}

function isPlaceholderPhoto(url?: string | null): boolean {
  if (!url) return true
  return (
    url.includes('picsum.photos/seed/') ||
    isExternalHotlinkUrl(url) ||
    url.startsWith('/icons/')
  )
}

function resolveLandingPhoto(
  spotId: string,
  photoUrl?: string | null
): string | null {
  if (photoUrl && !isPlaceholderPhoto(photoUrl)) {
    return photoUrl
  }

  return REAL_SPOT_PHOTO_FALLBACKS[spotId]?.imageUrl ?? null
}

/**
 * DB에서 카테고리별 대표 스팟을 가져와 ShowcaseCard 배열로 반환한다.
 * - 카테고리당 최대 2장, 총 12장 (CARD_PLACEMENTS 수에 맞춤)
 * - 카테고리 순환 배치: [anim, sports, movie, music, game, other] × 2
 * - 썸네일(photos[0])이 있는 스팟 우선 선택
 * - 스팟이 부족하면 SHOWCASE_CARDS 정적 데이터로 보완
 *
 * Server Component 전용 (DB 직접 접근)
 */
export async function fetchShowcaseSpots(): Promise<ShowcaseCard[]> {
  const maxCards = CARD_PLACEMENTS.length // 12

  try {
    const collection = await getCollection<SpotDocument>('spots')

    // 카테고리별로 썸네일 있는 스팟 2개씩 조회
    const spotsByCategory = await Promise.all(
      CATEGORY_ORDER.map(async (category) => {
        const spots = await collection
          .find({
            category,
            reviewStatus: 'approved',
            'photos.0': { $exists: true, $ne: '' },
          })
          .project({
            id: 1,
            name: 1,
            photos: 1,
            category: 1,
            relatedContent: 1,
            reviewStatus: 1,
          })
          .limit(2)
          .toArray()
        return { category, spots }
      })
    )

    // 카테고리 순환 배치로 카드 생성
    // 1차 순환: 각 카테고리 1번째 스팟
    // 2차 순환: 각 카테고리 2번째 스팟
    const cards: ShowcaseCard[] = []

    // 모든 스팟 ID 수집 후 일괄 relations 조회
    const allSpots = spotsByCategory.flatMap(({ spots }) => spots)
    const spotIds = allSpots.map((s) => s.id)

    let relationsBySpotId: Record<string, string[]> = {}
    try {
      const relationsCollection = await getCollection<RelationDocument>(
        COLLECTIONS.SPOT_CONTENT_RELATIONS
      )
      const relations = await relationsCollection
        .find({ spotId: { $in: spotIds }, status: 'active' })
        .sort({ displayPriority: 1 })
        .project({ spotId: 1, contentName: 1 })
        .toArray()

      // spotId별 contentName 목록 그룹화
      for (const rel of relations) {
        if (!relationsBySpotId[rel.spotId]) {
          relationsBySpotId[rel.spotId] = []
        }
        if (!relationsBySpotId[rel.spotId].includes(rel.contentName)) {
          relationsBySpotId[rel.spotId].push(rel.contentName)
        }
      }
    } catch {
      // relations 조회 실패 시 빈 객체로 진행 (additionalContentNames 없이)
      relationsBySpotId = {}
    }

    for (let round = 0; round < 2; round++) {
      for (const { category, spots } of spotsByCategory) {
        if (cards.length >= maxCards) break
        const spot = spots[round]
        if (!spot) continue

        const contentName = spot.relatedContent?.[0]?.name || spot.name
        const imageUrl = resolveLandingPhoto(spot.id, spot.photos[0])

        if (!imageUrl) continue

        // additionalContentNames: 대표 작품명을 제외한 나머지 작품명
        const allContentNames = relationsBySpotId[spot.id] || []
        const additionalContentNames = allContentNames.filter(
          (name) => name !== contentName
        )

        cards.push({
          id: `showcase-${spot.id}-${round}`,
          spotName: spot.name,
          contentName,
          additionalContentNames:
            additionalContentNames.length > 0
              ? additionalContentNames
              : undefined,
          category: spot.category ?? category,
          imageUrl,
        })
      }
    }

    // 카드가 충분하면 반환
    if (cards.length >= 6) {
      return cards
    }

    // 스팟이 너무 적으면 정적 데이터로 보완
    const { SHOWCASE_CARDS } = await import('./showcaseCards')
    const staticCards = SHOWCASE_CARDS.slice(cards.length)
    return [...cards, ...staticCards].slice(0, maxCards)
  } catch (error) {
    // DB 연결 실패 시 정적 데이터 폴백
    console.error('[fetchShowcaseSpots] DB 조회 실패, 정적 데이터 사용:', error)
    const { SHOWCASE_CARDS } = await import('./showcaseCards')
    return SHOWCASE_CARDS
  }
}

/**
 * 카테고리별 대표 스팟 이미지 URL을 반환한다.
 * categoryStories, proofData 등에서 플레이스홀더 아이콘 대신 사용
 *
 * @returns Record<SpotCategory, string> — 카테고리별 첫 번째 스팟 사진 URL
 */
export async function fetchCategoryImages(): Promise<
  Record<SpotCategory, string>
> {
  const iconFallback: Record<SpotCategory, string> = {
    animation: '/icons/categories/animation.webp',
    sports: '/icons/categories/sports.webp',
    movie_drama: '/icons/categories/movie_drama.webp',
    music: '/icons/categories/music.webp',
    game: '/icons/categories/game.webp',
    other: '/icons/categories/other.webp',
  }

  try {
    const collection = await getCollection<SpotDocument>('spots')

    const results = await Promise.all(
      CATEGORY_ORDER.map(async (category) => {
        const spot = await collection.findOne(
          {
            category,
            reviewStatus: 'approved',
            'photos.0': { $exists: true, $ne: '' },
          },
          { projection: { id: 1, photos: 1 } }
        )
        return {
          category,
          imageUrl: spot ? resolveLandingPhoto(spot.id, spot.photos[0]) : null,
        }
      })
    )

    const images = { ...iconFallback }
    for (const { category, imageUrl } of results) {
      if (imageUrl) {
        images[category] = imageUrl
      }
    }

    // 아이콘 폴백만 남은 카테고리는 그대로 둠 (다른 카테고리 이미지를 빌려오면 혼동)
    return images
  } catch {
    return iconFallback
  }
}

/**
 * 소셜 프루프 카드에 사용할 카테고리별 스팟 이미지 목록을 반환한다.
 * GET /api/spots/showcase API를 호출하여 실제 스팟 사진 URL을 가져온다.
 * API 실패 시 카테고리 아이콘 폴백으로 graceful degradation한다.
 *
 * @returns Record<SpotCategory, string[]> — 카테고리별 스팟 사진 URL 배열
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.1, 4.5
 */
export async function fetchProofImages(): Promise<
  Record<SpotCategory, string[]>
> {
  const iconFallback: Record<SpotCategory, string[]> = {
    animation: ['/icons/categories/animation.webp'],
    sports: ['/icons/categories/sports.webp'],
    movie_drama: ['/icons/categories/movie_drama.webp'],
    music: ['/icons/categories/music.webp'],
    game: ['/icons/categories/game.webp'],
    other: ['/icons/categories/other.webp'],
  }

  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/spots/showcase`, {
      next: { revalidate: 3600 }, // 1시간 캐시
    })

    if (!res.ok) {
      throw new Error(`Showcase API returned ${res.status}`)
    }

    const spots: ShowcaseSpotItem[] = await res.json()

    // Record<SpotCategory, string[]> 변환
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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      '[fetchProofImages] Showcase API 호출 실패, 카테고리 아이콘 폴백 사용:',
      error
    )
    return iconFallback
  }
}

/**
 * 소셜 프루프 섹션에 표시할 최근 체크인 데이터를 가져온다.
 * contentName, migrationStatus를 포함하여 작품명 표시 및 미분류 라벨 처리에 사용
 *
 * @returns SocialProofCheckin[] — 최근 체크인 10개 (contentName 포함)
 */
export interface SocialProofCheckinData {
  id: string
  spotName: string
  contentName?: string
  migrationStatus?: 'resolved' | 'unresolved' | null
  photoUrl: string
  comment?: string
  categoryTag: SpotCategory
}

interface CheckinDocument {
  id: string
  spotId: string
  photoUrl: string
  comment?: string
  contentName?: string
  migrationStatus?: 'resolved' | 'unresolved' | null
  createdAt: Date
}

export async function fetchSocialProofCheckins(): Promise<
  SocialProofCheckinData[]
> {
  try {
    const checkinsCollection = await getCollection<CheckinDocument>(
      COLLECTIONS.CHECKINS
    )
    const spotsCollection = await getCollection<SpotDocument>('spots')

    // 최근 체크인 10개 조회 (photoUrl이 있는 것만)
    const recentCheckins = await checkinsCollection
      .find({ photoUrl: { $exists: true, $ne: '' } })
      .sort({ createdAt: -1 })
      .limit(10)
      .project({
        id: 1,
        spotId: 1,
        photoUrl: 1,
        comment: 1,
        contentName: 1,
        migrationStatus: 1,
      })
      .toArray()

    if (recentCheckins.length === 0) {
      return []
    }

    // 체크인에 연결된 스팟 정보 조회
    const spotIds = [...new Set(recentCheckins.map((c) => c.spotId))]
    const spots = await spotsCollection
      .find({ id: { $in: spotIds } })
      .project({ id: 1, name: 1, category: 1 })
      .toArray()

    const spotMap = new Map(spots.map((s) => [s.id, s]))

    // 체크인 데이터를 SocialProofCheckinData로 변환
    const results: SocialProofCheckinData[] = []
    for (const checkin of recentCheckins) {
      const spot = spotMap.get(checkin.spotId)
      if (!spot) continue

      results.push({
        id: checkin.id,
        spotName: spot.name,
        contentName: checkin.contentName || undefined,
        migrationStatus: checkin.migrationStatus,
        photoUrl: checkin.photoUrl,
        comment: checkin.comment,
        categoryTag: (spot.category as SpotCategory) || 'other',
      })
    }

    return results
  } catch (error) {
    console.error('[fetchSocialProofCheckins] 체크인 데이터 조회 실패:', error)
    return []
  }
}
