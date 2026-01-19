import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { Post, UpdatePostInput } from '@/types'
import { ObjectId } from 'mongodb'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

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
  // 비회원/회원 구분 필드
  password?: string // 비회원용 비밀번호 (해시 저장)
  userId?: string // 회원용 사용자 ID (optional)
  isGuest: boolean // 회원/비회원 구분 (true: 비회원, false: 회원)
}

interface CommentDocument {
  _id?: ObjectId
  postId: ObjectId
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
    // 비회원/회원 구분 필드 (password는 보안상 제외)
    userId: doc.userId,
    isGuest: doc.isGuest,
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

/**
 * 게시글 수정 입력 유효성 검사
 */
function validateUpdateInput(
  input: UpdatePostInput
): { valid: true } | { valid: false; errors: string[] } {
  const errors: string[] = []

  // 최소 하나의 필드는 있어야 함
  if (input.title === undefined && input.content === undefined) {
    errors.push('수정할 내용이 없습니다')
  }

  // 제목이 있으면 비어있거나 공백만 있는지 검사
  if (input.title !== undefined && input.title.trim().length === 0) {
    errors.push('제목은 비어있을 수 없습니다')
  }

  // 내용이 있으면 비어있거나 공백만 있는지 검사
  if (input.content !== undefined && input.content.trim().length === 0) {
    errors.push('내용은 비어있을 수 없습니다')
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

/**
 * PUT /api/posts/[id] - 게시글 수정
 * Requirements: 5.7, 16.8.7
 *
 * 회원: 본인 userId 일치 시 수정 가능
 * 비회원: 비밀번호 해시 비교 후 수정 가능
 */
export async function PUT(
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

    const collection = await getCollection<PostDocument & { _id: ObjectId }>(
      COLLECTIONS.POSTS
    )

    // 게시글 존재 여부 확인
    const existingPost = await collection.findOne({ _id: new ObjectId(id) })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const body = await request.json()

    // 권한 검증
    const session = await auth()
    const isAuthenticated = !!session?.user

    if (existingPost.isGuest) {
      // 비회원 게시글: 비밀번호 검증 필수
      if (!body.password) {
        return NextResponse.json(
          { error: '비밀번호가 필요합니다', requirePassword: true },
          { status: 401 }
        )
      }

      // 비밀번호가 저장되어 있지 않은 경우 (기존 데이터)
      if (!existingPost.password) {
        return NextResponse.json(
          { error: '이 게시글은 비밀번호가 설정되지 않아 수정할 수 없습니다' },
          { status: 403 }
        )
      }

      const isPasswordValid = await bcrypt.compare(
        body.password,
        existingPost.password
      )

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: '비밀번호가 일치하지 않습니다' },
          { status: 401 }
        )
      }
    } else {
      // 회원 게시글: 본인 확인
      if (!isAuthenticated) {
        return NextResponse.json(
          { error: '로그인이 필요합니다' },
          { status: 401 }
        )
      }

      const currentUserId = session.user.id || session.user.email
      if (existingPost.userId !== currentUserId) {
        return NextResponse.json(
          { error: '본인의 게시글만 수정할 수 있습니다' },
          { status: 403 }
        )
      }
    }

    const input: UpdatePostInput = {
      title: body.title,
      content: body.content,
    }

    // 유효성 검사
    const validation = validateUpdateInput(input)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    // 업데이트할 필드 구성
    const updateFields: Partial<PostDocument> = {
      updatedAt: new Date(),
    }

    if (input.title !== undefined) {
      updateFields.title = input.title.trim()
    }

    if (input.content !== undefined) {
      updateFields.content = input.content.trim()
    }

    // 게시글 업데이트
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    )

    // 업데이트된 게시글 조회
    const updatedPost = await collection.findOne({ _id: new ObjectId(id) })

    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Failed to retrieve updated post' },
        { status: 500 }
      )
    }

    return NextResponse.json(documentToPost(updatedPost))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/posts/[id] - 게시글 삭제
 * Requirements: 5.8, 16.8.7
 *
 * 회원: 본인 userId 일치 시 삭제 가능
 * 비회원: 비밀번호 해시 비교 후 삭제 가능
 * 게시글 삭제 시 연관된 댓글도 함께 삭제
 */
export async function DELETE(
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

    const postsCollection = await getCollection<
      PostDocument & { _id: ObjectId }
    >(COLLECTIONS.POSTS)

    // 게시글 존재 여부 확인
    const existingPost = await postsCollection.findOne({
      _id: new ObjectId(id),
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // 권한 검증
    const session = await auth()
    const isAuthenticated = !!session?.user

    // body에서 비밀번호 추출 (DELETE 요청도 body를 가질 수 있음)
    let password: string | undefined
    try {
      const body = await request.json()
      password = body.password
    } catch {
      // body가 없는 경우 무시
    }

    if (existingPost.isGuest) {
      // 비회원 게시글: 비밀번호 검증 필수
      if (!password) {
        return NextResponse.json(
          { error: '비밀번호가 필요합니다', requirePassword: true },
          { status: 401 }
        )
      }

      // 비밀번호가 저장되어 있지 않은 경우 (기존 데이터)
      if (!existingPost.password) {
        return NextResponse.json(
          { error: '이 게시글은 비밀번호가 설정되지 않아 삭제할 수 없습니다' },
          { status: 403 }
        )
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        existingPost.password
      )

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: '비밀번호가 일치하지 않습니다' },
          { status: 401 }
        )
      }
    } else {
      // 회원 게시글: 본인 확인
      if (!isAuthenticated) {
        return NextResponse.json(
          { error: '로그인이 필요합니다' },
          { status: 401 }
        )
      }

      const currentUserId = session.user.id || session.user.email
      if (existingPost.userId !== currentUserId) {
        return NextResponse.json(
          { error: '본인의 게시글만 삭제할 수 있습니다' },
          { status: 403 }
        )
      }
    }

    // 연관된 댓글 삭제 (Requirements 5.8)
    const commentsCollection = await getCollection<CommentDocument>(
      COLLECTIONS.COMMENTS
    )
    const deleteCommentsResult = await commentsCollection.deleteMany({
      postId: new ObjectId(id),
    })

    // 게시글 삭제
    await postsCollection.deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      message: 'Post deleted successfully',
      deletedCommentsCount: deleteCommentsResult.deletedCount,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
