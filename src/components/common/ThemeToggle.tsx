'use client'

import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AppIcon } from './AppIcon'
import type { AppIconType } from './AppIcon'

/** 테마 옵션 인터페이스 */
export interface ThemeOption {
  value: 'light' | 'dark' | 'system'
  label: string
  iconName: AppIconType
}

/** 테마 옵션 상수 배열 */
export const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: '라이트 모드', iconName: 'light-mode' },
  { value: 'dark', label: '다크 모드', iconName: 'dark-mode' },
  { value: 'system', label: '시스템 설정', iconName: 'settings' },
]

/** 테마 값에 해당하는 아이콘 이름 반환 */
export function getIcon(theme: string | undefined): AppIconType {
  const option = THEME_OPTIONS.find((o) => o.value === theme)
  return option?.iconName ?? 'settings'
}

/** 테마 값에 해당하는 한글 레이블 반환 */
export function getLabel(theme: string | undefined): string {
  const option = THEME_OPTIONS.find((o) => o.value === theme)
  return option?.label ?? '시스템 설정'
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const updateMenuPosition = useCallback(() => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const menuWidth = 176
    const viewportPadding = 16
    const right = Math.max(viewportPadding, window.innerWidth - rect.right)
    const maxRight = Math.max(viewportPadding, window.innerWidth - menuWidth)

    setMenuPosition({
      top: rect.bottom + 8,
      right: Math.min(right, maxRight),
    })
  }, [])

  useEffect(() => {
    if (!isOpen) return

    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)

    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [isOpen, updateMenuPosition])

  // 외부 클릭 감지 (DirectionsButton 패턴)
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Escape 키 감지
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // 하이드레이션 안전성: 마운트 전 플레이스홀더
  if (!mounted) {
    return <div className="h-10 w-10" />
  }

  const currentTheme = theme ?? 'system'
  const currentLabel = getLabel(currentTheme)
  const currentIconName = getIcon(currentTheme)

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        onClick={() => {
          if (!isOpen) updateMenuPosition()
          setIsOpen((prev) => !prev)
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/85 text-sub-text shadow-sm backdrop-blur-sm transition hover:border-primary-500/40 hover:bg-primary-50 hover:text-main-text dark:border-white/15 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20 dark:hover:text-white"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`현재: ${currentLabel}. 클릭하여 테마 선택`}
        title={currentLabel}
      >
        <span className="flex items-center justify-center">
          <AppIcon name={currentIconName} size="xl" />
        </span>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[10000] w-44 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl shadow-primary-500/10 ring-1 ring-black/5 dark:border-white/10"
            style={{
              top: menuPosition.top,
              right: menuPosition.right,
            }}
            role="menu"
            aria-label="테마 선택"
          >
            {THEME_OPTIONS.map((option) => {
              const isActive = currentTheme === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary-50 font-medium text-primary dark:bg-white/10 dark:text-primary-300'
                      : 'text-sub-text hover:bg-accent-surface hover:text-main-text'
                  }`}
                  role="menuitem"
                >
                  <AppIcon name={option.iconName} size="sm" />
                  <span className="flex-1 text-left">{option.label}</span>
                  {isActive && (
                    <svg
                      className="h-4 w-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>,
          document.body
        )}
    </div>
  )
}
