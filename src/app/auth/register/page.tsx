'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nickname: '',
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 클라이언트 유효성 검사
    if (formData.password !== formData.confirmPassword) {
      setValidationError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 6) {
      setValidationError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    const success = await register({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      nickname: formData.nickname || undefined,
    })

    if (success) {
      router.push('/')
    }
  }

  const displayError = validationError || error

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-main-text">회원가입</h1>
          <p className="mt-2 text-sub-text">
            새 계정을 만들어 특별한 여행을 시작하세요
          </p>
        </div>

        <div className="rounded-lg bg-surface p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {displayError && (
              <div className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-500">
                {displayError}
                <button
                  type="button"
                  onClick={() => {
                    clearError()
                    setValidationError(null)
                  }}
                  className="ml-2 underline"
                >
                  닫기
                </button>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-main-text"
              >
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text placeholder-sub-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-main-text"
              >
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text placeholder-sub-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label
                htmlFor="nickname"
                className="mb-1 block text-sm font-medium text-main-text"
              >
                닉네임 <span className="text-sub-text">(선택)</span>
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                value={formData.nickname}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text placeholder-sub-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="커뮤니티에서 사용할 닉네임"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-main-text"
              >
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text placeholder-sub-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="최소 6자 이상"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-main-text"
              >
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text placeholder-sub-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-lg bg-primary py-3 text-white transition hover:bg-primary-600 disabled:opacity-50"
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-sub-text">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:underline"
            >
              로그인
            </Link>
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-sub-text transition-colors hover:text-main-text"
          >
            ← 메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
