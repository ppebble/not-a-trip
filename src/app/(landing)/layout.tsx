import { LandingThemeProvider } from '@/components/landing/LandingThemeProvider'

/**
 * 랜딩 페이지 전용 레이아웃
 * - 라이트/다크/시스템 테마를 랜딩에서도 동일하게 적용
 * - 정적 랜딩 유지: 세션/쿼리 provider는 주입하지 않음
 */
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <LandingThemeProvider>{children}</LandingThemeProvider>
}
