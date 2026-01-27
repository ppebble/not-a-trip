import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AuthStore {
  isLoggingOut: boolean
  authError: string | null

  setLoggingOut: (value: boolean) => void
  setAuthError: (error: string | null) => void
  clearAuthError: () => void
  resetAuthState: () => void
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      isLoggingOut: false,
      authError: null,

      setLoggingOut: (value) =>
        set({ isLoggingOut: value }, false, 'authStore/setLoggingOut'),

      setAuthError: (error) =>
        set({ authError: error }, false, 'authStore/setAuthError'),

      clearAuthError: () =>
        set({ authError: null }, false, 'authStore/clearAuthError'),

      resetAuthState: () =>
        set(
          {
            isLoggingOut: false,
            authError: null,
          },
          false,
          'authStore/resetAuthState'
        ),
    }),
    {
      name: 'auth-store',
    }
  )
)

// Selectors
export const useIsLoggingOut = () => useAuthStore((state) => state.isLoggingOut)
export const useAuthError = () => useAuthStore((state) => state.authError)
