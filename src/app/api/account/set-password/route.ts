import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'

/**
 * POST /api/account/set-password
 * 소셜 전용 계정에 비밀번호 설정
 * Requirements: 5.8, 6.3
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { password } = await request.json()

    // 비밀번호 최소 6자 검증
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const userId = new ObjectId(session.user.id)

    // 이미 비밀번호가 설정되어 있는지 확인
    const user = await db
      .collection('users')
      .findOne({ _id: userId }, { projection: { password: 1 } })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (user.password) {
      return NextResponse.json(
        { error: '이미 비밀번호가 설정되어 있습니다.' },
        { status: 409 }
      )
    }

    // 비밀번호 해싱 및 저장
    const hashedPassword = await bcrypt.hash(password, 12)

    await db.collection('users').updateOne(
      { _id: userId },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ message: '비밀번호가 설정되었습니다.' })
  } catch (error) {
    console.error('[Account] 비밀번호 설정 실패:', error)
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
