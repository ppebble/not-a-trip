import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { Post, CreatePostInput } from '@/types'
import { validatePostInput } from '@/lib/post-validation'
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
  spotId?: string
  mediaTitle?: string
}

interface SpotDocument {
  id: string
  relatedMedia: {
    title: string
    type: string
    year?: number
  }[]
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
    spotId: doc.spotId,
    mediaTitle: doc.mediaTitle,
  }
}

/**
 * GET /api/posts - 게시글 목록 조회
 * Requirements: 5.1
 *
 * Query Parameters:
 * - spotId: 특정 스팟 관련 게시글만 조회
 * - mediaTitle: 특정 작품 관련 게시글만 조회 (해당 작품과 연결된 스팟의 게시글도 포함)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const spotId = searchParams.get('spotId')
    const mediaTitle = searchParams.get('mediaTitle')

    const postsCollection = await getCollection<
      PostDocument & { _id: ObjectId }
    >(COLLECTIONS.POSTS)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filter: any = {}

    if (spotId) {
      // 특정 스팟의 게시글만 조회
      filter.spotId = spotId
    } else if (mediaTitle) {
      // 작품별 조회: 해당 작품과 연결된 스팟들의 게시글도 포함
      const spotsCollection = await getCollection<SpotDocument>(
        COLLECTIONS.SPOTS
      )

      // 해당 작품과 연결된 스팟 ID 목록 조회
      const spots = await spotsCollection
        .find({ 'relatedMedia.title': mediaTitle })
        .toArray()
      const spotIds = spots.map((spot) => spot.id)

      // 작품과 직접 연결된 게시글 OR 해당 작품의 스팟과 연결된 게시글
      filter = {
        $or: [
          { mediaTitle: mediaTitle },
          ...(spotIds.length > 0 ? [{ spotId: { $in: spotIds } }] : []),
        ],
      }
    }

    // 최신순으로 정렬하여 조회
    const posts = await postsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray()

    // Post 타입으로 변환
    const postList: Post[] = posts.map(documentToPost)

    return NextResponse.json({ posts: postList, total: postList.length })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/posts - 게시글 작성
 * Requirements: 5.2
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const input: CreatePostInput = {
      title: body.title,
      content: body.content,
      spotId: body.spotId,
      mediaTitle: body.mediaTitle,
    }

    // 유효성 검사
    const validation = validatePostInput(input)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    const collection = await getCollection<PostDocument & { _id: ObjectId }>(
      COLLECTIONS.POSTS
    )

    const now = new Date()
    const newPost: PostDocument = {
      title: input.title.trim(),
      content: input.content.trim(),
      author: body.author || '익명', // 기본값: 익명
      viewCount: 0,
      commentCount: 0,
      createdAt: now,
      updatedAt: now,
      ...(input.spotId && { spotId: input.spotId }),
      ...(input.mediaTitle && { mediaTitle: input.mediaTitle.trim() }),
    }

    const result = await collection.insertOne(
      newPost as PostDocument & { _id: ObjectId }
    )

    const createdPost: Post = {
      id: result.insertedId.toHexString(),
      ...newPost,
    }

    return NextResponse.json({ post: createdPost }, { status: 201 })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
