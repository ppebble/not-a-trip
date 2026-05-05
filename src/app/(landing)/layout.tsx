/**
 * 랜딩 페이지 전용 레이아웃
 * - 항상 다크 모드로 고정
 * - 글로벌 헤더가 숨겨지므로 별도 스페이서 불필요
 * Requirements: 6.3, 6.7
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="dark">{children}</div>
}
