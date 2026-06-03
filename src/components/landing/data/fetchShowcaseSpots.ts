import { runtimeLogger } from '@/lib/runtime-logger'
import { getCollection } from '@/lib/db'
import { COLLECTIONS } from '@/lib/db'
import type { DataReviewStatus } from '@/lib/real-image-data'
import { isExternalHotlinkUrl } from '@/lib/real-image-data'
import type { SpotCategory } from '@/types/spot'
import type { ShowcaseCard } from './showcaseCards'
import { CARD_PLACEMENTS, SHOWCASE_CARDS } from './showcaseCards'
import type { ShowcaseSpotItem } from '@/app/api/spots/showcase/route'
import { resolveThumbnailUrl } from '@/app/api/spots/showcase/helpers'

const CATEGORY_ORDER: SpotCategory[] = [
  'animation',
  'sports',
  'movie_drama',
  'music',
  'game',
  'other',
]

const LANDING_REVIEW_STATUS_QUERY = {
  $or: [
    { reviewStatus: 'approved' as DataReviewStatus },
    { reviewStatus: { $exists: false } },
  ],
}

interface SpotDocument {
  id: string
  name: string
  photos: string[]
  category?: SpotCategory
  relatedContent?: { name: string }[]
  reviewStatus?: DataReviewStatus
}

interface ContentDocument {
  id?: string
  normalizedName: string
  displayName: string
  imageUrl?: string
  type?: string
  spotCount?: number
}

interface RelationDocument {
  spotId: string
  contentName: string
  status: string
  displayPriority: number
}

const CONTENT_TYPE_TO_CATEGORY: Record<string, SpotCategory> = {
  anime: 'animation',
  sports_team: 'sports',
  movie: 'movie_drama',
  drama: 'movie_drama',
  artist: 'music',
  game: 'game',
  other: 'other',
}

function isPlaceholderPhoto(url?: string | null): boolean {
  if (!url) return true
  return (
    url.includes('picsum.photos/seed/') ||
    isExternalHotlinkUrl(url) ||
    url.includes('/images/showcase/') ||
    url.startsWith('/icons/') ||
    url.includes('placeholder') ||
    url.includes('dummy')
  )
}

function isBlockedContentImage(url?: string | null): boolean {
  if (!url) return true

  const normalized = url.trim()
  if (!normalized) return true

  return (
    normalized.includes('picsum.photos/seed/') ||
    isExternalHotlinkUrl(normalized) ||
    normalized.startsWith('/icons/') ||
    normalized.includes('placeholder') ||
    normalized.includes('dummy') ||
    normalized.startsWith('data:image/svg+xml')
  )
}

function resolveLandingPhoto(
  spotId: string,
  photoUrl?: string | null
): string | null {
  return resolveThumbnailUrl(spotId, photoUrl)
}

function getStaticCardsByCategory(): Record<SpotCategory, ShowcaseCard[]> {
  return CATEGORY_ORDER.reduce(
    (acc, category) => {
      acc[category] = SHOWCASE_CARDS.filter(
        (card) => card.category === category
      )
      return acc
    },
    {} as Record<SpotCategory, ShowcaseCard[]>
  )
}

async function buildContentShowcaseCards(): Promise<ShowcaseCard[]> {
  const maxCards = CARD_PLACEMENTS.length
  const collection = await getCollection<ContentDocument>(
    COLLECTIONS.CONTENT_MASTERS
  )

  const contents = await collection
    .find({
      imageUrl: { $exists: true, $ne: '' },
      spotCount: { $gt: 0 },
    })
    .sort({ spotCount: -1, updatedAt: -1 })
    .limit(maxCards)
    .project({
      id: 1,
      normalizedName: 1,
      displayName: 1,
      imageUrl: 1,
      type: 1,
      spotCount: 1,
    })
    .toArray()

  return contents
    .filter((content) => !isBlockedContentImage(content.imageUrl))
    .map((content, index) => {
      const contentName =
        content.displayName || content.normalizedName || `작품 ${index + 1}`
      const category =
        CONTENT_TYPE_TO_CATEGORY[String(content.type ?? 'other')] ?? 'other'

      return {
        id: `content-${content.normalizedName || content.id || index}`,
        spotName: `${content.spotCount ?? 0}개 스팟`,
        contentName,
        category,
        imageUrl: content.imageUrl!.trim(),
      }
    })
}

