/**
 * 랜딩 테마/톤 정리 회귀 테스트
 *
 * Feature: landing-theme-softening
 * Property 1: 랜딩은 다크 고정 레이아웃이 아니라 ThemeProvider를 통해 라이트/다크/시스템을 적용한다.
 * Property 2: 핵심 랜딩 섹션은 하드코딩된 다크 텍스트 대신 시맨틱 텍스트 토큰을 사용한다.
 */

import fs from 'fs'
import path from 'path'

const projectRoot = path.resolve(__dirname, '../../../../')

function read(relativePath: string) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8')
}

describe('landing theme and softer visual tone', () => {
  it('랜딩 레이아웃은 ThemeProvider를 사용하고 dark 클래스를 강제하지 않는다', () => {
    const layout = read('src/app/(landing)/layout.tsx')
    const provider = read('src/components/landing/LandingThemeProvider.tsx')

    expect(layout).toContain('LandingThemeProvider')
    expect(layout).not.toContain('className="dark"')
    expect(provider).toContain('ThemeProvider')
    expect(provider).toContain('defaultTheme="system"')
    expect(provider).toContain('enableSystem')
  })

  it('랜딩 헤더는 테마 선택기를 노출한다', () => {
    const header = read('src/components/landing/LandingHeader.tsx')

    expect(header).toContain('HeaderThemeSelectorHost')
    expect(header).toContain('<HeaderThemeSelectorHost />')
  })

  it('핵심 카드/히어로 섹션은 시맨틱 텍스트 토큰과 부드러운 라운딩을 사용한다', () => {
    const hero = read('src/components/landing/HeroSection.tsx')
    const entry = read('src/components/landing/EntryPointSection.tsx')
    const howItWorks = read('src/components/landing/HowItWorksSection.tsx')
    const proofCard = read('src/components/landing/ProofCard.tsx')

    expect(hero).toContain('text-main-text')
    expect(hero).toContain('text-sub-text')
    expect(entry).toContain('text-main-text')
    expect(entry).toContain('rounded-[1.5rem]')
    expect(howItWorks).toContain('text-main-text')
    expect(howItWorks).toContain('rounded-[1.5rem]')
    expect(proofCard).toContain('rounded-[1.35rem]')
  })

  it('히어로 배경 글로우는 화면 높이 경계에서 잘리지 않도록 아래로 이어진다', () => {
    const hero = read('src/components/landing/HeroSection.tsx')

    expect(hero).toContain('overflow-visible')
    expect(hero).toContain('-bottom-56')
    expect(hero).toContain('-bottom-64')
  })

  it('라이트 모드 여권 일러스트는 단색 보라 면을 피하고 내부 대비를 확보한다', () => {
    const conversion = read('src/components/landing/ConversionSection.tsx')

    expect(conversion).toContain('id="passportLightBody"')
    expect(conversion).toContain('stopColor="#eef2ff"')
    expect(conversion).toContain('stopColor="#f0fdfa"')
    expect(conversion).toContain('stopColor="#fff7ed"')
    expect(conversion).toContain('stroke-neutral-300 dark:stroke-primary-400')
    expect(conversion).toContain('stroke-secondary-500/55')
    expect(conversion).toContain('stroke-secondary-500/65')
    expect(conversion).toContain('fill-secondary-300/75')
    expect(conversion).toContain('fill-sunset-300/65')
  })
  it('강조 문구는 무지개형 그라데이션 텍스트 대신 단색 브랜드 텍스트를 사용한다', () => {
    const hero = read('src/components/landing/HeroSection.tsx')
    const entry = read('src/components/landing/EntryPointSection.tsx')
    const howItWorks = read('src/components/landing/HowItWorksSection.tsx')

    for (const source of [hero, entry, howItWorks]) {
      expect(source).not.toContain('bg-clip-text text-transparent')
      expect(source).not.toContain(
        'from-primary-600 via-secondary-600 to-sunset-500'
      )
    }

    expect(hero).toContain('text-primary-600 dark:text-primary-300')
    expect(entry).toContain('text-primary-600 dark:text-primary-300')
    expect(howItWorks).toContain('text-primary-600 dark:text-primary-300')
  })
})
