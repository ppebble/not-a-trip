/**
 * 랜딩 페이지 전용 레이아웃
 * 라이트/다크 모드 구분 없이 항상 다크 모드로 고정 렌더링
 * Header/Footer 없이 풀스크린 랜딩 경험 제공
 * Requirements: 6.3, 6.7
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="dark">{children}</div>
}
