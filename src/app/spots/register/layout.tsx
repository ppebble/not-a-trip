import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function SpotRegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
