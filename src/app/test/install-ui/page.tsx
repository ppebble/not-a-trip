'use client'

import { usePwaStore } from '@/stores/pwaStore'
import { InstallBottomSheet, InstallToast } from '@/components/pwa'

/**
 * PWA 설치 UI 테스트 페이지
 * pwaStore 상태를 수동으로 조작하여 InstallBottomSheet / InstallToast 동작을 확인한다.
 * - "설치 가능 상태로 변경" → 가짜 BeforeInstallPromptEvent 주입
 * - "dismiss" → 바텀 시트/토스트 닫기
 * - "설치 완료 시뮬레이션" → isInstalled = true
 * - "reset" → 초기 상태로 복원
 */
export default function TestInstallUI() {
  const store = usePwaStore()

  const simulateInstallable = () => {
    const fakeEvent = {
      platforms: ['web'],
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
      prompt: () => {
        alert('prompt() 호출됨 — 네이티브 설치 프롬프트 시뮬레이션')
        return Promise.resolve()
      },
      preventDefault: () => {},
    } as unknown as BeforeInstallPromptEvent
    store.setDeferredPrompt(fakeEvent)
  }

  const simulateDismissedInstall = () => {
    const fakeEvent = {
      platforms: ['web'],
      userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
      prompt: () => {
        alert('prompt() 호출됨 — 사용자가 설치를 거부할 예정')
        return Promise.resolve()
      },
      preventDefault: () => {},
    } as unknown as BeforeInstallPromptEvent
    store.setDeferredPrompt(fakeEvent)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-xl font-bold text-main-text">
          🧪 PWA 설치 UI 테스트
        </h1>

        <p className="text-sm text-sub-text">
          모바일 뷰포트(768px 미만)에서는 바텀 시트, 데스크탑(768px 이상)에서는
          토스트가 표시됩니다. Chrome DevTools에서 뷰포트를 전환해 보세요.
        </p>

        {/* 현재 상태 표시 */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="mb-2 text-sm font-bold text-main-text">
            📊 pwaStore 상태
          </h2>
          <pre className="rounded bg-accent-surface p-3 text-xs text-sub-text">
            {JSON.stringify(
              {
                isInstallable: store.isInstallable,
                isInstalled: store.isInstalled,
                isDismissed: store.isDismissed,
                hasDeferredPrompt: store.deferredPrompt !== null,
              },
              null,
              2
            )}
          </pre>
        </div>

        {/* 조작 버튼 */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="mb-3 text-sm font-bold text-main-text">
            🎮 상태 조작
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={simulateInstallable}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
            >
              설치 가능 (accepted)
            </button>
            <button
              onClick={simulateDismissedInstall}
              className="rounded-lg bg-secondary-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-secondary-600"
            >
              설치 가능 (dismissed)
            </button>
            <button
              onClick={() => store.dismiss()}
              className="rounded-lg border border-border bg-accent-surface px-3 py-2 text-sm font-medium text-main-text transition hover:bg-neutral-200"
            >
              dismiss
            </button>
            <button
              onClick={() => store.setInstalled()}
              className="rounded-lg border border-border bg-accent-surface px-3 py-2 text-sm font-medium text-main-text transition hover:bg-neutral-200"
            >
              설치 완료
            </button>
            <button
              onClick={() => store.reset()}
              className="rounded-lg border border-danger bg-danger-surface px-3 py-2 text-sm font-medium text-danger transition hover:bg-red-100"
            >
              reset
            </button>
          </div>
        </div>

        {/* 테스트 시나리오 가이드 */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="mb-2 text-sm font-bold text-main-text">
            📝 테스트 시나리오
          </h2>
          <ol className="list-inside list-decimal space-y-1 text-xs text-sub-text">
            <li>
              &quot;설치 가능 (accepted)&quot; 클릭 → 바텀 시트/토스트 표시 확인
            </li>
            <li>
              &quot;여권 발급받기&quot; 버튼 클릭 → prompt() 호출 + UI 닫힘 확인
            </li>
            <li>
              reset → &quot;설치 가능 (dismissed)&quot; → 설치 버튼 → 거부
              시나리오
            </li>
            <li>&quot;dismiss&quot; 클릭 → UI 닫힘 확인</li>
            <li>&quot;설치 완료&quot; 클릭 → UI 미표시 확인</li>
            <li>DevTools에서 뷰포트 전환 → 바텀 시트 ↔ 토스트 전환 확인</li>
          </ol>
        </div>
      </div>

      {/* 실제 설치 UI 컴포넌트 */}
      <InstallBottomSheet />
      <InstallToast />
    </div>
  )
}
