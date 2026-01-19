import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { auth } from '@/lib/auth'

/**
 * GET /api/scenes/[id]/like - 사용자의 좋아요 상태 조회
 */
export async function GET(
  _request: NextRequest,
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

    // 로그인한 사용자의 좋아요 상태 확인
    let liked = false
    if (userId) {
      const userLikesCollection = await getCollection(COLLECTIONS.USER_LIKES)
      const existingLike = await userLikesCollection.findOne({
        userId,
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
 * POST /api/scenes/[id]/like - 좋아요 토글 (로그인 사용자)
 * 로그인 사용자: 좋아요 상태 토글 (추가/취소)
 * 비로그인 사용자: 단순 좋아요 추가 (취소 불가)
 */
export async function POST(
  _request: NextRequest,
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

    // 장면 존재 확인
    const scene = await scenesCollection.findOne({ _id: new ObjectId(sceneId) })
    if (!scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
    }

    if (userId) {
      // 로그인 사용자: 토글 방식
      const existingLike = await userLikesCollection.findOne({
        userId,
        sceneId,
      })

      if (existingLike) {
        // 이미 좋아요한 경우 -> 좋아요 취소
        await userLikesCollection.deleteOne({ userId, sceneId })
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
          userId,
          sceneId,
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
    } else {
      // 비로그인 사용자: 단순 좋아요 추가 (취소 불가)
      const result = await scenesCollection.findOneAndUpdate(
        { _id: new ObjectId(sceneId) },
        { $inc: { likeCount: 1 } },
        { returnDocument: 'after' }
      )

      return NextResponse.json({
        success: true,
        liked: false, // 비로그인은 상태 추적 불가
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
 * DELETE /api/scenes/[id]/like - 좋아요 취소 (로그인 사용자 전용)
 */
export async function DELETE(
  _request: NextRequest,
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

    if (!userId) {
      return NextResponse.json(
        { error: 'Login required to unlike' },
        { status: 401 }
      )
    }

    const scenesCollection = await getCollection(COLLECTIONS.SCENES)
    const userLikesCollection = await getCollection(COLLECTIONS.USER_LIKES)

    // 좋아요 기록 확인
    const existingLike = await userLikesCollection.findOne({
      userId,
      sceneId,
    })

    if (!existingLike) {
      return NextResponse.json({ error: 'Like not found' }, { status: 404 })
    }

    // 좋아요 기록 삭제
    await userLikesCollection.deleteOne({ userId, sceneId })

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
