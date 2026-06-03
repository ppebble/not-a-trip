import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { Post, CreatePostInput } from '@/types'
import { validatePostInput } from '@/lib/post-validation'
import { ObjectId } from 'mongodb'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { runtimeLogger } from '@/lib/runtime-logger'
import {
  createRateLimitHeaders,
  evaluateSlidingWindowLimit,
  getClientIp,
  guardPostSpam,
  logIfSanitized,
  sanitizePlainText,
  SpamGuardError,
} from '@/lib/security'
import { recordApiErrorMetric } from '@/lib/ops/metrics'

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
  password?: string
  userId?: string
  isGuest: boolean
}

interface SpotDocument {
  id: string
  relatedMedia: {
    title: string
    type: string
    year?: number
  }[]
}

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
    userId: doc.userId,
    isGuest: doc.isGuest,
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const spotId = searchParams.get('spotId')
    const mediaTitle = searchParams.get('mediaTitle')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const postsCollection = await getCollection<
      PostDocument & { _id: ObjectId }
    >(COLLECTIONS.POSTS)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filter: any = {}

    if (type === 'general') {
      filter = {
        $and: [
          { $or: [{ spotId: { $exists: false } }, { spotId: null }] },
          { $or: [{ mediaTitle: { $exists: false } }, { mediaTitle: null }] },
        ],
      }
    } else if (spotId) {
      filter.spotId = spotId
    } else if (mediaTitle) {
      const spotsCollection = await getCollection<SpotDocument>(
        COLLECTIONS.SPOTS
      )
      const spots = await spotsCollection
        .find({ 'relatedMedia.title': mediaTitle })
        .toArray()
      const spotIds = spots.map((spot) => spot.id)

      filter = {
        $or: [
          { mediaTitle },
          ...(spotIds.length > 0 ? [{ spotId: { $in: spotIds } }] : []),
        ],
      }
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' }
      const searchCondition = {
        $or: [{ title: searchRegex }, { content: searchRegex }],
      }

      filter =
        Object.keys(filter).length > 0
          ? { $and: [filter, searchCondition] }
          : searchCondition
    }

    const posts = await postsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray()

    const postList: Post[] = posts.map(documentToPost)

    return NextResponse.json({ posts: postList, total: postList.length })
  } catch (error) {
    runtimeLogger.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const ip = getClientIp(request)
    const session = await auth()
    const isAuthenticated = !!session?.user
    const identityKey = session?.user?.id || ip

    const rateLimit = evaluateSlidingWindowLimit({
      key: `post-write:${identityKey}`,
      limit: 30,
      windowMs: 60 * 1000,
    })
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: '게시글 작성 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        },
        { status: 429, headers: createRateLimitHeaders(rateLimit) }
      )
    }

    guardPostSpam(identityKey)

    const sanitizedTitle = sanitizePlainText(body.title)
    const sanitizedContent = sanitizePlainText(body.content)
    await Promise.all([
      logIfSanitized({
        label: 'post.title',
        before: body.title,
        after: sanitizedTitle,
        userId: session?.user?.id,
        ip,
      }),
      logIfSanitized({
        label: 'post.content',
        before: body.content,
        after: sanitizedContent,
        userId: session?.user?.id,
        ip,
      }),
    ])

    const input: CreatePostInput = {
      title: sanitizedTitle,
      content: sanitizedContent,
      spotId: body.spotId,
      mediaTitle: body.mediaTitle,
    }

    const validation = validatePostInput(input)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    if (!isAuthenticated) {
      if (!body.password || body.password.trim().length === 0) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: ['비회원은 비밀번호가 필요합니다.'],
          },
          { status: 400 }
        )
      }
      if (body.password.length < 4) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: ['비밀번호는 4자 이상이어야 합니다.'],
          },
          { status: 400 }
        )
      }
    }

    const collection = await getCollection<PostDocument & { _id: ObjectId }>(
      COLLECTIONS.POSTS
    )
    const now = new Date()

    let newPost: PostDocument

    if (isAuthenticated && session.user) {
      newPost = {
        title: input.title.trim(),
        content: input.content.trim(),
        author:
          session.user.name || session.user.email?.split('@')[0] || '회원',
        viewCount: 0,
        commentCount: 0,
        createdAt: now,
        updatedAt: now,
        isGuest: false,
        userId: session.user.id || session.user.email || undefined,
        ...(input.spotId && { spotId: input.spotId }),
        ...(input.mediaTitle && { mediaTitle: input.mediaTitle.trim() }),
      }
    } else {
      const hashedPassword = await bcrypt.hash(body.password, 10)

      newPost = {
        title: input.title.trim(),
        content: input.content.trim(),
        author: body.author || '익명',
        viewCount: 0,
        commentCount: 0,
        createdAt: now,
        updatedAt: now,
        isGuest: true,
        password: hashedPassword,
        ...(input.spotId && { spotId: input.spotId }),
        ...(input.mediaTitle && { mediaTitle: input.mediaTitle.trim() }),
      }
    }

    const result = await collection.insertOne(
      newPost as PostDocument & { _id: ObjectId }
    )

    const createdPost: Post = {
      id: result.insertedId.toHexString(),
      title: newPost.title,
      content: newPost.content,
      author: newPost.author,
      viewCount: newPost.viewCount,
      commentCount: newPost.commentCount,
      createdAt: newPost.createdAt,
      updatedAt: newPost.updatedAt,
      spotId: newPost.spotId,
      mediaTitle: newPost.mediaTitle,
      userId: newPost.userId,
      isGuest: newPost.isGuest,
    }

    return NextResponse.json({ post: createdPost }, { status: 201 })
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

    runtimeLogger.error('Error creating post:', error)
    await recordApiErrorMetric({ path: '/api/posts', statusCode: 500 })
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
