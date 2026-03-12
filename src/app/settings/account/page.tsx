'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts'

// 지원하는 OAuth 프로바이더 목록
const OAUTH_PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    color: 'bg-white text-gray-700 hover:bg-gray-100',
  },
  {
    id: 'kakao',
    name: '카카오',
    color: 'bg-[#FEE500] text-[#191919] hover:bg-[#FDD800]',
  },
  {
    id: 'naver',
    name: '네이버',
    color: 'bg-[#03C75A] text-white hover:bg-[#02B350]',
  },
  {
    id: 'twitter',
    name: 'X(Twitter)',
    color: 'bg-black text-white hover:bg-gray-900',
  },
] as const

export default function AccountSettingsPage() {
  const { status } = useSession()
  const router = useRouter()

  // 미인증 시 로그인 페이지로 리다이렉트
  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/settings/account')
    return null
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-slate-400">로딩 중...</p>
      </div>
    )
  }

  return <AccountSettingsContent />
}

// ── 프로바이더 아이콘 ────────────────────────────────────────

function ProviderIcon({ provider }: { provider: string }) {
  switch (provider) {
    case 'google':
      return (
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
      )
    case 'kakao':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#191919">
          <path d="M12 3C6.48 3 2 6.48 2 10.5c0 2.52 1.64 4.74 4.12 6.03-.18.65-.65 2.35-.74 2.72-.12.47.17.46.36.34.15-.1 2.37-1.6 3.32-2.25.62.09 1.26.14 1.94.14 5.52 0 10-3.48 10-7.98S17.52 3 12 3z" />
        </svg>
      )
    case 'naver':
      return <span className="text-lg font-bold text-[#03C75A]">N</span>
    case 'twitter':
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    default:
      return <span className="text-lg">🔑</span>
  }
}

// ── 비밀번호 설정 폼 ────────────────────────────────────────

function SetPasswordForm({
  onSubmit,
  isPending,
  error,
}: {
  onSubmit: (password: string) => Promise<void>
  isPending: boolean
  error: string | null
}) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    setSuccess(false)

    if (password.length < 6) {
      setValidationError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }
    if (password !== confirmPassword) {
      setValidationError('비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      await onSubmit(password)
      setPassword('')
      setConfirmPassword('')
      setSuccess(true)
    } catch {
      // error는 상위에서 처리
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="new-password"
          className="mb-1 block text-sm font-medium text-slate-300"
        >
          비밀번호
        </label>
        <input
          id="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="최소 6자 이상"
        />
      </div>
      <div>
        <label
          htmlFor="confirm-password"
          className="mb-1 block text-sm font-medium text-slate-300"
        >
          비밀번호 확인
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="비밀번호 재입력"
        />
      </div>

      {(validationError || error) && (
        <p className="rounded-lg border border-red-500 bg-red-500/20 p-3 text-sm text-red-400">
          {validationError || error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-green-500 bg-green-500/20 p-3 text-sm text-green-400">
          비밀번호가 설정되었습니다.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? '설정 중...' : '비밀번호 설정'}
      </button>
    </form>
  )
}

// ── 메인 콘텐츠 ─────────────────────────────────────────────

function AccountSettingsContent() {
  const { data: session } = useSession()
  const user = session?.user
  const {
    accounts,
    hasPassword,
    isLoading,
    linkAccount,
    unlinkAccount,
    isUnlinking,
    unlinkError,
    setPassword,
    isSettingPassword,
    setPasswordError,
  } = useLinkedAccounts()

  const [actionError, setActionError] = useState<string | null>(null)

  const handleUnlink = async (provider: string, providerAccountId: string) => {
    setActionError(null)
    try {
      await unlinkAccount(provider, providerAccountId)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '연결 해제 실패')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-slate-400">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 pb-20 pt-20">
      <div className="mx-auto max-w-lg space-y-6">
        {/* 프로필 카드 */}
        <div className="flex items-center gap-4 rounded-lg bg-slate-800 p-6">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name || '프로필'}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
              referrerPolicy="no-referrer"
              unoptimized
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
              {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-white">
              {user?.name || '사용자'}
            </h1>
            <p className="text-sm text-slate-400">{user?.email || ''}</p>
          </div>
        </div>

        {/* 에러 메시지 */}
        {(actionError || unlinkError) && (
          <div className="rounded-lg border border-red-500 bg-red-500/20 p-3 text-sm text-red-400">
            {actionError || unlinkError}
          </div>
        )}

        {/* 연결된 계정 목록 */}
        <div className="rounded-lg bg-slate-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">연결된 계정</h2>
          <div className="space-y-3">
            {OAUTH_PROVIDERS.map((provider) => {
              const linked = accounts.find((a) => a.provider === provider.id)
              const isLinked = !!linked

              return (
                <div
                  key={provider.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 p-4"
                >
                  <div className="flex items-center gap-3">
                    <ProviderIcon provider={provider.id} />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {provider.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isLinked ? '연결됨' : '미연결'}
                      </p>
                    </div>
                  </div>

                  {isLinked ? (
                    <button
                      onClick={() =>
                        handleUnlink(provider.id, linked.providerAccountId)
                      }
                      disabled={isUnlinking}
                      className="rounded-lg border border-red-500/50 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {isUnlinking ? '해제 중...' : '연결 해제'}
                    </button>
                  ) : (
                    <button
                      onClick={() => linkAccount(provider.id)}
                      className="rounded-lg border border-blue-500/50 px-3 py-1.5 text-sm text-blue-400 transition hover:bg-blue-500/10"
                    >
                      연결하기
                    </button>
                  )}
                </div>
              )
            })}

            {/* 이메일/비밀번호 상태 표시 */}
            <div className="flex items-center justify-between rounded-lg border border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔑</span>
                <div>
                  <p className="text-sm font-medium text-white">
                    이메일/비밀번호
                  </p>
                  <p className="text-xs text-slate-400">
                    {hasPassword ? '설정됨' : '미설정'}
                  </p>
                </div>
              </div>
              {hasPassword && (
                <span className="rounded-lg bg-green-500/20 px-3 py-1.5 text-sm text-green-400">
                  활성
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 비밀번호 설정 폼 (소셜 전용 계정만) */}
        {!hasPassword && (
          <div className="rounded-lg bg-slate-800 p-6">
            <h2 className="mb-2 text-lg font-semibold text-white">
              비밀번호 설정
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              비밀번호를 설정하면 이메일/비밀번호로도 로그인할 수 있습니다.
            </p>
            <SetPasswordForm
              onSubmit={setPassword}
              isPending={isSettingPassword}
              error={setPasswordError}
            />
          </div>
        )}

        {/* 돌아가기 링크 */}
        <div className="text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            ← 메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
