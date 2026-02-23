import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import { CheckIn, CheckInInput, CheckInFilter, UserStats } from '@/types'
import { checkAndAwardBadges } from '@/lib/badge-utils'

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

  // 통계 업데이트 (upsert)
  await statsCollection.updateOne(
    { userId },
    {
      $set: {
        userId,
        totalCheckIns,
        uniqueSpots,
        badgeCount,
        contentProgress: [], // TODO: 콘텐츠별 진행률 계산
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
 *   - contentName: 작품명 필터 (해당 작품과 연결된 스팟의 체크인만 조회)
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

    // contentName 필터: 해당 작품과 연결된 스팟의 체크인만 조회
    // Requirements 3.5: 작품 선택 시 해당 작품 체크인만 필터링
    if (contentName) {
      const spotsCollection = await getCollection(COLLECTIONS.SPOTS)

      // 해당 작품명을 relatedContent에 포함하는 스팟 ID 목록 조회
      const matchingSpots = await spotsCollection
        .find({
          'relatedContent.name': {
            $regex: `^${contentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            $options: 'i',
          },
        })
        .project({ id: 1 })
        .toArray()

      const spotIds = matchingSpots.map((spot) => spot.id as string)

      if (spotIds.length === 0) {
        // 해당 작품과 연결된 스팟이 없으면 빈 결과 반환
        return NextResponse.json({
          checkins: [],
          total: 0,
          page: filter.page,
          limit: filter.limit,
          totalPages: 0,
        })
      }

      query.spotId = { $in: spotIds }
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

    // Document를 CheckIn 타입으로 변환
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
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }))

    return NextResponse.json({
      checkins: result,
      total,
      page: filter.page,
      limit: filter.limit,
      totalPages: Math.ceil(total / limit),
    })
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
 * Requirements: 1.1, 1.3
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 인증 확인
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const body: CheckInInput = await request.json()

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
      comment: body.comment?.trim(),
      likeCount: 0,
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
    console.error('Error creating checkin:', error)
    return NextResponse.json(
      { error: '인증 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}
