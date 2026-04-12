'use client'

import { forwardRef } from 'react'
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

  const handleInstall = async () => {
    await triggerInstall()
  }

  return (
    <section
      ref={ref}
      className="bg-background py-16 md:py-24"
      aria-label="전환 영역"
    >
      <div className="mx-auto max-w-2xl px-4 text-center">
        {/* 마스코트 여권 일러스트 */}
        <div className="mb-8 flex justify-center" aria-hidden="true">
          <PassportIllustration />
        </div>

        {/* 설치 유도 카피 */}
        <header className="mb-10">
          <h2 className="mb-3 text-2xl font-bold text-main-text md:text-3xl">
            나만의 <span className="text-primary-500">여권</span>을 발급받고
            <br />
            성지순례를 시작하세요
          </h2>
          <p className="text-base text-sub-text md:text-lg">
            전 세계 팬들이 찾는 특별한 장소를 탐험해보세요
          </p>
        </header>

        {/* CTA 영역 — isStandalone 분기 */}
        <div className="flex flex-col items-center gap-4">
          {!isStandalone && (
            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-8 py-4 text-lg font-semibold text-white transition-colors duration-200 hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              🛂 여권 발급받기 (앱 설치)
            </button>
          )}
          <CTAButton
            label="지도 탐색하기"
            href="/map"
            size="lg"
            variant={isStandalone ? 'primary' : 'secondary'}
          />
        </div>
      </div>
    </section>
  )
})

/**
 * 마스코트 여권 인라인 SVG 일러스트
 * GlobeFallback2D 패턴과 동일하게 인라인 SVG로 구현
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
      {/* 여권 본체 */}
      <rect
        x="20"
        y="40"
        width="120"
        height="150"
        rx="8"
        className="fill-primary-600"
      />
      <rect
        x="20"
        y="40"
        width="120"
        height="150"
        rx="8"
        className="stroke-primary-400"
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
        className="stroke-primary-300/40"
        strokeWidth="1"
        fill="none"
      />

      {/* 여권 상단 텍스트 — PASSPORT */}
      <text
        x="80"
        y="72"
        textAnchor="middle"
        className="fill-primary-200"
        fontSize="10"
        fontWeight="bold"
        letterSpacing="2"
      >
        PASSPORT
      </text>

      {/* 마스코트 얼굴 (원형 사진 영역) */}
      <circle cx="80" cy="110" r="24" className="fill-primary-800/50" />
      <circle
        cx="80"
        cy="110"
        r="24"
        className="stroke-primary-300"
        strokeWidth="1.5"
        fill="none"
      />

      {/* 마스코트 눈 */}
      <circle cx="72" cy="106" r="3" className="fill-primary-200" />
      <circle cx="88" cy="106" r="3" className="fill-primary-200" />
      <circle cx="73" cy="105" r="1" className="fill-primary-800" />
      <circle cx="89" cy="105" r="1" className="fill-primary-800" />

      {/* 마스코트 입 (미소) */}
      <path
        d="M74 116 Q80 122 86 116"
        className="stroke-primary-200"
        strokeWidth="1.5"
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
        className="fill-primary-400/30"
      />
      <rect
        x="52"
        y="158"
        width="56"
        height="4"
        rx="2"
        className="fill-primary-400/20"
      />

      {/* 여권 스탬프 (체크인 도장) */}
      <circle
        cx="120"
        cy="60"
        r="16"
        className="stroke-secondary-400"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="3 2"
        transform="rotate(-15 120 60)"
      />
      <text
        x="120"
        y="63"
        textAnchor="middle"
        className="fill-secondary-400"
        fontSize="7"
        fontWeight="bold"
      >
        ✓
      </text>
    </svg>
  )
}
