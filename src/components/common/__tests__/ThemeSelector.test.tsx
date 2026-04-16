/**
 * @jest-environment jsdom
 */
/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react'
import fc from 'fast-check'
import { ThemeSelector, THEME_OPTIONS, getIcon, getLabel } from '../ThemeToggle'

// --- Mocks ---

const mockSetTheme = jest.fn()
let mockTheme = 'system'

jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}))

jest.mock('@/components/common/AppIcon', () => ({
  AppIcon: ({ name }: { name: string }) => (
    <span data-testid={`icon-${name}`} />
  ),
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockTheme = 'system'
})

/**
 * Feature: theme-selector-menu, Property 1: 토글 상태 반전 및 aria-expanded 동기화
 * Validates: Requirements 1.1, 5.1
 */
describe('Property 1: 토글 상태 반전 및 aria-expanded 동기화', () => {
  it('임의의 초기 상태에서 토글 후 aria-expanded가 반전된다', () => {
    fc.assert(
      fc.property(fc.boolean(), (initialOpen) => {
        const { unmount } = render(<ThemeSelector />)
        const button = screen.getByRole('button', { name: /테마 선택/ })

        // 초기 상태: 닫힘 (aria-expanded="false")
        expect(button.getAttribute('aria-expanded')).toBe('false')

        if (initialOpen) {
          // 열기: 클릭 → aria-expanded="true"
          fireEvent.click(button)
          expect(button.getAttribute('aria-expanded')).toBe('true')

          // 닫기: 다시 클릭 → aria-expanded="false"
          fireEvent.click(button)
          expect(button.getAttribute('aria-expanded')).toBe('false')
        } else {
          // 닫힌 상태에서 클릭 → 열림
          fireEvent.click(button)
          expect(button.getAttribute('aria-expanded')).toBe('true')
        }

        unmount()
      }),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: theme-selector-menu, Property 2: 테마-아이콘-레이블 매핑 일관성
 * Validates: Requirements 2.3, 5.4
 */
describe('Property 2: 테마-아이콘-레이블 매핑 일관성', () => {
  const expectedMapping: Record<string, { icon: string; label: string }> = {
    light: { icon: 'light-mode', label: '라이트 모드' },
    dark: { icon: 'dark-mode', label: '다크 모드' },
    system: { icon: 'settings', label: '시스템 설정' },
  }

  it('임의의 테마 값에 대해 getIcon/getLabel이 올바른 매핑을 반환한다', () => {
    fc.assert(
      fc.property(fc.constantFrom('light', 'dark', 'system'), (themeValue) => {
        const expected = expectedMapping[themeValue]

        // getIcon 매핑 검증
        expect(getIcon(themeValue)).toBe(expected.icon)

        // getLabel 매핑 검증
        expect(getLabel(themeValue)).toBe(expected.label)
      }),
      { numRuns: 100 }
    )
  })

  it('임의의 테마 값에 대해 aria-label에 해당 레이블이 포함된다', () => {
    fc.assert(
      fc.property(fc.constantFrom('light', 'dark', 'system'), (themeValue) => {
        mockTheme = themeValue
        const { unmount } = render(<ThemeSelector />)
        const button = screen.getByRole('button', { name: /테마 선택/ })

        const expected = expectedMapping[themeValue]
        expect(button.getAttribute('aria-label')).toContain(expected.label)

        unmount()
      }),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: theme-selector-menu, Property 3: 활성 테마 표시 정확성
 * Validates: Requirements 3.1, 3.2
 */
describe('Property 3: 활성 테마 표시 정확성', () => {
  it('임의의 테마 값에 대해 메뉴 열림 시 정확히 하나의 옵션만 활성 스타일 적용', () => {
    fc.assert(
      fc.property(fc.constantFrom('light', 'dark', 'system'), (themeValue) => {
        mockTheme = themeValue
        const { unmount } = render(<ThemeSelector />)

        // 메뉴 열기
        const button = screen.getByRole('button', { name: /테마 선택/ })
        fireEvent.click(button)

        // 메뉴가 열려 있는지 확인
        const menu = screen.getByRole('menu', { name: '테마 선택' })
        expect(menu).toBeInTheDocument()

        // 모든 menuitem 가져오기
        const menuItems = screen.getAllByRole('menuitem')
        expect(menuItems).toHaveLength(THEME_OPTIONS.length)

        // 활성 스타일(bg-primary-50)이 적용된 항목 수 확인
        const activeItems = menuItems.filter((item) =>
          item.className.includes('bg-primary-50')
        )
        expect(activeItems).toHaveLength(1)

        // 활성 항목의 텍스트가 현재 테마의 레이블과 일치
        const expectedLabel = getLabel(themeValue)
        expect(activeItems[0].textContent).toContain(expectedLabel)

        unmount()
      }),
      { numRuns: 100 }
    )
  })
})
