'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const errorMessages: Record<string, string> = {
  Configuration: '서버 설정에 문제가 있습니다. 관리자에게 문의하세요.',
  AccessDenied: '접근이 거부되었습니다.',
  Verification: '인증 링크가 만료되었거나 이미 사용되었습니다.',
  Default: '인증 중 오류가 발생했습니다.',
  OAuthSignin: '소셜 로그인 시작 중 오류가 발생했습니다.',
  OAuthCallback: '소셜 로그인 처리 중 오류가 발생했습니다.',
  OAuthCreateAccount: '소셜 계정 생성 중 오류가 발생했습니다.',
  EmailCreateAccount: '이메일 계정 생성 중 오류가 발생했습니다.',
  Callback: '콜백 처리 중 오류가 발생했습니다.',
  OAuthAccountNotLinked:
    '이미 다른 로그인 방식으로 가입된 이메일입니다. 기존 방식으로 로그인한 후 계정 설정에서 소셜 계정을 연결해주세요.',
  EmailSignin: '이메일 전송 중 오류가 발생했습니다.',
  CredentialsSignin: '이메일 또는 비밀번호가 올바르지 않습니다.',
  SessionRequired: '이 페이지에 접근하려면 로그인이 필요합니다.',
  EmailNotVerified:
    '이메일이 검증되지 않은 소셜 계정은 연결할 수 없습니다. 해당 소셜 서비스에서 이메일 인증을 완료한 후 다시 시도해주세요.',
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessage = error
    ? errorMessages[error] || errorMessages.Default
    : errorMessages.Default

  return (
    <div className="rounded-lg bg-slate-800 p-8">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
        <svg
          className="h-8 w-8 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-white">인증 오류</h1>
      <p className="mb-6 text-slate-400">{errorMessage}</p>

      <div className="space-y-3">
        <Link
          href="/auth/signin"
          className="block w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700"
        >
          다시 로그인하기
        </Link>
        <Link
          href="/"
          className="block w-full rounded-lg bg-slate-700 py-3 text-white transition hover:bg-slate-600"
        >
          메인으로 돌아가기
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <Suspense
          fallback={
            <div className="rounded-lg bg-slate-800 p-8">
              <p className="text-slate-400">로딩 중...</p>
            </div>
          }
        >
          <ErrorContent />
        </Suspense>
      </div>
    </div>
  )
}
