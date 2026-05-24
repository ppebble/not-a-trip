import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import {
  CheckIn,
  CheckInInput,
  CheckInFilter,
  UserStats,
  SpotContentRelation,
  RelationType,
} from '@/types'
import { checkAndAwardBadges } from '@/lib/badge-utils'
import {
  fetchTotalSpotsMap,
  fetchCheckedSpotsMap,
  mergeProgressMaps,
} from '@/lib/progress-utils'
import {
  createRateLimitHeaders,
  evaluateSlidingWindowLimit,
  getClientIp,
  guardCheckinSpam,
  logIfSanitized,
  sanitizeOptionalPlainText,
  SpamGuardError,
} from '@/lib/security'

/**
 * CheckIn MongoDB Document
 */
interface CheckInDocument {
  _id?: ObjectId
  id: string
  spotId: string
  userId: string
  userName: string
  userImage?: string
  photoUrl: string
  sceneImageUrl?: string
  visitedAt: Date
  comment?: string
  likeCount: number
  // relation 기반 필드
  relationId?: string
  contentId?: string
  contentName?: string
  relationType?: RelationType
  migrationStatus?: 'resolved' | 'unresolved' | null
  createdAt: Date
  updatedAt?: Date
}

/**
 * 다음 인증 ID 생성 (CHECKIN-{숫자} 형식)
 */
async function generateCheckInId(): Promise<string> {
  const collection = await getCollection<CheckInDocument>(COLLECTIONS.CHECKINS)

  const checkins = await collection
    .find({ id: { $regex: /^CHECKIN-\d+$/ } })
    .project({ id: 1 })
    .sort({ id: -1 })
    .limit(1)
    .toArray()

  if (checkins.length === 0) {
    return 'CHECKIN-001'
  }

  const match = checkins[0].id.match(/^CHECKIN-(\d+)$/)
  const nextNumber = match ? parseInt(match[1], 10) + 1 : 1
  return `CHECKIN-${nextNumber.toString().padStart(3, '0')}`
}

/**
 * 유저 통계 업데이트
 */
