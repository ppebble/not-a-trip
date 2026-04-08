'use client'

import { useState, memo } from 'react'
import { NearbyFacility, OtakuFacilityType } from '@/types'
import {
  CoinLockerDetails,
  SoloDiningDetails,
  ChargingCafeDetails,
  PublicRestroomDetails,
  GoodsShopDetails,
  LockerSize,
} from '@/types/facility'
import MicroVoteButton from './MicroVoteButton'

interface FacilityCardProps {
  facility: NearbyFacility
  config: { label: string; icon: string; color: string }
}

const OTAKU_TYPES: OtakuFacilityType[] = [
  'coin_locker',
  'solo_dining',
  'charging_cafe',
  'public_restroom',
  'goods_shop',
]

const LOCKER_SIZE_LABEL: Record<LockerSize, string> = {
  small: '소형',
  medium: '중형',
  large: '대형',
}

/** "정보 미등록" 표시용 헬퍼 */
function InfoOrFallback({
  value,
  children,
}: {
  value: unknown
  children: React.ReactNode
}) {
  if (value === null || value === undefined) {
    return <span className="text-xs text-neutral-400">정보 미등록</span>
  }
  return <>{children}</>
}

/** boolean 필드를 아이콘+라벨로 표시 */
function BoolBadge({
  value,
  trueLabel,
  falseLabel,
  trueIcon,
  falseIcon,
}: {
  value: boolean | null
  trueLabel: string
  falseLabel?: string
  trueIcon: string
  falseIcon?: string
}) {
  if (value === null || value === undefined) {
    return <span className="text-xs text-neutral-400">정보 미등록</span>
  }
  if (value) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        {trueIcon} {trueLabel}
      </span>
    )
  }
  return falseLabel ? (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
      {falseIcon ?? '✕'} {falseLabel}
    </span>
  ) : null
}

// ─── 카테고리별 상세 렌더링 ───

