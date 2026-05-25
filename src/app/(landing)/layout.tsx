/**
 * 랜딩 페이지 전용 레이아웃
 * - 항상 다크 모드로 고정
 * - 정적 랜딩 유지: 세션 provider를 주입하지 않음
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="dark">{children}</div>
}
