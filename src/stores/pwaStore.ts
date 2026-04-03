import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface PwaState {
  /** 지연된 설치 프롬프트 이벤트 */
  deferredPrompt: BeforeInstallPromptEvent | null
  /** 설치 가능 여부 (beforeinstallprompt 수신 시 true) */
  isInstallable: boolean
  /** 설치 완료 여부 (appinstalled 이벤트 또는 standalone 모드) */
  isInstalled: boolean
  /** 사용자가 바텀 시트를 닫았는지 (세션 단위) */
  isDismissed: boolean
}

interface PwaStore extends PwaState {
  setDeferredPrompt: (event: BeforeInstallPromptEvent) => void
  triggerInstall: () => Promise<'accepted' | 'dismissed'>
  dismiss: () => void
  setInstalled: () => void
  reset: () => void
}

export const usePwaStore = create<PwaStore>()(
  devtools(
    (set, get) => ({
      deferredPrompt: null,
      isInstallable: false,
      isInstalled: false,
      isDismissed: false,

      setDeferredPrompt: (event) =>
        set(
          { deferredPrompt: event, isInstallable: true },
          false,
          'pwaStore/setDeferredPrompt'
        ),

      triggerInstall: async () => {
        const { deferredPrompt } = get()
        if (!deferredPrompt) return 'dismissed'

        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
          set(
            { isInstalled: true, deferredPrompt: null, isInstallable: false },
            false,
            'pwaStore/triggerInstall:accepted'
          )
        } else {
          set(
            { deferredPrompt: null, isInstallable: false },
            false,
            'pwaStore/triggerInstall:dismissed'
          )
        }

        return outcome
      },

      dismiss: () => set({ isDismissed: true }, false, 'pwaStore/dismiss'),

      setInstalled: () =>
        set(
          { isInstalled: true, isInstallable: false, deferredPrompt: null },
          false,
          'pwaStore/setInstalled'
        ),

      reset: () =>
        set(
          {
            deferredPrompt: null,
            isInstallable: false,
            isInstalled: false,
            isDismissed: false,
          },
          false,
          'pwaStore/reset'
        ),
    }),
    { name: 'pwa-store' }
  )
)

// Selectors
export const useIsInstallable = () =>
  usePwaStore((state) => state.isInstallable)
export const useIsInstalled = () => usePwaStore((state) => state.isInstalled)
export const useIsDismissed = () => usePwaStore((state) => state.isDismissed)
