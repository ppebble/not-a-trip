import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { auth } from '@/lib/auth'

/**
 * 클라이언트 IP 추출
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return 'unknown'
}

/**
 * 비회원 식별자 생성 (IP + deviceId 조합)
 */
function getGuestIdentifier(request: NextRequest): string {
  const ip = getClientIP(request)
  const deviceId = request.headers.get('x-device-id') || 'no-device-id'
  return `guest:${ip}:${deviceId}`
}

/**
 * GET /api/scenes/[id]/like - 사용자의 좋아요 상태 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: sceneId } = await params

    if (!ObjectId.isValid(sceneId)) {
      return NextResponse.json({ error: 'Invalid scene ID' }, { status: 400 })
    }

    // 세션에서 사용자 정보 가져오기
    const session = await auth()
    const userId = session?.user?.id

    // 장면 정보 조회
    const scenesCollection = await getCollection(COLLECTIONS.SCENES)
    const scene = await scenesCollection.findOne({ _id: new ObjectId(sceneId) })

    if (!scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
    }

    const userLikesCollection = await getCollection(COLLECTIONS.USER_LIKES)
    let liked = false

    if (userId) {
      // 로그인 사용자: userId로 조회
      const existingLike = await userLikesCollection.findOne({
        visitorId: userId,
        sceneId,
      })
      liked = !!existingLike
    } else {
      // 비회원: IP + deviceId 조합으로 조회
      const guestId = getGuestIdentifier(request)
      const existingLike = await userLikesCollection.findOne({
        visitorId: guestId,
        sceneId,
      })
      liked = !!existingLike
    }

    return NextResponse.json({
      liked,
      likeCount: scene.likeCount || 0,
    })
  } catch (error) {
    console.error('Error getting like status:', error)
    return NextResponse.json(
      { error: 'Failed to get like status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/scenes/[id]/like - 좋아요 토글
 * 로그인 사용자: userId로 식별
 * 비회원: IP + deviceId 조합으로 식별
 * 모두 토글 방식으로 동작
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: sceneId } = await params

    if (!ObjectId.isValid(sceneId)) {
      return NextResponse.json({ error: 'Invalid scene ID' }, { status: 400 })
    }

    const scenesCollection = await getCollection(COLLECTIONS.SCENES)
    const userLikesCollection = await getCollection(COLLECTIONS.USER_LIKES)

    // 세션에서 사용자 정보 가져오기
    const session = await auth()
    const userId = session?.user?.id

    // 방문자 식별자 결정
    const visitorId = userId || getGuestIdentifier(request)
    const isGuest = !userId

    // 장면 존재 확인
    const scene = await scenesCollection.findOne({ _id: new ObjectId(sceneId) })
    if (!scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
    }

    // 기존 좋아요 확인
    const existingLike = await userLikesCollection.findOne({
      visitorId,
      sceneId,
    })

    if (existingLike) {
      // 이미 좋아요한 경우 -> 좋아요 취소
      await userLikesCollection.deleteOne({ visitorId, sceneId })
      const result = await scenesCollection.findOneAndUpdate(
        { _id: new ObjectId(sceneId), likeCount: { $gt: 0 } },
        { $inc: { likeCount: -1 } },
        { returnDocument: 'after' }
      )

      return NextResponse.json({
        success: true,
        liked: false,
        likeCount: result?.likeCount || 0,
      })
    } else {
      // 좋아요하지 않은 경우 -> 좋아요 추가
      await userLikesCollection.insertOne({
        visitorId,
        sceneId,
        isGuest,
        createdAt: new Date(),
      })
      const result = await scenesCollection.findOneAndUpdate(
        { _id: new ObjectId(sceneId) },
        { $inc: { likeCount: 1 } },
        { returnDocument: 'after' }
      )

      return NextResponse.json({
        success: true,
        liked: true,
        likeCount: result?.likeCount || 0,
      })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/scenes/[id]/like - 좋아요 취소
 * 로그인 사용자: userId로 식별
 * 비회원: IP + deviceId 조합으로 식별
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: sceneId } = await params

    if (!ObjectId.isValid(sceneId)) {
      return NextResponse.json({ error: 'Invalid scene ID' }, { status: 400 })
    }

    // 세션에서 사용자 정보 가져오기
    const session = await auth()
    const userId = session?.user?.id

    // 방문자 식별자 결정
    const visitorId = userId || getGuestIdentifier(request)

    const scenesCollection = await getCollection(COLLECTIONS.SCENES)
    const userLikesCollection = await getCollection(COLLECTIONS.USER_LIKES)

    // 좋아요 기록 확인
    const existingLike = await userLikesCollection.findOne({
      visitorId,
      sceneId,
    })

    if (!existingLike) {
      return NextResponse.json({ error: 'Like not found' }, { status: 404 })
    }

    // 좋아요 기록 삭제
    await userLikesCollection.deleteOne({ visitorId, sceneId })

    // 장면의 좋아요 수 감소
    const result = await scenesCollection.findOneAndUpdate(
      { _id: new ObjectId(sceneId), likeCount: { $gt: 0 } },
      { $inc: { likeCount: -1 } },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json(
        { error: 'Scene not found or already at 0 likes' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      liked: false,
      likeCount: result.likeCount,
    })
  } catch (error) {
    console.error('Error unliking scene:', error)
    return NextResponse.json(
      { error: 'Failed to unlike scene' },
      { status: 500 }
    )
  }
}
