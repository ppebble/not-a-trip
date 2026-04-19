import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Route, RouteDifficulty } from '@/types/route'
import { calculateRouteDistances } from '@/lib/route-utils'

/** 코스 ID 생성 (ROUTE-{숫자} 형식) */
async function generateRouteId(): Promise<string> {
  const collection = await getCollection<Route>('routes')
  const routes = await collection
    .find({ id: { $regex: /^ROUTE-\d+$/ } })
    .project({ id: 1 })
    .toArray()

  if (routes.length === 0) return 'ROUTE-001'

  const maxNumber = routes.reduce((max, route) => {
    const match = route.id.match(/^ROUTE-(\d+)$/)
    if (match) {
      const num = parseInt(match[1], 10)
      return num > max ? num : max
    }
    return max
  }, 0)

  return `ROUTE-${(maxNumber + 1).toString().padStart(3, '0')}`
}

const VALID_DIFFICULTIES: RouteDifficulty[] = ['easy', 'moderate', 'hard']

/**
 * POST /api/routes - 코스 생성
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const errors: string[] = []

    // 필수 필드 검증
    if (!body.name?.trim()) errors.push('코스명은 필수입니다')
    if (!body.description?.trim()) errors.push('설명은 필수입니다')
    if (!body.estimatedDuration || body.estimatedDuration <= 0)
      errors.push('예상 소요시간은 필수입니다')
    if (!body.difficulty || !VALID_DIFFICULTIES.includes(body.difficulty))
      errors.push('난이도를 선택해주세요 (easy, moderate, hard)')
    if (!Array.isArray(body.spots) || body.spots.length < 1)
      errors.push('코스에는 최소 1개의 스팟이 필요합니다')

    if (errors.length > 0) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요', fields: errors },
        { status: 400 }
      )
    }

    // 스팟 ID 유효성 검증 (spots 컬렉션 대조)
    const spotsCollection = await getCollection('spots')
    const spotIds = body.spots.map((s: { spotId: string }) => s.spotId)
    const existingSpots = await spotsCollection
      .find({ id: { $in: spotIds } })
      .project({ id: 1, name: 1, coordinates: 1, photos: 1 })
      .toArray()

    const existingSpotMap = new Map(existingSpots.map((s) => [s.id, s]))

    const invalidSpotIds = spotIds.filter(
      (id: string) => !existingSpotMap.has(id)
    )
    if (invalidSpotIds.length > 0) {
      return NextResponse.json(
        { error: '유효하지 않은 스팟이 포함되어 있습니다' },
        { status: 400 }
      )
    }

    // 스팟 데이터 구성 (비정규화 데이터 채우기)
    const routeSpots = body.spots.map(
      (s: { spotId: string; note?: string }) => {
        const dbSpot = existingSpotMap.get(s.spotId)!
        return {
          spotId: s.spotId,
          spotName: dbSpot.name,
          coordinates: dbSpot.coordinates,
          thumbnailUrl: dbSpot.photos?.[0] || '',
          distanceFromPrev: null,
          walkTimeFromPrev: null,
          note: s.note || undefined,
          isAvailable: true,
        }
      }
    )

    // 스팟 간 거리/시간 자동 계산
    const distances = calculateRouteDistances(routeSpots)
    routeSpots.forEach(
      (
        spot: {
          distanceFromPrev: number | null
          walkTimeFromPrev: number | null
        },
        i: number
      ) => {
        spot.distanceFromPrev = distances[i].distanceFromPrev
        spot.walkTimeFromPrev = distances[i].walkTimeFromPrev
      }
    )

    // 총 거리 계산
    const totalDistance = distances.reduce(
      (sum, d) => sum + (d.distanceFromPrev || 0),
      0
    )

    const routesCollection = await getCollection<Route>('routes')
    const now = new Date()
    const routeId = await generateRouteId()

    const newRoute: Route = {
      id: routeId,
      name: body.name.trim(),
      description: body.description.trim(),
      estimatedDuration: body.estimatedDuration,
      difficulty: body.difficulty,
      startPoint: body.startPoint || undefined,
      spots: routeSpots,
      totalDistance,
      relatedContentNames: body.relatedContentNames || [],
      regionTags:
        Array.isArray(body.regionTags) && body.regionTags.length > 0
          ? body.regionTags
          : undefined,
      isPublic: body.isPublic !== false,
      isOfficial: false,
      bookmarkCount: 0,
      completionCount: 0,
      authorId: session.user.id,
      authorName:
        session.user.name || session.user.email?.split('@')[0] || '익명',
      createdAt: now,
      updatedAt: now,
    }

    await routesCollection.insertOne(newRoute)

    return NextResponse.json(
      {
        id: newRoute.id,
        name: newRoute.name,
        message: '코스가 생성되었습니다',
      },
      { status: 201 }
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating route:', error)
    return NextResponse.json(
      { error: '코스 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}

/** 정렬 기준 타입 */
type SortType = 'popular' | 'newest' | 'duration'

/**
 * GET /api/routes - 코스 목록 조회
 * Requirements: 2.1, 2.2
 * Query params:
 *   - sort: popular | newest | duration (기본: popular)
 *   - contentName: 작품명 필터
 *   - regionTag: 지역 필터
 *   - minDuration: 최소 소요시간 (분)
 *   - maxDuration: 최대 소요시간 (분)
 *   - page: 페이지 번호 (기본: 1)
 *   - limit: 페이지당 항목 수 (기본: 12)
 *   - authorId: 작성자 필터
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const sort = (searchParams.get('sort') || 'popular') as SortType
    const contentName = searchParams.get('contentName')
    const regionTag = searchParams.get('regionTag')
    const minDuration = searchParams.get('minDuration')
    const maxDuration = searchParams.get('maxDuration')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('limit') || '12', 10))
    )
    const authorId = searchParams.get('authorId')

    // 현재 유저 확인 (비공개 코스 필터용)
    const session = await auth()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}

    // 기본: 공개 코스만 표시 (본인 코스는 비공개도 포함)
    if (authorId && session?.user?.id === authorId) {
      query.authorId = authorId
    } else if (authorId) {
      query.authorId = authorId
      query.isPublic = true
    } else {
      query.isPublic = true
    }

    // 작품별 필터
    if (contentName) {
      query.relatedContentNames = contentName
    }

    // 지역별 필터
    if (regionTag) {
      query.regionTags = { $in: [regionTag] }
    }

    // 소요시간별 필터
    if (minDuration || maxDuration) {
      query.estimatedDuration = {}
      if (minDuration) query.estimatedDuration.$gte = parseInt(minDuration, 10)
      if (maxDuration) query.estimatedDuration.$lte = parseInt(maxDuration, 10)
    }

    const collection = await getCollection<Route>('routes')

    // 정렬 기준 설정
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortOption: Record<string, any>
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 }
        break
      case 'duration':
        sortOption = { estimatedDuration: 1 }
        break
      case 'popular':
      default:
        sortOption = { bookmarkCount: -1, completionCount: -1, createdAt: -1 }
        break
    }

    const skip = (page - 1) * limit
    const [routes, total] = await Promise.all([
      collection.find(query).sort(sortOption).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ])

    return NextResponse.json({
      routes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching routes:', error)
    return NextResponse.json(
      { error: '코스 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
