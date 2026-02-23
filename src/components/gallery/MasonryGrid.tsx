'use client'

import { ReactNode } from 'react'

/**
 * MasonryGrid 컴포넌트
 * Pinterest 스타일의 Masonry 레이아웃을 제공합니다.
 *
 * Requirements:
 * - 2.1: Masonry_Grid 레이아웃 (모바일 2열, 태블릿 3열, 데스크톱 4열)
 *
 * CSS columns 기반으로 구현하여 불규칙한 높이의 카드들이
 * 빈틈없이 배치되도록 합니다.
 */

export interface MasonryGridColumns {
  mobile: number
  tablet: number
  desktop: number
}

export interface MasonryGridProps {
  children: ReactNode
  columns?: MasonryGridColumns
  gap?: number
  className?: string
}

const DEFAULT_COLUMNS: MasonryGridColumns = {
  mobile: 2,
  tablet: 3,
  desktop: 4,
}

const DEFAULT_GAP = 16

/**
 * MasonryGrid 컴포넌트
 *
 * CSS columns를 사용하여 Masonry 레이아웃을 구현합니다.
 * 반응형 열 수는 Tailwind CSS 브레이크포인트를 활용합니다.
 *
 * @param children - 그리드 내부에 렌더링할 자식 요소들
 * @param columns - 반응형 열 수 설정 (mobile, tablet, desktop)
 * @param gap - 아이템 간 간격 (px)
 * @param className - 추가 CSS 클래스
 */
export function MasonryGrid({
  children,
  columns = DEFAULT_COLUMNS,
  gap = DEFAULT_GAP,
  className = '',
}: MasonryGridProps) {
  // CSS 변수로 gap 값 전달
  const style = {
    '--masonry-gap': `${gap}px`,
    columnGap: `${gap}px`,
  } as React.CSSProperties

  // 동적 열 수 클래스 생성
  const columnClasses = getColumnClasses(columns)

  return (
    <div className={`masonry-grid ${columnClasses} ${className}`} style={style}>
      {children}
    </div>
  )
}

/**
 * 반응형 열 수에 따른 Tailwind 클래스 생성
 */
function getColumnClasses(columns: MasonryGridColumns): string {
  const { mobile, tablet, desktop } = columns

  // columns-{n} 클래스 매핑
  const mobileClass = `columns-${mobile}`
  const tabletClass = `md:columns-${tablet}`
  const desktopClass = `lg:columns-${desktop}`

  return `${mobileClass} ${tabletClass} ${desktopClass}`
}

/**
 * MasonryItem 컴포넌트
 * MasonryGrid 내부의 개별 아이템을 감싸는 컴포넌트입니다.
 * break-inside-avoid로 아이템이 열 사이에서 잘리지 않도록 합니다.
 */
export interface MasonryItemProps {
  children: ReactNode
  className?: string
}

export function MasonryItem({ children, className = '' }: MasonryItemProps) {
  return (
    <div className={`mb-[var(--masonry-gap)] break-inside-avoid ${className}`}>
      {children}
    </div>
  )
}

export default MasonryGrid
