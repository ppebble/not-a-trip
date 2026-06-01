import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import {
  createRateLimitHeaders,
  evaluateSlidingWindowLimit,
  getClientIp,
  guardCommentSpam,
  logIfSanitized,
  sanitizePlainText,
  SpamGuardError,
} from '@/lib/security'
import { recordApiErrorMetric } from '@/lib/ops/metrics'
import type { CheckInComment } from '@/types'

const CHECKIN_ID_PATTERN = /^CHECKIN-\d+$/
const MAX_COMMENT_LENGTH = 500

interface CheckInDocument {
  id: string
}

interface CheckInCommentDocument {
  _id?: ObjectId
  checkInId: string
  content: string
  authorName: string
  authorImage?: string
  userId: string
  createdAt: Date
}

function documentToComment(
  doc: CheckInCommentDocument & { _id: ObjectId },
  currentUserId?: string
): CheckInComment {
  return {
    id: doc._id.toHexString(),
    checkInId: doc.checkInId,
    content: doc.content,
    authorName: doc.authorName,
    authorImage: doc.authorImage,
    userId: doc.userId,
    canDelete: !!currentUserId && doc.userId === currentUserId,
    createdAt: doc.createdAt,
  }
}

async function assertCheckInExists(id: string): Promise<NextResponse | null> {
  if (!CHECKIN_ID_PATTERN.test(id)) {
    return NextResponse.json({ error: 'Invalid check-in ID' }, { status: 400 })
  }

  const checkinsCollection = await getCollection<CheckInDocument>(
    COLLECTIONS.CHECKINS
  )
  const checkIn = await checkinsCollection.findOne({ id })
  if (!checkIn) {
    return NextResponse.json({ error: 'Check-in not found' }, { status: 404 })
  }

  return null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const checkInError = await assertCheckInExists(id)
    if (checkInError) return checkInError

    const session = await auth()
    const commentsCollection = await getCollection<
      CheckInCommentDocument & { _id: ObjectId }
    >(COLLECTIONS.CHECKIN_COMMENTS)
    const comments = await commentsCollection
      .find({ checkInId: id })
      .sort({ createdAt: 1 })
      .toArray()

    const commentList = comments.map((comment) =>
      documentToComment(comment, session?.user?.id)
    )

    return NextResponse.json({
      comments: commentList,
      total: commentList.length,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching check-in comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch check-in comments' },
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
    const checkInError = await assertCheckInExists(id)
    if (checkInError) return checkInError

    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json(
        { error: 'Login is required to comment on check-ins' },
        { status: 401 }
      )
    }

    const rateLimit = evaluateSlidingWindowLimit({
      key: `checkin-comment-write:${userId}`,
      limit: 30,
      windowMs: 60 * 1000,
    })
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many comment requests. Please retry later.' },
        { status: 429, headers: createRateLimitHeaders(rateLimit) }
      )
    }

    guardCommentSpam(userId)

    const body = await request.json().catch(() => ({}))
    const sanitizedContent = sanitizePlainText(body.content)
    await logIfSanitized({
      label: 'checkinComment.content',
      before: body.content,
      after: sanitizedContent,
      userId,
      ip,
    })

    if (!sanitizedContent) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    if (sanitizedContent.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        {
          error: `Comment content must be ${MAX_COMMENT_LENGTH} characters or fewer`,
        },
        { status: 400 }
      )
    }

    const now = new Date()
    const newComment: CheckInCommentDocument = {
      checkInId: id,
      content: sanitizedContent,
      authorName:
        session.user?.name || session.user?.email?.split('@')[0] || '회원',
      authorImage: session.user?.image || undefined,
      userId,
      createdAt: now,
    }

    const commentsCollection = await getCollection<
      CheckInCommentDocument & { _id: ObjectId }
    >(COLLECTIONS.CHECKIN_COMMENTS)
    const result = await commentsCollection.insertOne(
      newComment as CheckInCommentDocument & { _id: ObjectId }
    )

    const createdComment = documentToComment(
      { ...newComment, _id: result.insertedId },
      userId
    )

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

    // eslint-disable-next-line no-console
    console.error('Error creating check-in comment:', error)
    await recordApiErrorMetric({
      path: '/api/checkins/[id]/comments',
      statusCode: 500,
    })
    return NextResponse.json(
      { error: 'Failed to create check-in comment' },
      { status: 500 }
    )
  }
}