function CoinLockerDetail({ details }: { details: CoinLockerDetails }) {
  return (
    <div className="mt-3 space-y-2 rounded-md bg-purple-50/50 p-3 text-sm">
      {/* 크기별 가격 테이블 */}
      <div>
        <span className="mb-1 block text-xs font-semibold text-neutral-500">
          크기 / 가격
        </span>
        {details.sizes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {details.sizes.map((size) => (
              <div
                key={size}
                className="rounded-md border border-purple-200 bg-surface px-2 py-1 text-xs"
              >
                <span className="font-medium text-purple-700">
                  {LOCKER_SIZE_LABEL[size]}
                </span>
                <span className="ml-1 text-neutral-600">
                  {details.prices[size] != null
                    ? `¥${details.prices[size]}`
                    : '가격 미등록'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-xs text-neutral-400">정보 미등록</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <BoolBadge
          value={details.hasLargeLocker}
          trueLabel="대형 로커 있음"
          falseLabel="대형 로커 없음"
          trueIcon="🧳"
          falseIcon="✕"
        />
        <InfoOrFallback value={details.operatingHours}>
          <span className="inline-flex items-center gap-0.5 text-xs text-neutral-600">
            ⏰ {details.operatingHours}
          </span>
        </InfoOrFallback>
      </div>
    </div>
  )
}

function SoloDiningDetail({ details }: { details: SoloDiningDetails }) {
  return (
    <div className="mt-3 space-y-2 rounded-md bg-rose-50/50 p-3 text-sm">
      {/* 1인 OK 태그 */}
      <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">
        🍜 1인 OK
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <BoolBadge
          value={details.hasCounterSeat}
          trueLabel="카운터석"
          trueIcon="🪑"
        />
        <BoolBadge
          value={details.hasSoloMenu}
          trueLabel="1인 메뉴"
          trueIcon="📋"
        />
        <BoolBadge
          value={details.isQuickMeal}
          trueLabel="빠른 식사"
          trueIcon="⚡"
        />
        <BoolBadge
          value={details.isLateNight}
          trueLabel="심야 영업"
          trueIcon="🌙"
        />
      </div>
    </div>
  )
}

function ChargingCafeDetail({ details }: { details: ChargingCafeDetails }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2 rounded-md bg-cyan-50/50 p-3 text-sm">
      <BoolBadge
        value={details.hasCharging}
        trueLabel="충전 가능"
        falseLabel="충전 불가"
        trueIcon="🔌"
        falseIcon="✕"
      />
      <BoolBadge
        value={details.hasWifi}
        trueLabel="무료 Wi-Fi"
        falseLabel="Wi-Fi 없음"
        trueIcon="📶"
        falseIcon="✕"
      />
    </div>
  )
}

function PublicRestroomDetail({ details }: { details: PublicRestroomDetails }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2 rounded-md bg-teal-50/50 p-3 text-sm">
      <BoolBadge
        value={details.isAccessible}
        trueLabel="장애인 접근 가능"
        falseLabel="접근 제한"
        trueIcon="♿"
        falseIcon="✕"
      />
      <BoolBadge
        value={details.is24Hours}
        trueLabel="24시간"
        falseLabel="시간 제한"
        trueIcon="🕐"
        falseIcon="✕"
      />
    </div>
  )
}

function GoodsShopDetail({ details }: { details: GoodsShopDetails }) {
  const subtypeLabel =
    details.subtype === 'subculture_shop' ? '서브컬처 매장' : '대형 잡화점'
  const subtypeColor =
    details.subtype === 'subculture_shop'
      ? 'bg-pink-100 text-pink-700'
      : 'bg-amber-100 text-amber-700'

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md bg-pink-50/50 p-3 text-sm">
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${subtypeColor}`}
      >
        🛍️ {subtypeLabel}
      </span>
      <InfoOrFallback value={details.operatingHours}>
        <span className="inline-flex items-center gap-0.5 text-xs text-neutral-600">
          ⏰ {details.operatingHours}
        </span>
      </InfoOrFallback>
    </div>
  )
}

/** otakuDetails에서 카테고리별 상세 컴포넌트 분기 */
function OtakuDetailsSection({ facility }: { facility: NearbyFacility }) {
  const od = facility.otakuDetails
  if (!od) return null

  switch (od.type) {
    case 'coin_locker':
      return <CoinLockerDetail details={od.details} />
    case 'solo_dining':
      return <SoloDiningDetail details={od.details} />
    case 'charging_cafe':
      return <ChargingCafeDetail details={od.details} />
    case 'public_restroom':
      return <PublicRestroomDetail details={od.details} />
    case 'goods_shop':
      return <GoodsShopDetail details={od.details} />
    default:
      return null
  }
}

/** 신뢰도 점수 + 투표 수 표시 (Otaku_Category 전용) */
function VerificationBadge({ facility }: { facility: NearbyFacility }) {
  if (
    facility.verificationScore === undefined ||
    facility.upvotes === undefined ||
    facility.downvotes === undefined
  ) {
    return null
  }

  const score = facility.verificationScore
  const scoreColor =
    score >= 70
      ? 'text-green-600'
      : score >= 40
        ? 'text-yellow-600'
        : 'text-red-500'

  return (
    <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
      <span className={`font-semibold ${scoreColor}`}>✅ 신뢰도 {score}%</span>
      <span>👍{facility.upvotes}</span>
      <span>👎{facility.downvotes}</span>
    </div>
  )
}

// ─── 메인 FacilityCard ───

export default memo(function FacilityCard({
  facility,
  config,
}: FacilityCardProps) {
  const [voteData, setVoteData] = useState({
    verificationScore: facility.verificationScore,
    upvotes: facility.upvotes,
    downvotes: facility.downvotes,
  })

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  const handleMapClick = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.name)}`
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')
  }

  const handleVoteComplete = (result: {
    verificationScore: number
    upvotes: number
    downvotes: number
  }) => {
    setVoteData(result)
  }

  const showAddress = facility.address && facility.address !== '주소 정보 없음'
  const isOtaku = OTAKU_TYPES.includes(facility.type as OtakuFacilityType)

  // VerificationBadge에 실시간 투표 데이터 반영
  const displayFacility = isOtaku ? { ...facility, ...voteData } : facility

  return (
    <div className="rounded-lg border border-neutral-200 p-4 transition-all hover:border-neutral-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center space-x-2">
            <h4 className="truncate font-semibold text-neutral-900">
              {facility.name}
            </h4>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${config.color}`}
            >
              {config.label}
            </span>
          </div>

          <div className="space-y-1 text-sm text-neutral-600">
            {showAddress && (
              <div className="flex items-center space-x-1">
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="truncate">{facility.address}</span>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="font-medium text-primary">
                {formatDistance(facility.distance)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleMapClick}
          className="ml-2 flex-shrink-0 rounded-md bg-primary-50 p-2 text-primary transition-colors hover:bg-primary-100 hover:text-primary-600"
          title="지도에서 보기"
          aria-label={`${facility.name} 지도에서 보기`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </button>
      </div>

      {/* Otaku_Category 상세 정보 */}
      {isOtaku && <OtakuDetailsSection facility={facility} />}

      {/* 신뢰도 점수 + 투표 수 (실시간 반영) */}
      {isOtaku && <VerificationBadge facility={displayFacility} />}

      {/* 마이크로 투표 버튼 */}
      {isOtaku && (
        <MicroVoteButton
          facilityId={facility.id}
          onVoteComplete={handleVoteComplete}
        />
      )}
    </div>
  )
})
