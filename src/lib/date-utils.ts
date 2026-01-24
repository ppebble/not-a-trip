/**
 * 날짜 관련 유틸리티 함수
 *
 * 여러 컴포넌트에서 중복 사용되던 날짜 포맷팅 로직을 통합
 */

/**
 * 날짜를 상대적 시간 형식으로 포맷팅 (예: "방금 전", "3시간 전", "어제")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diff / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diff / (1000 * 60))
      return diffMinutes <= 0 ? '방금 전' : `${diffMinutes}분 전`
    }
    return `${diffHours}시간 전`
  }

  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 날짜를 전체 형식으로 포맷팅 (예: "2024년 1월 25일 오후 3:30")
 */
export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 조회수를 포맷팅 (1000 이상일 경우 K 단위로 표시)
 */
export function formatViewCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}
