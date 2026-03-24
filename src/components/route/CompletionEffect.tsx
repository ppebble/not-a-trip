'use client'

import { useEffect, useState } from 'react'

interface CompletionEffectProps {
  /** 표시 여부 */
  isVisible: boolean
  /** 코스명 */
  routeName: string
  /** 닫기 핸들러 */
  onClose: () => void
}

/**
 * CompletionEffect - 코스 완주 기념 시각적 이펙트
 *
 * 모든 유효 스팟 인증 완료 시 표시되는 축하 오버레이
 * Requirements: 3.5
 */
export function CompletionEffect({
  isVisible,
  routeName,
  onClose,
}: CompletionEffectProps) {
  const [particles, setParticles] = useState<
    { id: number; x: number; delay: number; emoji: string }[]
  >([])

  useEffect(() => {
    if (!isVisible) return
    const emojis = ['🎉', '🏆', '⭐', '✨', '🎊', '🥳', '🎯', '🗺️']
    const newParticles = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      emoji: emojis[i % emojis.length],
    }))
    setParticles(newParticles)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* 파티클 애니메이션 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute animate-bounce text-2xl"
            style={{
              left: `${p.x}%`,
              top: '-10%',
              animationDelay: `${p.delay}s`,
              animationDuration: '2.5s',
              animationIterationCount: 'infinite',
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      {/* 축하 카드 */}
      <div className="relative z-10 mx-4 w-full max-w-sm animate-[scaleIn_0.4s_ease-out] rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mb-4 text-6xl">🏆</div>
        <h2 className="text-navy-900 mb-2 text-2xl font-bold">완주 축하!</h2>
        <p className="text-navy-500 mb-1 text-sm">코스를 모두 완주했습니다</p>
        <p className="text-navy-700 mb-6 text-lg font-semibold">{routeName}</p>
        <button
          onClick={onClose}
          className="bg-navy-600 hover:bg-navy-700 w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  )
}
