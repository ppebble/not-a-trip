'use client'

import { useState } from 'react'
import { EvidencePairUpload } from '@/components/report/EvidencePairUpload'
import { NearbySpotWarning } from '@/components/report/NearbySpotWarning'
import { ReportStatusBadge } from '@/components/report/ReportStatusBadge'
import type { EvidencePair, ReportStatus } from '@/types/report'
import type { NearbyItem } from '@/hooks/useNearbyCheck'

const MOCK_NEARBY: NearbyItem[] = [
  {
    id: '1',
    name: '스와 신사 (諏訪神社)',
    coordinates: { lat: 35.676, lng: 139.65 },
    category: 'animation',
    type: 'spot',
    distance: 23,
  },
  {
    id: '2',
    name: '키미노나와 계단',
    coordinates: { lat: 35.6765, lng: 139.651 },
    type: 'report',
    distance: 45,
  },
]

const STATUSES: ReportStatus[] = [
  'pending',
  'approved',
  'rejected',
  'revision_requested',
]

export default function ReportUITestPage() {
  const [pairs, setPairs] = useState<EvidencePair[]>([])
  const [showNearby, setShowNearby] = useState(true)

  return (
    <div className="mx-auto max-w-lg space-y-8 p-4">
      <h1 className="text-xl font-bold text-navy-800">
        🧪 제보 UI 컴포넌트 테스트
      </h1>

      {/* ReportStatusBadge */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-navy-600">
          ReportStatusBadge
        </h2>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <ReportStatusBadge key={s} status={s} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <ReportStatusBadge key={s} status={s} size="md" />
          ))}
        </div>
      </section>

      {/* NearbySpotWarning */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-navy-600">
          NearbySpotWarning
        </h2>
        <button
          onClick={() => setShowNearby(!showNearby)}
          className="text-xs text-navy-500 underline"
        >
          {showNearby ? '숨기기' : '표시'}
        </button>
        {showNearby && (
          <NearbySpotWarning
            nearbyItems={MOCK_NEARBY}
            isLoading={false}
            onContinue={() => alert('계속 진행')}
            onSelectSpot={(id) => alert(`스팟 선택: ${id}`)}
          />
        )}
        <NearbySpotWarning
          nearbyItems={[]}
          isLoading={true}
          onContinue={() => {}}
          onSelectSpot={() => {}}
        />
      </section>

      {/* EvidencePairUpload */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-navy-600">
          EvidencePairUpload
        </h2>
        <EvidencePairUpload pairs={pairs} onChange={setPairs} />
        <div className="rounded bg-navy-50 p-2 text-xs text-navy-500">
          현재 완성된 쌍: {pairs.length}개
          {pairs.map((p, i) => (
            <div key={i}>
              쌍 {i + 1}: capture={p.captureImageUrl ? '✓' : '✗'}, real=
              {p.realPhotoUrl ? '✓' : '✗'}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
