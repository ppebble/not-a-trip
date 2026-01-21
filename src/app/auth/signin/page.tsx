'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const {
    loginWithCredentials,
    loginWithProvider,
    isLoading,
    error,
    clearError,
  } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await loginWithCredentials(email, password)
    if (success) {
      router.push(callbackUrl)
    }
  }

  return (
    <div className="space-y-6 rounded-lg bg-slate-800 p-8">
      {/* 소셜 로그인 버튼 */}
      <div className="space-y-3">
        <button
          onClick={() => loginWithProvider('google')}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
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
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-slate-800 px-2 text-slate-400">또는</span>
        </div>
      </div>

      {/* 이메일 로그인 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500 bg-red-500/20 p-3 text-sm text-red-400">
            {error}
            <button onClick={clearError} className="ml-2 underline">
              닫기
            </button>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400">
        계정이 없으신가요?{' '}
        <Link href="/auth/register" className="text-blue-400 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">로그인</h1>
          <p className="mt-2 text-slate-400">
            Not a Trip에 오신 것을 환영합니다
          </p>
        </div>

        <Suspense
          fallback={
            <div className="rounded-lg bg-slate-800 p-8">
              <p className="text-center text-slate-400">로딩 중...</p>
            </div>
          }
        >
          <SignInForm />
        </Suspense>

        <div className="text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            ← 메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
