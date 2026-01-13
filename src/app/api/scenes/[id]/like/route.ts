import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { ObjectId } from 'mongodb'

/**
 * POST /api/scenes/[id]/like - 장면에 좋아요 추가
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

    const collection = await getCollection(COLLECTIONS.SCENES)

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(sceneId) },
      { $inc: { likeCount: 1 } },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      likeCount: result.likeCount,
    })
  } catch (error) {
    console.error('Error liking scene:', error)
    return NextResponse.json({ error: 'Failed to like scene' }, { status: 500 })
  }
}

/**
 * DELETE /api/scenes/[id]/like - 장면 좋아요 취소
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

    const collection = await getCollection(COLLECTIONS.SCENES)

    const result = await collection.findOneAndUpdate(
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
