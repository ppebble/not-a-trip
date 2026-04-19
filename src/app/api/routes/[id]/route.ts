import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Route, RouteDifficulty } from '@/types/route'
import { calculateRouteDistances } from '@/lib/route-utils'

const VALID_DIFFICULTIES: RouteDifficulty[] = ['easy', 'moderate', 'hard']

/**
 * GET /api/routes/[id] - 코스 상세 조회
 * Requirements: 1.4, 2.3
 * - spots 컬렉션과 대조하여 isAvailable 갱신
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const collection = await getCollection<Route>('routes')
    const route = await collection.findOne({ id })

    if (!route) {
      return NextResponse.json(
        { error: '코스를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 비공개 코스 타인 접근 차단
    if (!route.isPublic) {
      const session = await auth()
      if (
        !session?.user ||
        (session.user.id !== route.authorId && session.user.role !== 'admin')
      ) {
        return NextResponse.json(
          { error: '비공개 코스입니다' },
          { status: 403 }
        )
      }
    }

    // spots 컬렉션과 대조하여 isAvailable 갱신
    const spotsCollection = await getCollection('spots')
    const spotIds = route.spots.map((s) => s.spotId)
    const existingSpots = await spotsCollection
      .find({ id: { $in: spotIds } })
      .project({ id: 1, status: 1 })
      .toArray()

    const existingSpotMap = new Map(existingSpots.map((s) => [s.id, s]))

    let hasChanges = false
    const updatedSpots = route.spots.map((spot) => {
      const dbSpot = existingSpotMap.get(spot.spotId)
      // 스팟이 삭제되었거나 '소실됨' 상태인 경우
      const isAvailable = dbSpot !== undefined && dbSpot.status !== 'lost'
      if (spot.isAvailable !== isAvailable) {
        hasChanges = true
      }
      return { ...spot, isAvailable }
    })

    // 변경사항이 있으면 DB 업데이트
    if (hasChanges) {
      await collection.updateOne(
        { id },
        { $set: { spots: updatedSpots, updatedAt: new Date() } }
      )
    }

    return NextResponse.json({ ...route, spots: updatedSpots })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching route detail:', error)
    return NextResponse.json(
      { error: '코스 상세 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/routes/[id] - 코스 수정
 * Requirements: 1.2, 1.3, 1.4
 * - 작성자 권한 확인
 * - 스팟 순서 변경 시 거리/시간 재계산
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const collection = await getCollection<Route>('routes')

    const route = await collection.findOne({ id })
    if (!route) {
      return NextResponse.json(
        { error: '코스를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 작성자 또는 관리자만 수정 가능
    if (session.user.id !== route.authorId && session.user.role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const errors: string[] = []
    if (body.name !== undefined && !body.name?.trim())
      errors.push('코스명은 필수입니다')
    if (body.description !== undefined && !body.description?.trim())
      errors.push('설명은 필수입니다')
    if (body.estimatedDuration !== undefined && body.estimatedDuration <= 0)
      errors.push('예상 소요시간은 0보다 커야 합니다')
    if (
      body.difficulty !== undefined &&
      !VALID_DIFFICULTIES.includes(body.difficulty)
    )
      errors.push('유효하지 않은 난이도입니다')
    if (
      body.spots !== undefined &&
      (!Array.isArray(body.spots) || body.spots.length < 1)
    )
      errors.push('코스에는 최소 1개의 스팟이 필요합니다')

    if (errors.length > 0) {
      return NextResponse.json(
        { error: '유효성 검사 실패', fields: errors },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: Record<string, any> = { updatedAt: new Date() }

    if (body.name) updateFields.name = body.name.trim()
    if (body.description) updateFields.description = body.description.trim()
    if (body.estimatedDuration !== undefined)
      updateFields.estimatedDuration = body.estimatedDuration
    if (body.difficulty) updateFields.difficulty = body.difficulty
    if (body.relatedContentNames !== undefined)
      updateFields.relatedContentNames = body.relatedContentNames
    if (body.regionTags !== undefined) updateFields.regionTags = body.regionTags
    if (body.isPublic !== undefined) updateFields.isPublic = body.isPublic
    if (body.startPoint !== undefined)
      updateFields.startPoint = body.startPoint || undefined

    // 스팟 목록 변경 시 거리/시간 재계산
    if (body.spots) {
      const spotsCollection = await getCollection('spots')
      const spotIds = body.spots.map((s: { spotId: string }) => s.spotId)
      const existingSpots = await spotsCollection
        .find({ id: { $in: spotIds } })
        .project({ id: 1, name: 1, coordinates: 1, photos: 1 })
        .toArray()

      const existingSpotMap = new Map(existingSpots.map((s) => [s.id, s]))

      const invalidSpotIds = spotIds.filter(
        (sid: string) => !existingSpotMap.has(sid)
      )
      if (invalidSpotIds.length > 0) {
        return NextResponse.json(
          { error: '유효하지 않은 스팟이 포함되어 있습니다' },
          { status: 400 }
        )
      }

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

      updateFields.spots = routeSpots
      updateFields.totalDistance = distances.reduce(
        (sum, d) => sum + (d.distanceFromPrev || 0),
        0
      )
    }

    await collection.updateOne({ id }, { $set: updateFields })

    return NextResponse.json({ id, message: '코스가 수정되었습니다' })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating route:', error)
    return NextResponse.json(
      { error: '코스 수정에 실패했습니다' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/routes/[id] - 코스 삭제
 * Requirements: 2.3
 * - 작성자 권한 확인
 * - 관련 북마크/완주 기록 정리
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const { id } = await params
    const collection = await getCollection<Route>('routes')

    const route = await collection.findOne({ id })
    if (!route) {
      return NextResponse.json(
        { error: '코스를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 작성자 또는 관리자만 삭제 가능
    if (session.user.id !== route.authorId && session.user.role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    // 관련 북마크/완주 기록 삭제
    const [bookmarksCollection, completionsCollection] = await Promise.all([
      getCollection('route_bookmarks'),
      getCollection('route_completions'),
    ])

    await Promise.all([
      bookmarksCollection.deleteMany({ routeId: id }),
      completionsCollection.deleteMany({ routeId: id }),
      collection.deleteOne({ id }),
    ])

    return NextResponse.json({ message: '코스가 삭제되었습니다' })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting route:', error)
    return NextResponse.json(
      { error: '코스 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
