import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { runtimeLogger } from '@/lib/runtime-logger'

/**
 * GET /api/users/[id]/posts - 유저의 게시글 목록
 * Requirements: 9.7
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    const postsCollection = await getCollection(COLLECTIONS.POSTS)
    const commentsCollection = await getCollection(COLLECTIONS.COMMENTS)

    const posts = await postsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    const result = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await commentsCollection.countDocuments({
          postId: post._id.toString(),
        })
        const content = post.content || post.body || ''
        return {
          id: post._id.toString(),
          title: post.title || '제목 없음',
          contentPreview: content.slice(0, 100),
          viewCount: post.viewCount || 0,
          commentCount,
          createdAt:
            post.createdAt instanceof Date
              ? post.createdAt.toISOString()
              : post.createdAt,
        }
      })
    )

    return NextResponse.json({ posts: result })
  } catch (error) {
    runtimeLogger.error('Error fetching user posts:', error)
    return NextResponse.json(
      { error: '게시글 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
