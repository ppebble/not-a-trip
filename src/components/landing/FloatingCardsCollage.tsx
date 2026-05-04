'use client'

import { useEffect, useState } from 'react'

import { FloatingCard } from './FloatingCard'
import { MascotOverlay } from './MascotOverlay'
import { CARD_PLACEMENTS, SHOWCASE_CARDS } from './data/showcaseCards'

/**
 * FloatingCardsCollage 컴포넌트
 * 히어로 섹션의 비주얼 영역. 여러 장의 스팟 카드가 떠다니는 콜라주를 렌더링한다.
 * - SHOWCASE_CARDS 정적 데이터에서 카드 목록을 가져와 렌더링
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
  /** 추가 CSS 클래스 */
  className?: string
}

/**
 * 뷰포트 너비에 따라 표시할 카드 수를 결정한다.
 * - 모바일(< 768px): 6장
 * - 태블릿(768px ~ 1024px): 9장
 * - 데스크톱(> 1024px): 12장
 *
 * SHOWCASE_CARDS는 카테고리 순환 배치:
 * [anim, sports, movie, music, game, other, anim, sports, movie, music, game, other]
 * → 6장 슬라이스 시 각 카테고리 1장씩 보장
 */
function getCardCount(width: number): number {
  if (width < 768) return 6
  if (width < 1024) return 9
  return 12
}

export function FloatingCardsCollage({
  reducedMotion,
  className = '',
}: FloatingCardsCollageProps) {
  const [cardCount, setCardCount] = useState(12)

  useEffect(() => {
    // 초기 카드 수 설정
    setCardCount(getCardCount(window.innerWidth))

    // 리사이즈 이벤트로 반응형 카드 수 조절
    function handleResize() {
      setCardCount(getCardCount(window.innerWidth))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const visibleCards = SHOWCASE_CARDS.slice(0, cardCount)

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      role="img"
      aria-label="다양한 성지순례 스팟을 보여주는 플로팅 카드 콜라주"
    >
      {visibleCards.map((card, index) => {
        const placement = CARD_PLACEMENTS[index]

        // 카드 위치 및 애니메이션 스타일
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
          <div key={card.id} style={cardStyle}>
            <FloatingCard
              card={card}
              index={index}
              reducedMotion={reducedMotion}
              size={placement.size}
            />
          </div>
        )
      })}

      {/* 마스코트 오버레이 (카드 콜라주 위에 렌더링) */}
      <MascotOverlay reducedMotion={reducedMotion} />
    </div>
  )
}
