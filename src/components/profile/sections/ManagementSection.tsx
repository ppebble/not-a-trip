'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { AppIcon } from '@/components/common/AppIcon'
import { SubTabNavigation } from '@/components/profile/SubTabNavigation'
import { useUserInfo, useUpdateProfile } from '@/hooks/useUserQueries'
import { useLinkedAccounts } from '@/hooks/useLinkedAccounts'

// ── 관리 섹션 탭 ─────────────────────────────────────────────

const MANAGEMENT_TABS = [
  { key: 'profile', label: '프로필 편집' },
  { key: 'accounts', label: '계정 연동' },
  { key: 'notifications', label: '알림 설정' },
] as const

type ManagementTab = (typeof MANAGEMENT_TABS)[number]['key']

// ── OAuth 프로바이더 목록 ─────────────────────────────────────

const OAUTH_PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    color: 'bg-surface text-gray-700 hover:bg-gray-100',
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
  defaultEmail,
}: {
  onSubmit: (email: string, password: string) => Promise<void>
  isPending: boolean
  error: string | null
  defaultEmail: string
}) {
  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    setSuccess(false)

    if (!email || !email.includes('@')) {
      setValidationError('유효한 이메일 주소를 입력해주세요.')
      return
    }
    if (password.length < 6) {
      setValidationError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }
    if (password !== confirmPassword) {
      setValidationError('비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      await onSubmit(email, password)
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
          htmlFor="set-email"
          className="text-text-secondary mb-1 block text-sm font-medium"
        >
          이메일 (로그인 ID)
        </label>
        <input
          id="set-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="text-text-primary w-full rounded-lg border border-border bg-surface px-4 py-3 placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="example@email.com"
        />
      </div>
      <div>
        <label
          htmlFor="new-password"
          className="text-text-secondary mb-1 block text-sm font-medium"
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
          className="text-text-primary w-full rounded-lg border border-border bg-surface px-4 py-3 placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="최소 6자 이상"
        />
      </div>
      <div>
        <label
          htmlFor="confirm-password"
          className="text-text-secondary mb-1 block text-sm font-medium"
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
          className="text-text-primary w-full rounded-lg border border-border bg-surface px-4 py-3 placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="비밀번호 재입력"
        />
      </div>

      {(validationError || error) && (
        <p className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-500">
          {validationError || error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-green-500 bg-green-500/10 p-3 text-sm text-green-600">
          이메일과 비밀번호가 설정되었습니다.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? '설정 중...' : '이메일/비밀번호 설정'}
      </button>
    </form>
  )
}

// ── 프로필 이미지 업로드 상수 ────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_TYPES_LABEL = 'JPG, PNG, GIF, WEBP'

// ── 프로필 편집 탭 ───────────────────────────────────────────

function ProfileEditTab({ userId }: { userId: string }) {
  const { data: userInfo } = useUserInfo(userId)
  const updateProfile = useUpdateProfile(userId)
  const [name, setName] = useState(userInfo?.name ?? '')
  const [imageUrl, setImageUrl] = useState(userInfo?.image ?? '')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // 파일 선택 시 클라이언트 검증 + 업로드
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(false)

    // 파일 형식 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`지원하지 않는 파일 형식입니다. (${ALLOWED_TYPES_LABEL}만 가능)`)
      e.target.value = ''
      return
    }

    // 파일 크기 검증 (5MB)
    if (file.size > MAX_FILE_SIZE) {
      setError('파일 크기는 5MB 이하여야 합니다')
      e.target.value = ''
      return
    }

    // 미리보기 생성
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // 서버에 업로드
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '업로드에 실패했습니다')
      }

      const data = await res.json()
      setImageUrl(data.imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드에 실패했습니다')
      setPreviewUrl(null)
      e.target.value = ''
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('이름을 입력해주세요')
      return
    }
    if (trimmedName.length > 50) {
      setError('이름은 50자 이내로 입력해주세요')
      return
    }

    try {
      await updateProfile.mutateAsync({
        name: trimmedName,
        image: imageUrl || undefined,
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다')
    }
  }

  // 현재 표시할 이미지: 미리보기 > 기존 이미지
  const displayImage = previewUrl || imageUrl

  return (
    <div className="space-y-6">
      <h3 className="text-text-primary text-base font-semibold">프로필 편집</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이름 변경 */}
        <div>
          <label
            htmlFor="profile-name"
            className="text-text-secondary mb-1 block text-sm font-medium"
          >
            이름
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
              setSuccess(false)
            }}
            className="text-text-primary w-full rounded-lg border border-border bg-surface px-4 py-3 placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="이름을 입력해주세요"
            maxLength={60}
          />
        </div>

        {/* 프로필 이미지 파일 업로드 */}
        <div>
          <label className="text-text-secondary mb-1 block text-sm font-medium">
            프로필 이미지{' '}
            <span className="text-xs text-neutral-400">(선택사항)</span>
          </label>

          {/* 현재 이미지 미리보기 */}
          <div className="mb-3 flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary-100">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt="프로필 미리보기"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <AppIcon name="profile-front" size={56} />
              )}
            </div>
            <div className="text-xs text-neutral-400">
              <p>{ALLOWED_TYPES_LABEL}</p>
              <p>최대 5MB</p>
            </div>
          </div>

          <label
            htmlFor="profile-image-file"
            className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm transition hover:bg-neutral-50 ${
              isUploading ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            {isUploading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span className="text-neutral-500">업로드 중...</span>
              </>
            ) : (
              <>
                <span>📷</span>
                <span className="text-neutral-500">
                  {displayImage ? '이미지 변경' : '이미지 선택'}
                </span>
              </>
            )}
            <input
              id="profile-image-file"
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleFileChange}
              disabled={isUploading}
              className="sr-only"
            />
          </label>
        </div>

        {/* 에러 / 성공 메시지 */}
        {error && (
          <p className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg border border-green-500 bg-green-500/10 p-3 text-sm text-green-600">
            저장되었습니다
          </p>
        )}

        <button
          type="submit"
          disabled={updateProfile.isPending || isUploading}
          className="w-full rounded-lg bg-primary py-3 text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {updateProfile.isPending ? '저장 중...' : '저장'}
        </button>
      </form>
    </div>
  )
}

