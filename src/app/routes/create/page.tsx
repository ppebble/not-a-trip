'use client'

import Link from 'next/link'
import { RouteFormContent } from '@/components/route/RouteFormContent'

/**
 * 코스 생성 페이지
 * Requirements: 1.1, 1.2, 1.3, 1.5
 */
export default function RouteCreatePage() {
  return (
    <main className="bg-navy-50 min-h-screen pt-14">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* 뒤로가기 */}
        <div className="mb-4">
          <Link
            href="/routes"
            className="text-navy-500 hover:text-navy-700 text-sm transition-colors"
          >
            ← 코스 목록으로
          </Link>
        </div>

        <h1 className="text-navy-900 mb-6 text-2xl font-bold">
          🗺️ 새 코스 만들기
        </h1>

        <RouteFormContent />
      </div>
    </main>
  )
}
