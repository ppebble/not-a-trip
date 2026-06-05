'use client'

import Image from 'next/image'

/**
 * MascotOverlay 컴포넌트
 * 마스코트(흰 고양이)를 카드 콜라주 우하단에 자연스럽게 배치한다.
 * - 미세한 float 애니메이션 (위아래 2~3px 움직임)
 * - 모바일에서 크기 축소
 * - reducedMotion=true 시 정적 배치
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

interface MascotOverlayProps {
  /** 모션 감소 설정 */
  reducedMotion: boolean
  /** 추가 CSS 클래스 */
  className?: string
}

/** 마스코트 이미지 경로 */
const MASCOT_IMAGE_PATH = '/icons/mascot/mascot-main-full.webp'

export function MascotOverlay({
  reducedMotion,
  className = '',
}: MascotOverlayProps) {
  return (
    <div
      className={`absolute bottom-2 right-2 z-10 md:bottom-4 md:right-4 ${className}`}
      aria-hidden="true"
    >
      <div
        className={`relative h-12 w-12 md:h-20 md:w-20 lg:h-24 lg:w-24 ${
          reducedMotion ? '' : 'animate-mascot-float'
        }`}
      >
        <Image
          src={MASCOT_IMAGE_PATH}
          alt=""
          fill
          sizes="(max-width: 768px) 48px, (max-width: 1024px) 80px, 96px"
          className="object-contain drop-shadow-lg"
          priority={false}
        />
      </div>
    </div>
  )
}