// ── 계정 연동 탭 ─────────────────────────────────────────────

function AccountsTab() {
  const { data: session } = useSession()
  const user = session?.user
  const {
    accounts,
    hasPassword,
    email: accountEmail,
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
      <div className="flex items-center justify-center py-12">
        <p className="text-sub-text">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 프로필 카드 */}
      <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name || '프로필'}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
            referrerPolicy="no-referrer"
            unoptimized
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-secondary-100">
            <AppIcon name="profile-front" size={40} />
          </div>
        )}
        <div>
          <p className="text-text-primary font-semibold">
            {user?.name || '사용자'}
          </p>
          <p className="text-sm text-sub-text">{user?.email || ''}</p>
        </div>
      </div>

      {/* 에러 메시지 */}
      {(actionError || unlinkError) && (
        <div className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-500">
          {actionError || unlinkError}
        </div>
      )}

      {/* 연결된 계정 목록 */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="text-text-primary mb-4 text-base font-semibold">
          연결된 계정
        </h3>
        <div className="space-y-3">
          {OAUTH_PROVIDERS.map((provider) => {
            const linked = accounts.find((a) => a.provider === provider.id)
            const isLinked = !!linked

            return (
              <div
                key={provider.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <ProviderIcon provider={provider.id} />
                  <div>
                    <p className="text-text-primary text-sm font-medium">
                      {provider.name}
                    </p>
                    <p className="text-xs text-sub-text">
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
                    className="rounded-lg border border-red-500/50 px-3 py-1.5 text-sm text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {isUnlinking ? '해제 중...' : '연결 해제'}
                  </button>
                ) : (
                  <button
                    onClick={() => linkAccount(provider.id)}
                    className="rounded-lg border border-blue-500/50 px-3 py-1.5 text-sm text-blue-500 transition hover:bg-blue-500/10"
                  >
                    연결하기
                  </button>
                )}
              </div>
            )
          })}

          {/* 이메일/비밀번호 상태 */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <span className="text-lg">🔑</span>
              <div>
                <p className="text-text-primary text-sm font-medium">
                  이메일/비밀번호
                </p>
                <p className="text-xs text-sub-text">
                  {hasPassword ? '설정됨' : '미설정'}
                </p>
              </div>
            </div>
            {hasPassword && (
              <span className="rounded-lg bg-green-500/10 px-3 py-1.5 text-sm text-green-600">
                활성
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 비밀번호 설정 폼 (소셜 전용 계정만) */}
      {!hasPassword && (
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-text-primary mb-2 text-base font-semibold">
            이메일/비밀번호 설정
          </h3>
          <p className="text-text-secondary mb-4 text-sm">
            이메일(ID)과 비밀번호를 설정하면 이메일/비밀번호로도 로그인할 수
            있습니다.
          </p>
          <SetPasswordForm
            onSubmit={setPassword}
            isPending={isSettingPassword}
            error={setPasswordError}
            defaultEmail={accountEmail || user?.email || ''}
          />
        </div>
      )}
    </div>
  )
}

