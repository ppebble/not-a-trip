import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection, COLLECTIONS } from '@/lib/db'

/**
 * GET /api/users/[id]/comments - 유저의 댓글 목록
 * Requirements: 9.8
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    const commentsCollection = await getCollection(COLLECTIONS.COMMENTS)
    const postsCollection = await getCollection(COLLECTIONS.POSTS)

    const comments = await commentsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    const result = await Promise.all(
      comments.map(async (comment) => {
        let postDoc = null
        try {
          postDoc = await postsCollection.findOne({
            _id: new ObjectId(comment.postId),
          })
        } catch {
          postDoc = null
        }

        const content = comment.content || comment.body || ''
        return {
          id: comment._id.toString(),
          postId: comment.postId,
          postTitle: postDoc?.title || '삭제된 게시글',
          contentPreview: content.slice(0, 80),
          createdAt:
            comment.createdAt instanceof Date
              ? comment.createdAt.toISOString()
              : comment.createdAt,
        }
      })
    )

    return NextResponse.json({ comments: result })
  } catch (error) {
    console.error('Error fetching user comments:', error)
    return NextResponse.json(
      { error: '댓글 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
