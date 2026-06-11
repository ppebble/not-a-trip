import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'
import { runtimeLogger } from '@/lib/runtime-logger'
import {
  getClientIp,
  logIfSanitized,
  sanitizeOptionalPlainText,
  sanitizePlainText,
  validateNewPasswordSecurity,
} from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ip = getClientIp(request)
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase()
    const password = typeof body.password === 'string' ? body.password : ''
    const name = sanitizePlainText(body.name)
    const nickname = sanitizeOptionalPlainText(body.nickname) ?? name

    await Promise.all([
      logIfSanitized({
        label: 'register.name',
        before: body.name,
        after: name,
        ip,
      }),
      logIfSanitized({
        label: 'register.nickname',
        before: body.nickname,
        after: nickname,
        ip,
      }),
    ])

    // 유효성 검사
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '이메일, 비밀번호, 이름은 필수입니다.' },
        { status: 400 }
      )
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 길이 검사
    if (password.length < 6) {
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

    // 이메일 중복 확인
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 409 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12)

    // 사용자 생성
    const now = new Date()
    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      name,
      nickname: nickname || name,
      image: null,
      provider: 'credentials',
      emailVerified: null,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json(
      {
        message: '회원가입이 완료되었습니다.',
        userId: result.insertedId.toString(),
      },
      { status: 201 }
    )
  } catch (error) {
    runtimeLogger.error('회원가입 에러:', error)
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
