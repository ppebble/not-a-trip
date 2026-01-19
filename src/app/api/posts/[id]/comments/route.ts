import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { Comment, CreateCommentInput } from '@/types'
import { ObjectId } from 'mongodb'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// MongoDB document interface
interface CommentDocument {
  _id?: ObjectId
  postId: ObjectId
  content: string
  author: string
  createdAt: Date
  // 비회원/회원 구분 필드
  password?: string // 비회원용 비밀번호 (해시 저장)
  userId?: string // 회원용 사용자 ID (optional)
  isGuest: boolean // 회원/비회원 구분 (true: 비회원, false: 회원)
}

interface PostDocument {
  _id: ObjectId
  commentCount: number
}

/**
 * 댓글 유효성 검사
 * Requirements: 5.4
 */
function validateCommentInput(
  input: Partial<CreateCommentInput>
): { valid: true } | { valid: false; errors: string[] } {
  const errors: string[] = []

  // 내용 검사: 비어있거나 공백만 있는 경우 거부
  if (!input.content || input.content.trim().length === 0) {
    errors.push('댓글 내용은 필수입니다')
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

/**
 * MongoDB 문서를 Comment 타입으로 변환
 */
function documentToComment(doc: CommentDocument & { _id: ObjectId }): Comment {
  return {
    id: doc._id.toHexString(),
    postId: doc.postId.toHexString(),
    content: doc.content,
    author: doc.author,
    createdAt: doc.createdAt,
    // 비회원/회원 구분 필드 (password는 보안상 제외)
    userId: doc.userId,
    isGuest: doc.isGuest,
  }
}

/**
 * GET /api/posts/[id]/comments - 댓글 목록 조회
 * Requirements: 5.3, 5.4
 * 댓글을 생성 시간 기준 오름차순으로 정렬하여 반환
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

    // 게시글 존재 여부 확인
    const postsCollection = await getCollection<PostDocument>(COLLECTIONS.POSTS)
    const post = await postsCollection.findOne({ _id: new ObjectId(id) })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const commentsCollection = await getCollection<
      CommentDocument & { _id: ObjectId }
    >(COLLECTIONS.COMMENTS)

    // 생성 시간 기준 오름차순 정렬 (Requirements 5.4)
    const comments = await commentsCollection
      .find({ postId: new ObjectId(id) })
      .sort({ createdAt: 1 })
      .toArray()

    // Comment 타입으로 변환
    const commentList: Comment[] = comments.map(documentToComment)

    return NextResponse.json({
      comments: commentList,
      total: commentList.length,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/posts/[id]/comments - 댓글 작성
 * Requirements: 5.3, 5.4, 16.8.6
 *
 * 회원: 세션에서 userId 자동 추출, 비밀번호 불필요
 * 비회원: 닉네임 + 비밀번호 필수, 비밀번호 해시 저장
 */
export async function POST(
  request: NextRequest,
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

    // 게시글 존재 여부 확인
    const postsCollection = await getCollection<PostDocument>(COLLECTIONS.POSTS)
    const post = await postsCollection.findOne({ _id: new ObjectId(id) })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const body = await request.json()
    const input: Partial<CreateCommentInput> = {
      content: body.content,
    }

    // 유효성 검사
    const validation = validateCommentInput(input)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    // 세션 확인 (회원/비회원 구분)
    const session = await auth()
    const isAuthenticated = !!session?.user

    // 비회원인 경우 비밀번호 필수 검증
    if (!isAuthenticated) {
      if (!body.password || body.password.trim().length === 0) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: ['비회원은 비밀번호가 필수입니다'],
          },
          { status: 400 }
        )
      }
      if (body.password.length < 4) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: ['비밀번호는 4자 이상이어야 합니다'],
          },
          { status: 400 }
        )
      }
    }

    const commentsCollection = await getCollection<
      CommentDocument & { _id: ObjectId }
    >(COLLECTIONS.COMMENTS)

    const now = new Date()

    // 회원/비회원에 따른 댓글 데이터 구성
    let newComment: CommentDocument

    if (isAuthenticated && session.user) {
      // 회원 댓글
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
      // 비회원 댓글 - 비밀번호 해시 저장
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

    // 게시글의 commentCount 증가
    await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { commentCount: 1 } }
    )

    // 응답에서 password 제외
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
    // eslint-disable-next-line no-console
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
