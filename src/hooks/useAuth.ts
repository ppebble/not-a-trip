'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useCallback, useState } from 'react'

interface RegisterData {
  email: string
  password: string
  name: string
  nickname?: string
}

interface AuthError {
  error: string
}

export function useAuth() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = status === 'authenticated'
  const isLoadingSession = status === 'loading'

  // 이메일/비밀번호 로그인
  const loginWithCredentials = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.')
          return false
        }

        return true
      } catch {
        setError('로그인 중 오류가 발생했습니다.')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // 소셜 로그인
  const loginWithProvider = useCallback(
    async (provider: 'google' | 'kakao' | 'naver') => {
      setIsLoading(true)
      setError(null)

      try {
        await signIn(provider, { callbackUrl: '/' })
      } catch {
        setError('소셜 로그인 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // 회원가입
  const register = useCallback(
    async (data: RegisterData) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!response.ok) {
          setError((result as AuthError).error || '회원가입에 실패했습니다.')
          return false
        }

        // 회원가입 성공 후 자동 로그인
        return await loginWithCredentials(data.email, data.password)
      } catch {
        setError('회원가입 중 오류가 발생했습니다.')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [loginWithCredentials]
  )

  // 로그아웃
  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await signOut({ callbackUrl: '/' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    user: session?.user,
    isAuthenticated,
    isLoading: isLoading || isLoadingSession,
    error,
    loginWithCredentials,
    loginWithProvider,
    register,
    logout,
    clearError,
  }
}
