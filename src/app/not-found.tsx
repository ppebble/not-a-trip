import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
          404
        </p>
        <h1 className="mb-3 text-3xl font-bold text-main-text">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mb-8 text-sm text-sub-text">
          주소가 잘못되었거나, 더 이상 제공되지 않는 페이지입니다.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-600"
          >
            홈으로 이동
          </Link>
          <Link
            href="/map"
            className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-main-text transition hover:bg-muted"
          >
            지도 둘러보기
          </Link>
        </div>
      </div>
    </div>
  )
}
