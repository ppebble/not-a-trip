'use client'

import { useState } from 'react'
import SwipeableGallery from '@/components/mobile/SwipeableGallery'
import DirectionsButton from '@/components/common/DirectionsButton'

const SAMPLE_IMAGES = [
  '/uploads/1768301458149-cn502o.jpg',
  '/uploads/1768404159000-3r5dcl.jpg',
  '/uploads/1768404188413-5hnnlt.jpg',
]

export default function SwipeableGalleryTestPage() {
  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <h1 className="text-xl font-bold text-navy-800">
          🧪 SwipeableGallery + DirectionsButton 테스트
        </h1>
      </div>

      <div className="mx-auto max-w-lg space-y-6 p-4">
        {/* SwipeableGallery 테스트 */}
        <section>
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            SwipeableGallery
          </h2>
          <div className="overflow-hidden rounded-lg">
            <SwipeableGallery
              images={SAMPLE_IMAGES}
              onIndexChange={setCurrentIndex}
            />
          </div>
        </section>

        {/* 상태 표시 패널 */}
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-gray-500">현재 상태</h3>
          <div className="space-y-1 text-sm">
            <p>
              현재 인덱스:{' '}
              <span className="font-mono font-bold text-navy-600">
                {currentIndex}
              </span>
            </p>
            <p>
              전체 이미지:{' '}
              <span className="font-mono">{SAMPLE_IMAGES.length}</span>
            </p>
          </div>
        </section>

        {/* DirectionsButton 테스트 */}
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            DirectionsButton
          </h2>
          <p className="mb-3 text-sm text-gray-600">
            도쿄 타워 (35.6762, 139.6503)
          </p>
          <DirectionsButton
            lat={35.6762}
            lng={139.6503}
            destinationName="도쿄 타워"
          />
        </section>
      </div>
    </div>
  )
}
