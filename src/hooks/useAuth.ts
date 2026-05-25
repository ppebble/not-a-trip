'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useCallback, useState } from 'react'
import { API_ROUTES } from '@/lib/api-routes'
import { useAuthStore } from '@/stores/authStore'

interface RegisterData {
  email: string
  password: string
  name: string
  nickname?: string
}

interface AuthError {
  error: string
}

interface LoginStatusResponse {
  locked: boolean
  reason?: string
  lockedUntil?: string
  remainingSeconds?: number
  message?: string
}

export function useAuth() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  // 전역 스토어에서 인증 UI 상태 가져오기
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut)
  const error = useAuthStore((state) => state.authError)
  const setLoggingOut = useAuthStore((state) => state.setLoggingOut)
  const setAuthError = useAuthStore((state) => state.setAuthError)
  const clearAuthError = useAuthStore((state) => state.clearAuthError)

  // 낙관적 업데이트: 로그아웃 중이면 인증되지 않은 것으로 처리
  const isAuthenticated = status === 'authenticated' && !isLoggingOut
  const isLoadingSession = status === 'loading'

  // 이메일/비밀번호 로그인
  const loginWithCredentials = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      clearAuthError()

      try {
        const statusResponse = await fetch('/api/auth/login-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })

        if (!statusResponse.ok) {
          const statusResult =
            (await statusResponse.json()) as LoginStatusResponse & AuthError

          if (statusResponse.status === 423 && statusResult.locked) {
            setAuthError(
              statusResult.message ||
                '로그인이 잠겼습니다. 잠시 후 다시 시도해주세요.'
            )
            return false
          }
        }

        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setAuthError('이메일 또는 비밀번호가 올바르지 않습니다.')
          return false
        }

        return true
      } catch {
        setAuthError('로그인 중 오류가 발생했습니다.')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [clearAuthError, setAuthError]
  )

  // 소셜 로그인
  const loginWithProvider = useCallback(
    async (provider: 'google' | 'kakao' | 'naver' | 'twitter') => {
      setIsLoading(true)
      clearAuthError()

      try {
        await signIn(provider, { callbackUrl: '/' })
      } catch {
        setAuthError('소셜 로그인 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    },
    [clearAuthError, setAuthError]
  )

  // 회원가입
  const register = useCallback(
    async (data: RegisterData) => {
      setIsLoading(true)
      clearAuthError()

      try {
        const response = await fetch(API_ROUTES.AUTH.REGISTER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!response.ok) {
          setAuthError(
            (result as AuthError).error || '회원가입에 실패했습니다.'
          )
          return false
        }

        // 회원가입 성공 후 자동 로그인
        return await loginWithCredentials(data.email, data.password)
      } catch {
        setAuthError('회원가입 중 오류가 발생했습니다.')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [loginWithCredentials, clearAuthError, setAuthError]
  )

  // 로그아웃 (낙관적 업데이트 적용)
  const logout = useCallback(async () => {
    // 즉시 로그아웃 상태로 전환하여 UI 업데이트
    setLoggingOut(true)
    // 백그라운드에서 실제 로그아웃 처리
    signOut({ callbackUrl: '/' })
  }, [setLoggingOut])

  // 에러 초기화
  const clearError = useCallback(() => {
    clearAuthError()
  }, [clearAuthError])

  return {
    user: isLoggingOut ? null : session?.user,
    session: isLoggingOut ? null : session,
    isAuthenticated,
    isLoading: isLoading || isLoadingSession,
    isLoggingOut,
    error,
    loginWithCredentials,
    loginWithProvider,
    register,
    logout,
    clearError,
  }
}
