'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { AppIcon } from './AppIcon'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-9 w-9" />
  }

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light')
    else if (theme === 'light') setTheme('dark')
    else setTheme('system')
  }

  const getIcon = () => {
    if (theme === 'dark') return <AppIcon name="dark-mode" size="xl" />
    if (theme === 'light') return <AppIcon name="light-mode" size="xl" />
    return <AppIcon name="settings" size="xl" />
  }

  const label =
    theme === 'dark'
      ? '다크 모드'
      : theme === 'light'
        ? '라이트 모드'
        : '시스템 설정'

  return (
    <button
      onClick={cycleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-300 transition hover:bg-neutral-700 hover:text-white"
      aria-label={`현재: ${label}. 클릭하여 테마 변경`}
      title={label}
    >
      <span className="flex items-center justify-center">{getIcon()}</span>
    </button>
  )
}
