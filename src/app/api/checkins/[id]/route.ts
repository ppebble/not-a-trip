import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import { CheckIn, UserStats } from '@/types'

/**
 * CheckIn MongoDB Document
 */
interface CheckInDocument {
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
 * 유저 통계 업데이트
 */
async function updateUserStats(userId: string): Promise<void> {
  const checkinsCollection = await getCollection<CheckInDocument>(
    COLLECTIONS.CHECKINS
  )
  const statsCollection = await getCollection<UserStats>(COLLECTIONS.USER_STATS)

  const totalCheckIns = await checkinsCollection.countDocuments({ userId })
  const uniqueSpots = await checkinsCollection
    .distinct('spotId', { userId })
    .then((spots) => spots.length)

  const badgesCollection = await getCollection(COLLECTIONS.USER_BADGES)
  const badgeCount = await badgesCollection.countDocuments({ userId })

  await statsCollection.updateOne(
    { userId },
    {
      $set: {
        userId,
        totalCheckIns,
        uniqueSpots,
        badgeCount,
        contentProgress: [],
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  )
}

/**
 * GET /api/checkins/[id] - 인증 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const collection = await getCollection<CheckInDocument>(
      COLLECTIONS.CHECKINS
    )

    const checkin = await collection.findOne({ id })

    if (!checkin) {
      return NextResponse.json(
        { error: '인증을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const result: CheckIn = {
      id: checkin.id,
      spotId: checkin.spotId,
      userId: checkin.userId,
      userName: checkin.userName,
      userImage: checkin.userImage,
      photoUrl: checkin.photoUrl,
      sceneImageUrl: checkin.sceneImageUrl,
      visitedAt: checkin.visitedAt,
      comment: checkin.comment,
      likeCount: checkin.likeCount,
      createdAt: checkin.createdAt,
      updatedAt: checkin.updatedAt,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching checkin:', error)
    return NextResponse.json(
      { error: '인증 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/checkins/[id] - 인증 삭제 (본인만)
 * Requirements: 1.3
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
    const collection = await getCollection<CheckInDocument>(
      COLLECTIONS.CHECKINS
    )

    const checkin = await collection.findOne({ id })

    if (!checkin) {
      return NextResponse.json(
        { error: '인증을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 본인 확인
    if (checkin.userId !== session.user.id) {
      return NextResponse.json(
        { error: '본인의 인증만 삭제할 수 있습니다' },
        { status: 403 }
      )
    }

    await collection.deleteOne({ id })

    // 유저 통계 업데이트
    await updateUserStats(session.user.id!)

    return NextResponse.json({ message: '인증이 삭제되었습니다' })
  } catch (error) {
    console.error('Error deleting checkin:', error)
    return NextResponse.json(
      { error: '인증 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
