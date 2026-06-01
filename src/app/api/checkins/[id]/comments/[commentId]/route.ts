import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'

const CHECKIN_ID_PATTERN = /^CHECKIN-\d+$/

interface CheckInCommentDocument {
  _id: ObjectId
  checkInId: string
  userId: string
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
): Promise<NextResponse> {
  try {
    const { id, commentId } = await params

    if (!CHECKIN_ID_PATTERN.test(id)) {
      return NextResponse.json(
        { error: 'Invalid check-in ID' },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 })
    }

    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json(
        { error: 'Login is required to delete check-in comments' },
        { status: 401 }
      )
    }

    const commentsCollection = await getCollection<CheckInCommentDocument>(
      COLLECTIONS.CHECKIN_COMMENTS
    )
    const comment = await commentsCollection.findOne({
      _id: new ObjectId(commentId),
      checkInId: id,
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.userId !== userId) {
      return NextResponse.json(
        { error: 'Only the comment owner can delete this comment' },
        { status: 403 }
      )
    }

    await commentsCollection.deleteOne({ _id: new ObjectId(commentId) })

    return NextResponse.json({ success: true })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting check-in comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete check-in comment' },
      { status: 500 }
    )
  }
}
