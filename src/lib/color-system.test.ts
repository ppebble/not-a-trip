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
})
