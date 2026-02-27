'use client'

import Link from 'next/link'
import { RouteFormContent } from '@/components/route/RouteFormContent'

/**
 * 코스 생성 페이지
 * Requirements: 1.1, 1.2, 1.3, 1.5
 */
export default function RouteCreatePage() {
  return (
    <main className="min-h-screen bg-navy-50 pt-14">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* 뒤로가기 */}
        <div className="mb-4">
          <Link
            href="/routes"
            className="text-sm text-navy-500 transition-colors hover:text-navy-700"
          >
            ← 코스 목록으로
          </Link>
        </div>

        <h1 className="mb-6 text-2xl font-bold text-navy-900">
          🗺️ 새 코스 만들기
        </h1>

        <RouteFormContent />
      </div>
    </main>
  )
}
