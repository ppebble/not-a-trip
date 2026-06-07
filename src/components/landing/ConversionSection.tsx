'use client'

import { forwardRef, useState } from 'react'
import Image from 'next/image'
import { usePwaStore } from '@/stores/pwaStore'
import { CTAButton } from './CTAButton'
import { MASCOT_ASSETS } from '@/components/common/mascotAssets'

/**
 * 전환 영역 컴포넌트
 * 마스코트 여권 일러스트 + PWA 설치 유도 카피 + 설치/탐색 CTA
 * isStandalone 상태에 따라 설치 유도 또는 지도 탐색 CTA 분기
 * forwardRef로 WelcomePageClient에서 conversionRef 전달 가능
 * Requirements: 4.1, 4.2, 4.3, 4.7
 */

interface ConversionSectionProps {
  isStandalone: boolean
}

export const ConversionSection = forwardRef<
  HTMLElement,
  ConversionSectionProps
>(function ConversionSection({ isStandalone }, ref) {
  const triggerInstall = usePwaStore((s) => s.triggerInstall)
  const isInstallable = usePwaStore((s) => s.isInstallable)
  const [showFallbackMsg, setShowFallbackMsg] = useState(false)

  const handleInstall = async () => {
    if (!isInstallable) {
      // 설치 프롬프트 미지원 시 안내 메시지 표시
      setShowFallbackMsg(true)
      setTimeout(() => setShowFallbackMsg(false), 4000)
      return
    }
    await triggerInstall()
  }

  return (
    <section
      ref={ref}
      className="bg-gradient-to-b from-background via-secondary-50/30 to-sunset-50/40 py-16 dark:via-secondary-500/10 dark:to-background md:py-24"
      aria-label="전환 영역"
    >
      <div className="mx-auto max-w-2xl px-4 text-center">
        {/* 마스코트 여권 일러스트 */}
        <div className="mb-8 flex justify-center" aria-hidden="true">
          <Image
            src={MASCOT_ASSETS.passport}
            alt=""
            width={160}
            height={160}
            className="h-36 w-36 object-contain md:h-44 md:w-44"
          />
        </div>

        {/* 설치 유도 카피 */}
        <header className="mb-10">
          <h2 className="mb-3 text-2xl font-semibold tracking-[-0.025em] text-main-text md:text-3xl">
            나만의 <span className="text-sunset-500">여권</span>을 만들고
            <br />
            다음 여행을 가볍게 시작해요
          </h2>
          <p className="text-base leading-7 text-sub-text md:text-lg">
            저장한 장소와 방문 기록이 계속 이어지는 팬 여행 지도입니다
          </p>
        </header>

        {/* CTA 영역 — 지도 탐색 우선, 앱 설치 보조 */}
        <div className="flex flex-col items-center gap-4">
          <CTAButton
            label="지도에서 탐색 시작"
            href="/map"
            size="lg"
            variant="primary"
          />
          {!isStandalone && (
            <>
              <button
                type="button"
                onClick={handleInstall}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface/85 px-6 py-3 text-base font-medium text-sub-text shadow-sm backdrop-blur-sm transition hover:border-primary-500/40 hover:bg-background hover:text-main-text dark:border-white/15 dark:bg-white/10 dark:text-white/75 dark:hover:bg-white/20 dark:hover:text-white"
              >
                <span>📲</span>
                <span>앱으로 설치하기</span>
              </button>
              {showFallbackMsg && (
                <p className="animate-fade-slide-in text-sm text-sub-text">
                  브라우저 메뉴에서 &quot;홈 화면에 추가&quot;로 설치할 수
                  있어요
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
})
