'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

const oauthErrorMessages: Record<string, string> = {
  OAuthAccountNotLinked:
    '이미 다른 로그인 방식으로 가입된 이메일입니다. 기존 방식으로 로그인한 후 계정 설정에서 소셜 계정을 연결해주세요.',
  OAuthSignin: '소셜 로그인 시작 중 오류가 발생했습니다.',
  OAuthCallback: '소셜 로그인 처리 중 오류가 발생했습니다.',
  OAuthCreateAccount: '소셜 계정 생성 중 오류가 발생했습니다.',
  Callback: '콜백 처리 중 오류가 발생했습니다.',
  AccessDenied: '접근이 거부되었습니다.',
  Configuration: '서버 설정에 문제가 있습니다. 관리자에게 문의하세요.',
}

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const urlError = searchParams.get('error')
  const {
    loginWithCredentials,
    loginWithProvider,
    isLoading,
    error,
    clearError,
  } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // OAuth 에러 파라미터가 URL에 있으면 해당 메시지 표시
  const oauthError = urlError ? oauthErrorMessages[urlError] : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await loginWithCredentials(email, password)
    if (success) {
      router.push(callbackUrl)
    }
  }

  return (
    <div className="space-y-6 rounded-lg bg-surface p-8 shadow-xl">
      {/* 소셜 로그인 버튼 */}
      <div className="space-y-3">
        <button
          onClick={() => loginWithProvider('google')}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-surface px-4 py-3 text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 로그인
        </button>

        <button
          onClick={() => loginWithProvider('kakao')}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#FEE500] px-4 py-3 text-[#191919] transition hover:bg-[#FDD800] disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.48 3 2 6.48 2 10.5c0 2.52 1.64 4.74 4.12 6.03-.18.65-.65 2.35-.74 2.72-.12.47.17.46.36.34.15-.1 2.37-1.6 3.32-2.25.62.09 1.26.14 1.94.14 5.52 0 10-3.48 10-7.98S17.52 3 12 3z" />
          </svg>
          카카오로 로그인
        </button>

        <button
          onClick={() => loginWithProvider('naver')}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#03C75A] px-4 py-3 text-white transition hover:bg-[#02B350] disabled:opacity-50"
        >
          <span className="text-lg font-bold">N</span>
          네이버로 로그인
        </button>

        <button
          onClick={() => loginWithProvider('twitter')}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-black px-4 py-3 text-white transition hover:bg-neutral-900 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X(Twitter)로 로그인
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-surface px-2 text-sub-text">또는</span>
        </div>
      </div>

      {/* 이메일 로그인 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || oauthError) && (
          <div className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-500">
            {oauthError || error}
            {error && !oauthError && (
              <button onClick={clearError} className="ml-2 underline">
                닫기
              </button>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-main-text"
          >
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text placeholder-sub-text focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-main-text"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-main-text placeholder-sub-text focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary py-3 text-white transition hover:bg-primary-600 disabled:opacity-50"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="text-center text-sm text-sub-text">
        계정이 없으신가요?{' '}
        <Link
          href="/auth/register"
          className="font-medium text-primary hover:underline"
        >
          회원가입
        </Link>
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-main-text">로그인</h1>
          <p className="mt-2 text-sub-text">
            Not a Trip에 오신 것을 환영합니다
          </p>
        </div>

        <Suspense
          fallback={
            <div className="rounded-lg bg-surface p-8 shadow-md">
              <p className="text-center text-sub-text">로딩 중...</p>
            </div>
          }
        >
          <SignInForm />
        </Suspense>

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
