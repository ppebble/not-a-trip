'use client'

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { signIn } from 'next-auth/react'
import { API_ROUTES } from '@/lib/api-routes'

// ── Types ───────────────────────────────────────────────────

interface LinkedAccount {
  provider: string
  providerAccountId: string
}

interface LinkedAccountsResponse {
  accounts: LinkedAccount[]
  hasPassword: boolean
  email: string | null
}

interface UnlinkError {
  error: string
}

interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

// ── Query Keys ──────────────────────────────────────────────

export const linkedAccountKeys = {
  all: ['linkedAccounts'] as const,
  list: () => [...linkedAccountKeys.all, 'list'] as const,
}

// ── Hook ────────────────────────────────────────────────────

/**
 * 계정 연동 관리 훅
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export function useLinkedAccounts() {
  const queryClient = useQueryClient()

  // 연결된 계정 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: linkedAccountKeys.list(),
    queryFn: async (): Promise<LinkedAccountsResponse> => {
      const res = await fetch(API_ROUTES.ACCOUNT.LINKED_ACCOUNTS)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '계정 목록 조회 실패')
      }
      return res.json()
    },
  })

  // 연결 해제 mutation
  const unlinkMutation = useMutation({
    mutationFn: async ({
      provider,
      providerAccountId,
    }: {
      provider: string
      providerAccountId: string
    }) => {
      const res = await fetch(API_ROUTES.ACCOUNT.LINKED_ACCOUNTS, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, providerAccountId }),
      })
      if (!res.ok) {
        const data: UnlinkError = await res.json()
        throw new Error(data.error || '연결 해제 실패')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedAccountKeys.all })
    },
  })

  // 이메일/비밀번호 설정 mutation
  const setPasswordMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string
      password: string
    }) => {
      const res = await fetch(API_ROUTES.ACCOUNT.SET_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data: UnlinkError = await res.json()
        throw new Error(data.error || '비밀번호 설정 실패')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedAccountKeys.all })
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: ChangePasswordInput) => {
      const res = await fetch(API_ROUTES.ACCOUNT.CHANGE_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!res.ok) {
        const data: UnlinkError = await res.json()
        throw new Error(data.error || '비밀번호 변경 실패')
      }
      return res.json()
    },
  })

  // 계정 연결 래퍼 (signIn 호출)
  const linkAccount = useCallback((provider: string) => {
    signIn(provider, { callbackUrl: '/settings/account' })
  }, [])

  // 연결 해제 래퍼
  const unlinkAccount = useCallback(
    async (provider: string, providerAccountId: string) => {
      await unlinkMutation.mutateAsync({ provider, providerAccountId })
    },
    [unlinkMutation]
  )

  // 비밀번호 설정 래퍼
  const setPassword = useCallback(
    async (email: string, password: string) => {
      await setPasswordMutation.mutateAsync({ email, password })
    },
    [setPasswordMutation]
  )

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      })
    },
    [changePasswordMutation]
  )

  return {
    accounts: data?.accounts ?? [],
    hasPassword: data?.hasPassword ?? false,
    email: data?.email ?? null,
    isLoading,
    error,
    linkAccount,
    unlinkAccount,
    isUnlinking: unlinkMutation.isPending,
    unlinkError: unlinkMutation.error?.message ?? null,
    setPassword,
    isSettingPassword: setPasswordMutation.isPending,
    setPasswordError: setPasswordMutation.error?.message ?? null,
    changePassword,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error?.message ?? null,
  }
}
