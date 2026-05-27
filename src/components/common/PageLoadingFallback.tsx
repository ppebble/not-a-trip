import { AppIcon } from '@/components/common/AppIcon'

type PageLoadingVariant =
  | 'default'
  | 'auth'
  | 'admin'
  | 'gallery'
  | 'profile'
  | 'routes'

type PageLoadingFallbackProps = {
  title?: string
  description?: string
  variant?: PageLoadingVariant
}

function Block({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-neutral-200/80 ${className}`}
      aria-hidden="true"
    />
  )
}

function CardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
        >
          <Block className="h-36 w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Block className="h-5 w-3/4" />
            <Block className="h-4 w-full" />
            <Block className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function PageHeader({
  title,
  description,
}: Required<Pick<PageLoadingFallbackProps, 'title' | 'description'>>) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2 text-2xl font-bold text-main-text">
          <AppIcon name="logo" size="lg" alt="" />
          <span>{title}</span>
        </div>
        <p className="text-sm text-sub-text">{description}</p>
      </div>
      <Block className="hidden h-10 w-28 sm:block" />
    </div>
  )
}

function AuthFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <Block className="mx-auto h-9 w-32" />
          <Block className="mx-auto h-5 w-56" />
        </div>
        <div className="space-y-4 rounded-xl bg-surface p-8 shadow-xl">
          <Block className="h-12 w-full" />
          <Block className="h-12 w-full" />
          <Block className="h-12 w-full" />
          <Block className="h-px w-full" />
          <Block className="h-12 w-full" />
          <Block className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}

function ProfileFallback() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 rounded-xl bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Block className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <Block className="h-7 w-40" />
              <Block className="h-4 w-64 max-w-full" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-7">
            {Array.from({ length: 7 }, (_, index) => (
              <Block key={index} className="h-12" />
            ))}
          </div>
        </div>
        <Block className="mb-6 h-12 w-full rounded-xl" />
        <Block className="h-64 w-full rounded-xl" />
      </div>
    </main>
  )
}

function AdminFallback() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <PageHeader
          title="어드민 페이지 준비 중"
          description="권한 확인 후 관리 데이터를 불러오고 있습니다."
        />
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
          <div className="space-y-3 rounded-xl bg-surface p-4 shadow-sm">
            {Array.from({ length: 5 }, (_, index) => (
              <Block key={index} className="h-20 w-full" />
            ))}
          </div>
          <div className="space-y-4 rounded-xl bg-surface p-5 shadow-sm">
            <Block className="h-7 w-2/3" />
            <Block className="h-32 w-full" />
            <Block className="h-11 w-full" />
          </div>
        </div>
      </div>
    </main>
  )
}

export function PageLoadingFallback({
  title = '페이지 준비 중',
  description = '요청한 화면으로 이동하고 데이터를 불러오고 있습니다.',
  variant = 'default',
}: PageLoadingFallbackProps) {
  if (variant === 'auth') return <AuthFallback />
  if (variant === 'profile') return <ProfileFallback />
  if (variant === 'admin') return <AdminFallback />

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <PageHeader title={title} description={description} />
        {variant === 'gallery' || variant === 'routes' ? (
          <CardGrid count={variant === 'gallery' ? 8 : 6} />
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl bg-surface p-5 shadow-sm">
              <Block className="mb-4 h-8 w-64 max-w-full" />
              <Block className="mb-3 h-4 w-full" />
              <Block className="h-4 w-3/4" />
            </div>
            <CardGrid />
          </div>
        )}
      </div>
    </main>
  )
}
