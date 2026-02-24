/**
 * 이미지 최적화 유틸리티
 * blur placeholder 및 이미지 관련 헬퍼 함수
 *
 * @requirements 5.1
 */

/**
 * 원격 이미지용 blur placeholder base64 데이터 URL
 * 1x1 투명 회색 이미지 (로딩 중 배경으로 표시)
 */
export const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg=='

/**
 * Image 컴포넌트에 전달할 blur placeholder props
 * 원격 이미지에 사용 (로컬 이미지는 Next.js가 자동 생성)
 */
export const blurPlaceholderProps = {
  placeholder: 'blur' as const,
  blurDataURL: BLUR_DATA_URL,
}