async function buildSpotShowcaseCards(): Promise<ShowcaseCard[]> {
  const maxCards = CARD_PLACEMENTS.length
  const collection = await getCollection<SpotDocument>('spots')

  const spotsByCategory = await Promise.all(
    CATEGORY_ORDER.map(async (category) => {
      const spots = await collection
        .find({
          category,
          ...LANDING_REVIEW_STATUS_QUERY,
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
        .limit(8)
        .toArray()

      const usableSpots = spots
        .map((spot) => ({
          spot,
          imageUrl: resolveLandingPhoto(spot.id, spot.photos[0]),
        }))
        .filter((item): item is { spot: SpotDocument; imageUrl: string } =>
          Boolean(item.imageUrl)
        )
        .slice(0, 2)

      return { category, spots: usableSpots }
    })
  )

  const allSpots = spotsByCategory.flatMap(({ spots }) =>
    spots.map(({ spot }) => spot)
  )
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

    for (const rel of relations) {
      if (!relationsBySpotId[rel.spotId]) {
        relationsBySpotId[rel.spotId] = []
      }
      if (!relationsBySpotId[rel.spotId].includes(rel.contentName)) {
        relationsBySpotId[rel.spotId].push(rel.contentName)
      }
    }
  } catch {
    relationsBySpotId = {}
  }

  const cards: ShowcaseCard[] = []

  for (let round = 0; round < 2; round++) {
    for (const { category, spots } of spotsByCategory) {
      if (cards.length >= maxCards) break
      const item = spots[round]
      if (!item) continue

      const { spot, imageUrl } = item
      const contentName = spot.relatedContent?.[0]?.name || spot.name
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

  return cards
}

export async function fetchShowcaseSpots(): Promise<ShowcaseCard[]> {
  const maxCards = CARD_PLACEMENTS.length

  try {
    const cards = await buildContentShowcaseCards()

    if (cards.length >= 4) {
      return cards.slice(0, maxCards)
    }

    const usedIds = new Set(cards.map((card) => card.id))
    const supplementalCards = SHOWCASE_CARDS.filter(
      (card) => !usedIds.has(card.id) && !isPlaceholderPhoto(card.imageUrl)
    )

    return [...cards, ...supplementalCards].slice(0, maxCards)
  } catch (error) {
    runtimeLogger.error(
      '[fetchShowcaseSpots] DB 조회 실패, 정적 스팟 사진 사용:',
      error
    )
    return SHOWCASE_CARDS.filter((card) => !isPlaceholderPhoto(card.imageUrl))
  }
}

export async function fetchCategoryImages(): Promise<
  Record<SpotCategory, string>
> {
  const fallbackByCategory = getStaticCardsByCategory()

  try {
    const cards = await buildSpotShowcaseCards()
    const result = CATEGORY_ORDER.reduce(
      (acc, category) => {
        const dbCard = cards.find((card) => card.category === category)
        const staticCard = fallbackByCategory[category].find(
          (card) => !isPlaceholderPhoto(card.imageUrl)
        )

        acc[category] = dbCard?.imageUrl ?? staticCard?.imageUrl ?? ''
        return acc
      },
      {} as Record<SpotCategory, string>
    )

    return result
  } catch (error) {
    runtimeLogger.error(
      '[fetchCategoryImages] DB 조회 실패, 정적 스팟 사진 사용:',
      error
    )
    return CATEGORY_ORDER.reduce(
      (acc, category) => {
        acc[category] =
          fallbackByCategory[category].find(
            (card) => !isPlaceholderPhoto(card.imageUrl)
          )?.imageUrl ?? ''
        return acc
      },
      {} as Record<SpotCategory, string>
    )
  }
}

export async function fetchProofImages(): Promise<
  Record<SpotCategory, string[]>
> {
  const staticFallback = getStaticCardsByCategory()
  const fallback: Record<SpotCategory, string[]> = CATEGORY_ORDER.reduce(
    (acc, category) => {
      acc[category] = staticFallback[category]
        .map((card) => card.imageUrl)
        .filter((url) => !isPlaceholderPhoto(url))
      return acc
    },
    {} as Record<SpotCategory, string[]>
  )

  try {
    const baseUrl =
      process.env.AUTH_URL ||
      process.env.NEXTAUTH_URL ||
      'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/spots/showcase`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`Showcase API returned ${res.status}`)
    }

    const spots: ShowcaseSpotItem[] = await res.json()

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

    for (const category of CATEGORY_ORDER) {
      if (result[category].length === 0) {
        result[category] = fallback[category]
      }
    }

    return result
  } catch (error) {
    runtimeLogger.warn(
      '[fetchProofImages] Showcase API 호출 실패, 정적 스팟 사진 사용:',
      error
    )
    return fallback
  }
}

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

    const spotIds = [...new Set(recentCheckins.map((c) => c.spotId))]
    const spots = await spotsCollection
      .find({ id: { $in: spotIds } })
      .project({ id: 1, name: 1, category: 1 })
      .toArray()

    const spotMap = new Map(spots.map((s) => [s.id, s]))

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
    runtimeLogger.error(
      '[fetchSocialProofCheckins] 체크인 데이터 조회 실패:',
      error
    )
    return []
  }
}
