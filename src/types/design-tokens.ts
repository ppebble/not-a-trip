/** 시맨틱 컬러 역할 */
export type SemanticColorRole =
  | 'background'
  | 'surface'
  | 'accent-surface'
  | 'text'
  | 'text-secondary'
  | 'muted'
  | 'border'
  | 'danger'
  | 'danger-surface'

/** 컬러 shade 단계 */
export type ColorShade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900

/** 카테고리 컬러 토큰 (bg/fg 쌍) */
export interface CategoryColorToken {
  bgColor: string // CSS 변수 참조 예: 'var(--category-anime-bg)'
  fgColor: string // CSS 변수 참조 예: 'var(--category-anime-fg)'
}

/** 카테고리 Config (개편 후) */
export interface CategoryConfig {
  icon: string
  bgColor: string
  fgColor: string
  label: string
}

/** 콘텐츠 타입 Config (개편 후) */
export interface ContentTypeConfig {
  icon: string
  bgColor: string
  fgColor: string
  label: string
}

/** 링크 타입 Config (개편 후) */
export interface LinkTypeConfig {
  label: string
  icon: string
  color: string // CSS 변수 참조
}
