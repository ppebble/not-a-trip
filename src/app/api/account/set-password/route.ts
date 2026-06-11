import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { runtimeLogger } from '@/lib/runtime-logger'
import { validateNewPasswordSecurity } from '@/lib/security'

/**
 * POST /api/account/set-password
 * 소셜 전용 계정에 이메일(ID) + 비밀번호 설정
 * Requirements: 5.8, 6.3
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { email, password } = await request.json()

    // 이메일 검증
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 비밀번호 최소 6자 검증
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    const passwordSecurity = await validateNewPasswordSecurity(password)
    if (!passwordSecurity.ok) {
      return NextResponse.json(
        { error: passwordSecurity.error },
        { status: passwordSecurity.status }
      )
    }

    const db = await getDb()
    const userId = new ObjectId(session.user.id)

    // 이미 비밀번호가 설정된 경우
    const currentUser = await db
      .collection('users')
      .findOne({ _id: userId }, { projection: { password: 1 } })

    if (currentUser?.password) {
      return NextResponse.json(
        { error: '이미 비밀번호가 설정되어 있습니다.' },
        { status: 409 }
      )
    }

    // 이메일 중복 확인 (다른 사용자가 이미 사용 중인지)
    const emailDuplicate = await db
      .collection('users')
      .findOne({ email, _id: { $ne: userId } }, { projection: { _id: 1 } })

    if (emailDuplicate) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일(ID)입니다.' },
        { status: 409 }
      )
    }

    // 비밀번호 해싱 및 저장
    const hashedPassword = await bcrypt.hash(password, 12)

    await db.collection('users').updateOne(
      { _id: userId },
      {
        $set: {
          email,
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    )

    runtimeLogger.info(
      `[Account] 이메일/비밀번호 설정 — userId: ${session.user.id}`
    )

    return NextResponse.json({ message: '이메일과 비밀번호가 설정되었습니다.' })
  } catch (error) {
    runtimeLogger.error('[Account] 비밀번호 설정 실패:', error)
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
