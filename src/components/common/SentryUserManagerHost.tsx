'use client'

import dynamic from 'next/dynamic'

const SentryUserManager = dynamic(
  () =>
    import('@/components/common/SentryUserManager').then(
      (mod) => mod.SentryUserManager
    ),
  {
    ssr: false,
    loading: () => null,
  }
)

export default function SentryUserManagerHost() {
  return <SentryUserManager />
}
