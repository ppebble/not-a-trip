import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'

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
      createdAt:
        user.createdAt instanceof Date
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

/**
 * PUT /api/users/[id] - 유저 프로필 업데이트
 * Requirements: 9.9, 9.10, 9.11
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    // 세션 검증
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    // 권한 확인
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: '본인의 프로필만 수정할 수 있습니다' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, image } = body

    // 이름 유효성 검사
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { error: '이름을 입력해주세요' },
          { status: 400 }
        )
      }
      if (name.trim().length > 50) {
        return NextResponse.json(
          { error: '이름은 50자 이내로 입력해주세요' },
          { status: 400 }
        )
      }
    }

    const usersCollection = await getCollection(COLLECTIONS.USERS)

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return NextResponse.json(
        { error: '유저를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (name !== undefined) updateData.name = name.trim()
    if (image !== undefined) updateData.image = image

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )

    const updatedUser = await usersCollection.findOne({
      _id: new ObjectId(userId),
    })

    return NextResponse.json({
      id: updatedUser!._id.toString(),
      name: updatedUser!.name,
      image: updatedUser!.image || null,
      updatedAt:
        updatedUser!.updatedAt instanceof Date
          ? updatedUser!.updatedAt.toISOString()
          : updatedUser!.updatedAt,
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: '프로필 업데이트에 실패했습니다' },
      { status: 500 }
    )
  }
}
