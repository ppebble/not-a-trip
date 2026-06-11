import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { runtimeLogger } from '@/lib/runtime-logger'
import { validateNewPasswordSecurity } from '@/lib/security'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const currentPassword =
      typeof body.currentPassword === 'string' ? body.currentPassword : ''
    const newPassword =
      typeof body.newPassword === 'string' ? body.newPassword : ''

    if (!currentPassword) {
      return NextResponse.json(
        { error: '현재 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '새 비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: '기존과 다른 새 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const userId = new ObjectId(session.user.id)
    const user = await db
      .collection('users')
      .findOne({ _id: userId }, { projection: { password: 1 } })

    if (!user?.password) {
      return NextResponse.json(
        { error: '이 계정에는 비밀번호가 설정되어 있지 않습니다.' },
        { status: 409 }
      )
    }

    const currentPasswordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    )

    if (!currentPasswordMatches) {
      return NextResponse.json(
        { error: '현재 비밀번호가 일치하지 않습니다.' },
        { status: 400 }
      )
    }

    const passwordSecurity = await validateNewPasswordSecurity(newPassword)
    if (!passwordSecurity.ok) {
      return NextResponse.json(
        { error: passwordSecurity.error },
        { status: passwordSecurity.status }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await db.collection('users').updateOne(
      { _id: userId },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    )

    runtimeLogger.info(
      `[Account] 비밀번호 변경 완료 — userId: ${session.user.id}`
    )

    return NextResponse.json({ message: '비밀번호가 변경되었습니다.' })
  } catch (error) {
    runtimeLogger.error('[Account] 비밀번호 변경 실패:', error)
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