async function updateUserStats(userId: string): Promise<void> {
  const checkinsCollection = await getCollection<CheckInDocument>(
    COLLECTIONS.CHECKINS
  )
  const statsCollection = await getCollection<UserStats>(COLLECTIONS.USER_STATS)

  // 총 인증 수
  const totalCheckIns = await checkinsCollection.countDocuments({ userId })

  // 고유 스팟 수
  const uniqueSpots = await checkinsCollection
    .distinct('spotId', { userId })
    .then((spots) => spots.length)

  // 뱃지 수
  const badgesCollection = await getCollection(COLLECTIONS.USER_BADGES)
  const badgeCount = await badgesCollection.countDocuments({ userId })

  // 콘텐츠별 진행률 계산 (Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6)
  const [totalSpotsMap, checkedSpotsMap] = await Promise.all([
    fetchTotalSpotsMap(),
    fetchCheckedSpotsMap(userId),
  ])
  const contentProgress = mergeProgressMaps(totalSpotsMap, checkedSpotsMap)

  // 통계 업데이트 (upsert)
  await statsCollection.updateOne(
    { userId },
    {
      $set: {
        userId,
        totalCheckIns,
        uniqueSpots,
        badgeCount,
        contentProgress,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  )
}

/**
 * GET /api/checkins - 인증 목록 조회
 * Query params:
 *   - spotId: 스팟별 필터
 *   - userId: 유저별 필터
 *   - contentName: 작품명 필터 (relation 기반, unresolved 제외)
 *   - relationId: 특정 relation 필터
 *   - includeUnresolved: true일 때 unresolved 체크인 별도 포함
 *   - sortBy: 정렬 (latest | popular)
 *   - page: 페이지 번호
 *   - limit: 페이지당 개수
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const collection = await getCollection<CheckInDocument>(
      COLLECTIONS.CHECKINS
    )

    const { searchParams } = new URL(request.url)
    const contentName = searchParams.get('contentName') || undefined
    const relationId = searchParams.get('relationId') || undefined
    const includeUnresolved = searchParams.get('includeUnresolved') === 'true'
    const filter: CheckInFilter = {
      spotId: searchParams.get('spotId') || undefined,
      userId: searchParams.get('userId') || undefined,
      sortBy: (searchParams.get('sortBy') as 'latest' | 'popular') || 'latest',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
    }

    // 쿼리 조건 생성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}
    if (filter.spotId) query.spotId = filter.spotId
    if (filter.userId) query.userId = filter.userId

    // contentName 필터: relation 기반 (Requirements 4.1, 4.2, 8.1, 8.2)
    // migrationStatus: { $ne: 'unresolved' } → null(신규)과 resolved 모두 포함
    if (contentName) {
      query.contentName = contentName
      query.migrationStatus = { $ne: 'unresolved' }
    }

    // relationId 필터 (Requirements 4.5)
    if (relationId) {
      query.relationId = relationId
    }

    // 정렬 조건
    const sort: { [key: string]: 1 | -1 } =
      filter.sortBy === 'popular'
        ? { likeCount: -1, createdAt: -1 }
        : { createdAt: -1 }

    // 페이지네이션
    const skip = ((filter.page || 1) - 1) * (filter.limit || 20)
    const limit = filter.limit || 20

    const [checkins, total] = await Promise.all([
      collection.find(query).sort(sort).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ])

    // Document를 CheckIn 타입으로 변환 (Requirements 4.6, 8.5)
    const result: CheckIn[] = checkins.map((doc) => ({
      id: doc.id,
      spotId: doc.spotId,
      userId: doc.userId,
      userName: doc.userName,
      userImage: doc.userImage,
      photoUrl: doc.photoUrl,
      sceneImageUrl: doc.sceneImageUrl,
      visitedAt: doc.visitedAt,
      comment: doc.comment,
      likeCount: doc.likeCount,
      // relation 메타데이터 포함 (Requirements 4.6, 8.5)
      ...(doc.relationId && { relationId: doc.relationId }),
      ...(doc.contentId && { contentId: doc.contentId }),
      ...(doc.contentName && { contentName: doc.contentName }),
      ...(doc.relationType && { relationType: doc.relationType }),
      ...(doc.migrationStatus !== undefined && {
        migrationStatus: doc.migrationStatus,
      }),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }))

    // includeUnresolved 처리 (Requirements 4.3, 8.3)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: Record<string, any> = {
      checkins: result,
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / limit),
    }

    if (includeUnresolved && filter.spotId) {
      const unresolvedQuery = {
        spotId: filter.spotId,
        migrationStatus: 'unresolved' as const,
      }
      const [unresolvedCheckins, unresolvedTotal] = await Promise.all([
        collection.find(unresolvedQuery).sort(sort).toArray(),
        collection.countDocuments(unresolvedQuery),
      ])
      response.unresolvedCheckins = unresolvedCheckins.map((doc) => ({
        id: doc.id,
        spotId: doc.spotId,
        userId: doc.userId,
        userName: doc.userName,
        userImage: doc.userImage,
        photoUrl: doc.photoUrl,
        sceneImageUrl: doc.sceneImageUrl,
        visitedAt: doc.visitedAt,
        comment: doc.comment,
        likeCount: doc.likeCount,
        migrationStatus: doc.migrationStatus,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }))
      response.unresolvedTotal = unresolvedTotal
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching checkins:', error)
    return NextResponse.json(
      { error: '인증 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/checkins - 인증 생성
 * Requirements: 1.1, 1.3, 2.7, 2.8, 3.9, 11.1, 11.2, 11.3, 11.7
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIp(request)
    // 인증 확인
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const body: CheckInInput = await request.json()
    const sanitizedComment = sanitizeOptionalPlainText(body.comment)
    await logIfSanitized({
      label: 'checkin.comment',
      before: body.comment,
      after: sanitizedComment,
      userId: session.user.id,
      ip,
    })

    const writeLimit = evaluateSlidingWindowLimit({
      key: `checkin-write:${session.user.id}`,
      limit: 30,
      windowMs: 60 * 1000,
    })
    if (!writeLimit.allowed) {
      return NextResponse.json(
        {
          error: '체크인 등록 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        },
        { status: 429, headers: createRateLimitHeaders(writeLimit) }
      )
    }

    // 유효성 검사
    const errors: string[] = []
    if (!body.spotId?.trim()) {
      errors.push('스팟 ID는 필수입니다')
    }
    if (!body.photoUrl?.trim()) {
      errors.push('인증샷 이미지는 필수입니다')
    }
    if (!body.visitedAt) {
      errors.push('방문 날짜는 필수입니다')
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: '유효성 검사 실패', details: errors },
        { status: 400 }
      )
    }

    // === relation 분기 로직 (Requirements 2.7, 3.9, 11.1~11.3) ===
    guardCheckinSpam(session.user.id!, body.spotId.trim())

    let resolvedRelation: SpotContentRelation | null = null

    try {
      const relationsCollection = await getCollection<SpotContentRelation>(
        COLLECTIONS.SPOT_CONTENT_RELATIONS
      )
      const activeRelations = await relationsCollection
        .find({ spotId: body.spotId.trim(), status: 'active' })
        .sort({ displayPriority: 1 })
        .toArray()

      if (activeRelations.length === 0) {
        // 0개: relationId 없이 체크인 허용 (Requirements 11.1)
        resolvedRelation = null
      } else if (activeRelations.length === 1) {
        // 1개: 자동 선택 (Requirements 11.2)
        if (body.relationId && body.relationId !== activeRelations[0].id) {
          return NextResponse.json(
            { error: '유효하지 않은 관계 ID입니다' },
            { status: 400 }
          )
        }
        resolvedRelation = activeRelations[0]
      } else {
        // 2개 이상: relationId 필수 (Requirements 11.3)
        if (!body.relationId) {
          return NextResponse.json(
            { error: '이 스팟에는 작품 선택이 필요합니다' },
            { status: 400 }
          )
        }
        // 유효한 relationId인지 확인 (Requirements 2.8, 11.7)
        const matched = activeRelations.find((r) => r.id === body.relationId)
        if (!matched) {
          return NextResponse.json(
            { error: '유효하지 않은 관계 ID입니다' },
            { status: 400 }
          )
        }
        resolvedRelation = matched
      }
    } catch (relError) {
      // relations 조회 실패 시 400 에러 (M2 수정사항, Requirements 3.9)
      console.error('Relations 조회 실패:', relError)
      return NextResponse.json(
        { error: '작품 정보를 조회할 수 없습니다' },
        { status: 400 }
      )
    }

    const collection = await getCollection<CheckInDocument>(
      COLLECTIONS.CHECKINS
    )

    const now = new Date()
    const checkInId = await generateCheckInId()

    const newCheckIn: CheckInDocument = {
      id: checkInId,
      spotId: body.spotId.trim(),
      userId: session.user.id!,
      userName:
        session.user.name || session.user.email?.split('@')[0] || '익명',
      userImage: session.user.image || undefined,
      photoUrl: body.photoUrl.trim(),
      sceneImageUrl: body.sceneImageUrl?.trim(),
      visitedAt: new Date(body.visitedAt),
      comment: sanitizedComment,
      likeCount: 0,
      // relation 스냅샷 필드 (Requirements 2.7)
      ...(resolvedRelation && {
        relationId: resolvedRelation.id,
        contentId: resolvedRelation.contentId,
        contentName: resolvedRelation.contentName,
        relationType: resolvedRelation.relationType,
      }),
      createdAt: now,
      updatedAt: now,
    }

    await collection.insertOne(newCheckIn)

    // 유저 통계 업데이트
    await updateUserStats(session.user.id!)

    // 뱃지 획득 조건 체크
    const earnedBadges = await checkAndAwardBadges(session.user.id!)

    return NextResponse.json(
      {
        id: newCheckIn.id,
        message: '인증이 완료되었습니다',
        earnedBadges: earnedBadges.length > 0 ? earnedBadges : undefined,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof SpamGuardError) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 429,
          headers: { 'Retry-After': String(error.retryAfterSeconds) },
        }
      )
    }

    console.error('Error creating checkin:', error)
    return NextResponse.json(
      { error: '인증 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}