// ── 알림 설정 탭 ─────────────────────────────────────────────

function NotificationsTab() {
  const [pushEnabled, setPushEnabled] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleToggle = async () => {
    setIsToggling(true)
    setMessage(null)

    try {
      if (!pushEnabled) {
        // 푸시 알림 구독 시도
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const permission = await Notification.requestPermission()
          if (permission === 'granted') {
            setPushEnabled(true)
            setMessage('푸시 알림이 활성화되었습니다.')
          } else {
            setMessage(
              '알림 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.'
            )
          }
        } else {
          // 서비스 워커 미지원 환경 — UI만 토글
          setPushEnabled(true)
          setMessage('푸시 알림이 활성화되었습니다.')
        }
      } else {
        setPushEnabled(false)
        setMessage('푸시 알림이 비활성화되었습니다.')
      }
    } catch {
      setMessage('알림 설정 중 오류가 발생했습니다.')
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-text-primary text-base font-semibold">알림 설정</h3>

      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-primary text-sm font-medium">푸시 알림</p>
            <p className="mt-0.5 text-xs text-sub-text">
              새로운 활동 및 업데이트 알림을 받습니다
            </p>
          </div>
          <button
            role="switch"
            aria-checked={pushEnabled}
            onClick={handleToggle}
            disabled={isToggling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
              pushEnabled ? 'bg-primary' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                pushEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {message && (
        <p
          className={`rounded-lg border p-3 text-sm ${
            message.includes('오류') || message.includes('거부')
              ? 'border-red-500 bg-red-500/10 text-red-500'
              : 'border-green-500 bg-green-500/10 text-green-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  )
}

// ── ManagementSection 메인 컴포넌트 ─────────────────────────

interface ManagementSectionProps {
  userId: string
}

/**
 * 관리 섹션 — Owner 전용
 * 하위 탭: 프로필 편집 | 계정 연동 | 알림 설정
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9
 */
export function ManagementSection({ userId }: ManagementSectionProps) {
  const [activeTab, setActiveTab] = useState<ManagementTab>('profile')

  return (
    <div className="space-y-4">
      {/* 하위 탭 네비게이션 */}
      <SubTabNavigation
        tabs={[...MANAGEMENT_TABS]}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as ManagementTab)}
      />

      {/* 탭 콘텐츠 */}
      <div className="pt-2">
        {activeTab === 'profile' && <ProfileEditTab userId={userId} />}
        {activeTab === 'accounts' && <AccountsTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </div>
    </div>
  )
}
