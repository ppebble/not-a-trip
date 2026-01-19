import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// MongoDB document interface
interface CommentDocument {
  _id: ObjectId
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

/**
 * DELETE /api/posts/[id]/comments/[commentId] - 댓글 삭제
 * Requirements: 5.4, 16.8.8
 *
 * 회원: 본인 userId 일치 시 삭제 가능
 * 비회원: 비밀번호 해시 비교 후 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
): Promise<NextResponse> {
  try {
    const { id, commentId } = await params

    // ObjectId 유효성 검사
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID format' },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { error: 'Invalid comment ID format' },
        { status: 400 }
      )
    }

    // 댓글 조회
    const commentsCollection = await getCollection<CommentDocument>(
      COLLECTIONS.COMMENTS
    )
    const comment = await commentsCollection.findOne({
      _id: new ObjectId(commentId),
      postId: new ObjectId(id),
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // 세션 확인
    const session = await auth()
    const isAuthenticated = !!session?.user

    // 권한 검증
    if (comment.isGuest) {
      // 비회원 댓글: 비밀번호 검증 필요
      const body = await request.json().catch(() => ({}))

      if (!body.password) {
        return NextResponse.json(
          {
            error: '비회원 댓글 삭제는 비밀번호가 필요합니다',
            requirePassword: true,
          },
          { status: 401 }
        )
      }

      // 비밀번호 해시 비교
      const isPasswordValid = await bcrypt.compare(
        body.password,
        comment.password || ''
      )

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: '비밀번호가 일치하지 않습니다' },
          { status: 403 }
        )
      }
    } else {
      // 회원 댓글: userId 일치 확인
      if (!isAuthenticated) {
        return NextResponse.json(
          { error: '로그인이 필요합니다' },
          { status: 401 }
        )
      }

      const currentUserId = session.user?.id || session.user?.email
      if (comment.userId !== currentUserId) {
        return NextResponse.json(
          { error: '본인의 댓글만 삭제할 수 있습니다' },
          { status: 403 }
        )
      }
    }

    // 댓글 삭제
    await commentsCollection.deleteOne({ _id: new ObjectId(commentId) })

    // 게시글의 commentCount 감소
    const postsCollection = await getCollection<PostDocument>(COLLECTIONS.POSTS)
    await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { commentCount: -1 } }
    )

    return NextResponse.json({
      success: true,
      message: '댓글이 삭제되었습니다',
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
