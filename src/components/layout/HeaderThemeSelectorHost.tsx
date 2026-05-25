'use client'

import dynamic from 'next/dynamic'

const ThemeSelector = dynamic(
  () =>
    import('@/components/common/ThemeToggle').then((mod) => mod.ThemeSelector),
  {
    ssr: false,
    loading: () => <div className="h-9 w-9" aria-hidden="true" />,
  }
)

export default function HeaderThemeSelectorHost() {
  return <ThemeSelector />
}
