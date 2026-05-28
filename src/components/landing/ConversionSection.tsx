'use client'

import { forwardRef, useState } from 'react'
import { usePwaStore } from '@/stores/pwaStore'
import { CTAButton } from './CTAButton'

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
          <PassportIllustration />
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

/**
 * 마스코트 여권 인라인 SVG 일러스트
 */
function PassportIllustration() {
  return (
    <svg
      viewBox="0 0 160 200"
      className="h-40 w-32 md:h-48 md:w-40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="마스코트가 여권을 들고 있는 일러스트"
    >
      <defs>
        <linearGradient
          id="passportLightBody"
          x1="20"
          y1="40"
          x2="140"
          y2="190"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#eef2ff" />
          <stop offset="48%" stopColor="#f0fdfa" />
          <stop offset="100%" stopColor="#fff7ed" />
        </linearGradient>
      </defs>

      {/* 여권 본체 */}
      <rect
        x="20"
        y="40"
        width="120"
        height="150"
        rx="8"
        fill="url(#passportLightBody)"
        className="dark:hidden"
      />
      <rect
        x="20"
        y="40"
        width="120"
        height="150"
        rx="8"
        className="hidden fill-primary-600 dark:block"
      />
      <rect
        x="20"
        y="40"
        width="120"
        height="150"
        rx="8"
        className="stroke-neutral-300 dark:stroke-primary-400"
        strokeWidth="2"
        fill="none"
      />

      {/* 여권 내부 장식선 */}
      <rect
        x="32"
        y="52"
        width="96"
        height="126"
        rx="4"
        className="stroke-secondary-500/55 dark:stroke-primary-300/40"
        strokeWidth="1.4"
        fill="none"
      />

      {/* 여권 상단 텍스트 — PASSPORT */}
      <text
        x="80"
        y="72"
        textAnchor="middle"
        className="fill-primary-700 dark:fill-primary-200"
        fontSize="10"
        fontWeight="bold"
        letterSpacing="2"
      >
        PASSPORT
      </text>

      {/* 마스코트 얼굴 (원형 사진 영역) */}
      <circle
        cx="80"
        cy="110"
        r="24"
        className="fill-secondary-50 dark:fill-primary-800/50"
      />
      <circle
        cx="80"
        cy="110"
        r="24"
        className="stroke-secondary-500/65 dark:stroke-primary-300"
        strokeWidth="1.8"
        fill="none"
      />

      {/* 마스코트 눈 */}
      <circle cx="72" cy="106" r="3" className="fill-primary-500" />
      <circle cx="88" cy="106" r="3" className="fill-primary-500" />
      <circle
        cx="73"
        cy="105"
        r="1"
        className="fill-violet-950 dark:fill-primary-800"
      />
      <circle
        cx="89"
        cy="105"
        r="1"
        className="fill-violet-950 dark:fill-primary-800"
      />

      {/* 마스코트 입 (미소) */}
      <path
        d="M74 116 Q80 122 86 116"
        className="stroke-primary-600 dark:stroke-primary-200"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* 여권 하단 정보 라인 */}
      <rect
        x="44"
        y="148"
        width="72"
        height="4"
        rx="2"
        className="fill-secondary-300/75 dark:fill-primary-400/30"
      />
      <rect
        x="52"
        y="158"
        width="56"
        height="4"
        rx="2"
        className="fill-sunset-300/65 dark:fill-primary-400/20"
      />

      {/* 여권 스탬프 (체크인 도장) */}
      <circle
        cx="120"
        cy="60"
        r="16"
        className="stroke-sunset-500/80 dark:stroke-secondary-400"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="3 2"
        transform="rotate(-15 120 60)"
      />
      <text
        x="120"
        y="63"
        textAnchor="middle"
        className="fill-sunset-600 dark:fill-secondary-400"
        fontSize="7"
        fontWeight="bold"
      >
        ✓
      </text>
    </svg>
  )
}
