/**
 * 전역 색상 시스템 회귀 테스트
 *
 * Feature: travel-palette-system
 * Property 1: 전역 팔레트는 단일 보라 축이 아니라 primary/secondary/sunset 역할을 분리한다.
 * Property 2: 기존 text-text-* 유틸리티 사용처는 Tailwind 토큰으로 해석 가능해야 한다.
 */

import fs from 'fs'
import path from 'path'

const projectRoot = path.resolve(__dirname, '../../')

function read(relativePath: string) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8')
}

describe('travel-inspired global color system', () => {
  it('primary, secondary, sunset 팔레트가 전역 CSS 변수로 존재한다', () => {
    const globals = read('src/app/globals.css')

    expect(globals).toContain('Harbor Indigo')
    expect(globals).toContain('Sea Teal')
    expect(globals).toContain('Sunset')
    expect(globals).toContain('--color-primary-500: 99 102 241')
    expect(globals).toContain('--color-secondary-500: 20 184 166')
    expect(globals).toContain('--color-sunset-500: 249 115 22')
  })

  it('Tailwind 색상 토큰은 sunset과 기존 text alias를 제공한다', () => {
    const tailwind = read('tailwind.config.ts')

    expect(tailwind).toContain('sunset:')
    expect(tailwind).toContain('--color-sunset-500')
    expect(tailwind).toContain("'text-primary'")
    expect(tailwind).toContain("'text-secondary'")
    expect(tailwind).toContain(
      "DEFAULT: 'rgb(var(--color-text-secondary) / <alpha-value>)'"
    )
  })
  it('라이트 모드 표면은 노란 기를 낮추고 경계 대비를 확보한다', () => {
    const globals = read('src/app/globals.css')

    expect(globals).toContain('--color-background: 250 250 249')
    expect(globals).toContain('--color-accent-surface: 241 245 249')
    expect(globals).toContain('--color-border: 203 213 225')
    expect(globals).not.toContain('--color-background: 255 252 247')
  })

  it('헤더 선택 상태는 라이트 모드에서 형광 보조색 대신 고대비 인디고를 쓴다', () => {
    const header = read('src/components/layout/Header.tsx')

    expect(header).toContain('bg-primary-50 text-primary-700')
    expect(header).toContain('ring-primary-200')
    expect(header).toContain('dark:bg-secondary-500/15 dark:text-secondary-600')
    expect(header).not.toContain("? 'bg-secondary-100 text-secondary-400'")
  })

  it('튜토리얼 다이얼로그 제목과 보조 액션 위계를 고정한다', () => {
    const onboardingTour = read('src/components/common/OnboardingTour.tsx')

    expect(onboardingTour).toContain('mb-2 text-lg font-bold')
    expect(onboardingTour).toContain('underline underline-offset-4')
    expect(onboardingTour).toContain('text-gray-500')
  })
})
