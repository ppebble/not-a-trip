/**
 * SafeAreaWrapper 컴포넌트
 * 디바이스 Safe Area를 고려한 래퍼
 * - env(safe-area-inset-*) CSS 변수 활용
 * - 방향별 패딩 적용 옵션
 * - 추가 패딩 옵션
 *
 * @requirements 4.4
 */

'use client'

import { type ReactNode } from 'react'

/** 적용 가능한 Safe Area 방향 */
type SafeAreaEdge = 'top' | 'bottom' | 'left' | 'right'

interface SafeAreaWrapperProps {
  /** 자식 요소 */
  children: ReactNode
  /** 적용할 방향 (기본: ['top', 'bottom']) */
  edges?: SafeAreaEdge[]
  /** 추가 패딩 (px) - Safe Area에 더해지는 값 */
  additionalPadding?: number
  /** 추가 클래스명 */
  className?: string
  /** HTML 태그 (기본: div) */
  as?: 'div' | 'header' | 'footer' | 'nav' | 'section'
}

/** 방향별 Tailwind Safe Area 패딩 클래스 매핑 */
const SAFE_AREA_CLASSES: Record<SafeAreaEdge, string> = {
  top: 'pt-safe-top',
  bottom: 'pb-safe-bottom',
  left: 'pl-safe-left',
  right: 'pr-safe-right',
}

/** 방향별 CSS padding 속성 매핑 */
const PADDING_PROPERTIES: Record<SafeAreaEdge, string> = {
  top: 'paddingTop',
  bottom: 'paddingBottom',
  left: 'paddingLeft',
  right: 'paddingRight',
}

/** 방향별 env() CSS 값 매핑 */
const SAFE_AREA_ENV: Record<SafeAreaEdge, string> = {
  top: 'env(safe-area-inset-top)',
  bottom: 'env(safe-area-inset-bottom)',
  left: 'env(safe-area-inset-left)',
  right: 'env(safe-area-inset-right)',
}

export default function SafeAreaWrapper({
  children,
  edges = ['top', 'bottom'],
  additionalPadding = 0,
  className = '',
  as: Component = 'div',
}: SafeAreaWrapperProps) {
  // additionalPadding이 없으면 Tailwind 클래스만 사용 (성능 최적화)
  if (additionalPadding === 0) {
    const safeAreaClasses = edges
      .map((edge) => SAFE_AREA_CLASSES[edge])
      .join(' ')

    return (
      <Component className={`${safeAreaClasses} ${className}`.trim()}>
        {children}
      </Component>
    )
  }

  // additionalPadding이 있으면 calc()로 인라인 스타일 사용
  const style: Record<string, string> = {}
  for (const edge of edges) {
    style[PADDING_PROPERTIES[edge]] =
      `calc(${SAFE_AREA_ENV[edge]} + ${additionalPadding}px)`
  }

  return (
    <Component className={className} style={style}>
      {children}
    </Component>
  )
}
