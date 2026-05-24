'use client'

import dynamic from 'next/dynamic'

const AppChromeDeferred = dynamic(() => import('./AppChromeDeferred'), {
  ssr: false,
  loading: () => null,
})

export default function AppChromeDeferredHost() {
  return <AppChromeDeferred />
}
