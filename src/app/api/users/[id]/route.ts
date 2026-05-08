import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection, COLLECTIONS } from '@/lib/db'

/**
 * GET /api/users/[id] - 유저 기본 정보 조회
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    const usersCollection = await getCollection(COLLECTIONS.USERS)

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          _id: 1,
          name: 1,
          image: 1,
          createdAt: 1,
        },
      }
    )

    if (!user) {
      return NextResponse.json(
        { error: '유저를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      image: user.image || null,
      createdAt: user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : user.createdAt,
    })
  } catch (error) {
    console.error('Error fetching user info:', error)
    return NextResponse.json(
      { error: '유저 정보 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
