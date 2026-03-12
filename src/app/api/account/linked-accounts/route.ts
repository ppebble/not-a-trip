import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'

/**
 * GET /api/account/linked-accounts
 * 인증된 사용자의 연결된 계정 목록 조회
 * Requirements: 6.1, 6.3, 5.1
 */
export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const db = await getDb()
    const userId = new ObjectId(session.user.id)

    const [accounts, user] = await Promise.all([
      db
        .collection('accounts')
        .find({ userId })
        .project({ provider: 1, providerAccountId: 1, _id: 0 })
        .toArray(),
      db
        .collection('users')
        .findOne({ _id: userId }, { projection: { password: 1, email: 1 } }),
    ])

    const linkedAccounts = accounts.map((account) => ({
      provider: account.provider,
      providerAccountId: account.providerAccountId,
    }))

    return NextResponse.json({
      accounts: linkedAccounts,
      hasPassword: !!user?.password,
      email: user?.email || null,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Account] 연결된 계정 목록 조회 실패:', error)
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/account/linked-accounts
 * 지정된 프로바이더 연결 해제
 * Requirements: 6.2, 6.3, 6.4, 6.5, 5.5, 5.6, 8.4
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { provider, providerAccountId } = await request.json()
    if (!provider || !providerAccountId) {
      return NextResponse.json(
        { error: 'provider와 providerAccountId는 필수입니다.' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const userId = new ObjectId(session.user.id)

    // 해당 프로바이더 연결 존재 확인
    const existingAccount = await db
      .collection('accounts')
      .findOne({ userId, provider, providerAccountId })

    if (!existingAccount) {
      return NextResponse.json(
        { error: '연결된 계정을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 마지막 로그인 수단 보호: 연결된 계정 수 + 비밀번호 여부 확인
    const [accountCount, user] = await Promise.all([
      db.collection('accounts').countDocuments({ userId }),
      db
        .collection('users')
        .findOne({ _id: userId }, { projection: { password: 1 } }),
    ])

    const totalLoginMethods = accountCount + (user?.password ? 1 : 0)

    if (totalLoginMethods <= 1) {
      return NextResponse.json(
        { error: '최소 하나의 로그인 수단이 필요합니다.' },
        { status: 400 }
      )
    }

    // 프로바이더 연결 해제
    await db
      .collection('accounts')
      .deleteOne({ userId, provider, providerAccountId })

    // eslint-disable-next-line no-console
    console.log(
      `[Account Linking] 연결 해제 — userId: ${session.user.id}, provider: ${provider}`
    )

    return NextResponse.json({ message: '계정 연결이 해제되었습니다.' })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Account] 계정 연결 해제 실패:', error)
    return NextResponse.json(
      { error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
