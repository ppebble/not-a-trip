import Link from 'next/link'

/**
 * 대시보드 네비게이션 카드 컴포넌트
 * Requirements: 1.1, 1.4
 * - 카드 클릭 시 해당 관리 페이지로 이동 (Next.js Link)
 * - 대기 중 항목 수 배지 표시
 */

interface AdminDashboardCardProps {
  title: string
  description: string
  icon: string | React.ReactNode
  pendingCount: number
  href: string
}

export function AdminDashboardCard({
  title,
  description,
  icon,
  pendingCount,
  href,
}: AdminDashboardCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:border-primary-300 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
    >
      <div className="flex items-start justify-between">
        <span
          className="flex h-10 w-10 items-center justify-center text-3xl"
          role="img"
          aria-label={title}
        >
          {icon}
        </span>
        {pendingCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            {pendingCount}건 대기
          </span>
        )}
      </div>
      <h2 className="mt-4 text-lg font-bold text-neutral-800 group-hover:text-primary">
        {title}
      </h2>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
    </Link>
  )
}
