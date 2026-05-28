'use client'

import { ThemeProvider } from 'next-themes'

interface LandingThemeProviderProps {
  children: React.ReactNode
}

/**
 * 랜딩 전용 테마 공급자.
 * 세션/쿼리 provider를 끌어오지 않고 라이트·다크·시스템 테마만 적용한다.
 */
export function LandingThemeProvider({ children }: LandingThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}
