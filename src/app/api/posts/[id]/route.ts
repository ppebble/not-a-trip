import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { Post } from '@/types'
import { ObjectId } from 'mongodb'

// MongoDB document interface
interface PostDocument {
  _id?: ObjectId
  title: string
  content: string
  author: string
  viewCount: number
  commentCount: number
  createdAt: Date
  updatedAt: Date
}

/**
 * MongoDB 문서를 Post 타입으로 변환
 */
function documentToPost(doc: PostDocument & { _id: ObjectId }): Post {
  return {
    id: doc._id.toHexString(),
    title: doc.title,
    content: doc.content,
    author: doc.author,
    viewCount: doc.viewCount,
    commentCount: doc.commentCount,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

/**
 * GET /api/posts/[id] - 게시글 상세 조회
 * Requirements: 5.3
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params

    // ObjectId 유효성 검사
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID format' },
        { status: 400 }
      )
    }

    const collection = await getCollection<PostDocument & { _id: ObjectId }>(
      COLLECTIONS.POSTS
    )

    // 게시글 조회
    const post = await collection.findOne({ _id: new ObjectId(id) })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // 조회수 증가
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { viewCount: 1 } }
    )

    // 증가된 조회수 반영
    const postWithIncrementedView: Post = {
      ...documentToPost(post),
      viewCount: post.viewCount + 1,
    }

    return NextResponse.json(postWithIncrementedView)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
