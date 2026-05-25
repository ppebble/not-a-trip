import { NextRequest, NextResponse } from 'next/server'

import { getLoginLockoutStatus, sanitizePlainText } from '@/lib/security'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { email?: string }
    const email = sanitizePlainText(body.email).toLowerCase()

    if (!email) {
      return NextResponse.json(
        { error: '이메일이 필요합니다.' },
        { status: 400 }
      )
    }

    const status = await getLoginLockoutStatus(email)

    if (!status.locked || !status.lockedUntil) {
      return NextResponse.json({ locked: false })
    }

    return NextResponse.json(
      {
        locked: true,
        reason: 'too_many_failed_attempts',
        lockedUntil: status.lockedUntil.toISOString(),
        remainingSeconds: status.remainingSeconds ?? 0,
        message: `로그인이 잠겼습니다. ${status.lockedUntil.toISOString()} 이후 다시 시도해주세요.`,
      },
      { status: 423 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '로그인 상태를 확인하지 못했습니다.',
      },
      { status: 500 }
    )
  }
}
