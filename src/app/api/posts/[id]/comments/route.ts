import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { Comment, CreateCommentInput } from '@/types'
import { ObjectId } from 'mongodb'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import {
  createRateLimitHeaders,
  evaluateSlidingWindowLimit,
  getClientIp,
  guardCommentSpam,
  logIfSanitized,
  sanitizePlainText,
  SpamGuardError,
} from '@/lib/security'

interface CommentDocument {
  _id?: ObjectId
  postId: ObjectId
  content: string
  author: string
  createdAt: Date
  password?: string
  userId?: string
  isGuest: boolean
}

interface PostDocument {
  _id: ObjectId
  commentCount: number
}

function validateCommentInput(
  input: Partial<CreateCommentInput>
): { valid: true } | { valid: false; errors: string[] } {
  const errors: string[] = []

  if (!input.content || input.content.trim().length === 0) {
    errors.push('댓글 내용은 필수입니다.')
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

function documentToComment(doc: CommentDocument & { _id: ObjectId }): Comment {
  return {
    id: doc._id.toHexString(),
    postId: doc.postId.toHexString(),
    content: doc.content,
    author: doc.author,
    createdAt: doc.createdAt,
    userId: doc.userId,
    isGuest: doc.isGuest,
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID format' },
        { status: 400 }
      )
    }

    const postsCollection = await getCollection<PostDocument>(COLLECTIONS.POSTS)
    const post = await postsCollection.findOne({ _id: new ObjectId(id) })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const commentsCollection = await getCollection<
      CommentDocument & { _id: ObjectId }
    >(COLLECTIONS.COMMENTS)

    const comments = await commentsCollection
      .find({ postId: new ObjectId(id) })
      .sort({ createdAt: 1 })
      .toArray()

    const commentList: Comment[] = comments.map(documentToComment)

    return NextResponse.json({
      comments: commentList,
      total: commentList.length,
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const ip = getClientIp(request)

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID format' },
        { status: 400 }
      )
    }

    const postsCollection = await getCollection<PostDocument>(COLLECTIONS.POSTS)
    const post = await postsCollection.findOne({ _id: new ObjectId(id) })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const body = await request.json()
    const session = await auth()
    const isAuthenticated = !!session?.user
    const identityKey = session?.user?.id || ip

    const rateLimit = evaluateSlidingWindowLimit({
      key: `comment-write:${identityKey}`,
      limit: 30,
      windowMs: 60 * 1000,
    })
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '댓글 작성 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429, headers: createRateLimitHeaders(rateLimit) }
      )
    }

    guardCommentSpam(identityKey)

    const sanitizedContent = sanitizePlainText(body.content)
    await logIfSanitized({
      label: 'comment.content',
      before: body.content,
      after: sanitizedContent,
      userId: session?.user?.id,
      ip,
    })

    const input: Partial<CreateCommentInput> = {
      content: sanitizedContent,
    }

    const validation = validateCommentInput(input)
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

    const commentsCollection = await getCollection<
      CommentDocument & { _id: ObjectId }
    >(COLLECTIONS.COMMENTS)

    const now = new Date()
    let newComment: CommentDocument

    if (isAuthenticated && session.user) {
      newComment = {
        postId: new ObjectId(id),
        content: input.content!.trim(),
        author:
          session.user.name || session.user.email?.split('@')[0] || '회원',
        createdAt: now,
        isGuest: false,
        userId: session.user.id || session.user.email || undefined,
      }
    } else {
      const hashedPassword = await bcrypt.hash(body.password, 10)

      newComment = {
        postId: new ObjectId(id),
        content: input.content!.trim(),
        author: body.author || '익명',
        createdAt: now,
        isGuest: true,
        password: hashedPassword,
      }
    }

    const result = await commentsCollection.insertOne(
      newComment as CommentDocument & { _id: ObjectId }
    )

    await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { commentCount: 1 } }
    )

    const createdComment: Comment = {
      id: result.insertedId.toHexString(),
      postId: id,
      content: newComment.content,
      author: newComment.author,
      createdAt: newComment.createdAt,
      userId: newComment.userId,
      isGuest: newComment.isGuest,
    }

    return NextResponse.json(createdComment, { status: 201 })
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

    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
