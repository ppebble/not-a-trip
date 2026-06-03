'use client'

import { useEffect, useState } from 'react'

import { FloatingCard } from './FloatingCard'
import './floating-cards.css'
import { MascotOverlay } from './MascotOverlay'
import { CARD_PLACEMENTS } from './data/showcaseCards'
import type { ShowcaseCard } from './data/showcaseCards'

/**
 * FloatingCardsCollage 컴포넌트
 * 히어로 섹션의 비주얼 영역. 여러 장의 스팟 카드가 떠다니는 콜라주를 렌더링한다.
 * - 서버에서 fetch한 실제 스팟 데이터(showcaseSpots)를 기반으로 렌더링
 * - 반응형 카드 수 조절 (모바일 6장, 태블릿 9장, 데스크톱 12장)
 * - 각 카드에 고유한 float 애니메이션 딜레이/속도 부여
 * - MascotOverlay를 카드 콜라주 위에 배치
 * - reducedMotion=true 시 애니메이션 비활성화 (정적 배치)
 * - 접근성: role="img", aria-label 제공
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 8.5
 */

interface FloatingCardsCollageProps {
  /** 모션 감소 설정 (prefers-reduced-motion) */
  reducedMotion: boolean
  /** 서버에서 fetch한 쇼케이스 스팟 데이터 */
  showcaseSpots: ShowcaseCard[]
  /** 추가 CSS 클래스 */
  className?: string
}

/**
 * 뷰포트 너비에 따라 표시할 카드 수를 결정한다.
 * - 모바일(< 768px): 6장
 * - 태블릿(768px ~ 1024px): 9장
 * - 데스크톱(> 1024px): 12장
 */
function getCardCount(width: number): number {
  if (width < 768) return 3
  if (width < 1024) return 4
  return 6
}

export function FloatingCardsCollage({
  reducedMotion,
  showcaseSpots,
  className = '',
}: FloatingCardsCollageProps) {
  const [cardCount, setCardCount] = useState(4)

  useEffect(() => {
    setCardCount(getCardCount(window.innerWidth))

    function handleResize() {
      setCardCount(getCardCount(window.innerWidth))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const visibleCards = showcaseSpots.slice(0, cardCount)

  return (
    <div
      className={`relative ${className}`}
      role="img"
      aria-label="다양한 성지순례 스팟을 보여주는 플로팅 카드 콜라주"
    >
      {visibleCards.map((card, index) => {
        const placement = CARD_PLACEMENTS[index]

        const cardStyle: React.CSSProperties = {
          position: 'absolute',
          top: `${placement.top}%`,
          left: `${placement.left}%`,
          transform: `rotate(${placement.rotate}deg)`,
          zIndex: placement.zIndex,
          animation: reducedMotion
            ? 'none'
            : `float-card-${index} ${placement.duration}s ease-in-out ${placement.delay}s infinite alternate`,
        }

        return (
          <div key={card.id} className="floating-card" style={cardStyle}>
            <FloatingCard
              card={card}
              index={index}
              reducedMotion={reducedMotion}
              size={placement.size}
            />
          </div>
        )
      })}

      {/* 마스코트 오버레이 */}
      <MascotOverlay reducedMotion={reducedMotion} />
    </div>
  )
}
