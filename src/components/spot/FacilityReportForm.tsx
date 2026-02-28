'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FacilityType, OtakuFacilityType } from '@/types'
import {
  LockerSize,
  GoodsShopSubtype,
  CoinLockerDetails,
  SoloDiningDetails,
  ChargingCafeDetails,
  PublicRestroomDetails,
  GoodsShopDetails,
} from '@/types/facility'
import { LoginRequiredModal } from '@/components/common'
import { API_ROUTES } from '@/lib/api-routes'
import GooglePlacesSearch from './GooglePlacesSearch'
import LocationPickerMap from './LocationPickerMap'
import { useGeolocation } from '@/hooks/useGeolocation'

// ─── 타입 정의 ───

type InputMode = 'search' | 'pin' | null

interface FormData {
  name: string
  type: FacilityType | ''
  coordinates: { lat: number; lng: number } | null
  address: string
  googlePlaceId?: string
  // 카테고리별 상세
  coinLocker: CoinLockerDetails
  soloDining: SoloDiningDetails
  chargingCafe: ChargingCafeDetails
  publicRestroom: PublicRestroomDetails
  goodsShop: GoodsShopDetails
}

interface FormErrors {
  name?: string
  type?: string
  coordinates?: string
}

interface FacilityReportFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  /** 스팟 좌표 (직접 핀 모드 기본 위치) */
  spotCoordinates?: { lat: number; lng: number }
}

// ─── 상수 ───

const ALL_FACILITY_TYPES: {
  value: FacilityType
  label: string
  icon: string
}[] = [
  { value: 'restaurant', label: '음식점', icon: '🍽️' },
  { value: 'convenience_store', label: '편의점', icon: '🏪' },
  { value: 'cafe', label: '카페', icon: '☕' },
  { value: 'station', label: '역/정류장', icon: '🚉' },
  { value: 'other', label: '기타', icon: '📍' },
  { value: 'coin_locker', label: '코인 로커', icon: '🔐' },
  { value: 'solo_dining', label: '혼밥 식당', icon: '🍜' },
  { value: 'charging_cafe', label: '충전/와이파이', icon: '🔌' },
  { value: 'public_restroom', label: '화장실', icon: '🚻' },
  { value: 'goods_shop', label: '굿즈/잡화', icon: '🛍️' },
]

const OTAKU_TYPES: OtakuFacilityType[] = [
  'coin_locker',
  'solo_dining',
  'charging_cafe',
  'public_restroom',
  'goods_shop',
]

const INITIAL_COIN_LOCKER: CoinLockerDetails = {
  sizes: [],
  prices: { small: null, medium: null, large: null },
  operatingHours: null,
  hasLargeLocker: null,
}

const INITIAL_SOLO_DINING: SoloDiningDetails = {
  hasCounterSeat: null,
  hasSoloMenu: null,
  isQuickMeal: null,
  isLateNight: null,
}

const INITIAL_CHARGING_CAFE: ChargingCafeDetails = {
  hasCharging: null,
  hasWifi: null,
}

const INITIAL_PUBLIC_RESTROOM: PublicRestroomDetails = {
  isAccessible: null,
  is24Hours: null,
}

const INITIAL_GOODS_SHOP: GoodsShopDetails = {
  subtype: 'subculture_shop',
  operatingHours: null,
}

function getInitialFormData(): FormData {
  return {
    name: '',
    type: '',
    coordinates: null,
    address: '',
    coinLocker: {
      ...INITIAL_COIN_LOCKER,
      prices: { ...INITIAL_COIN_LOCKER.prices },
    },
    soloDining: { ...INITIAL_SOLO_DINING },
    chargingCafe: { ...INITIAL_CHARGING_CAFE },
    publicRestroom: { ...INITIAL_PUBLIC_RESTROOM },
    goodsShop: { ...INITIAL_GOODS_SHOP },
  }
}

// ─── 카테고리별 동적 필드 컴포넌트 ───

function CoinLockerFields({
  data,
  onChange,
}: {
  data: CoinLockerDetails
  onChange: (d: CoinLockerDetails) => void
}) {
  const toggleSize = (size: LockerSize) => {
    const next = data.sizes.includes(size)
      ? data.sizes.filter((s) => s !== size)
      : [...data.sizes, size]
    onChange({ ...data, sizes: next })
  }

  return (
    <fieldset className="space-y-3 rounded-md border border-purple-200 bg-purple-50/30 p-3">
      <legend className="px-1 text-sm font-semibold text-purple-700">
        🔐 코인 로커 상세
      </legend>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          크기 선택
        </label>
        <div className="flex gap-2">
          {(['small', 'medium', 'large'] as LockerSize[]).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                data.sizes.includes(size)
                  ? 'border-purple-400 bg-purple-100 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {{ small: '소형', medium: '중형', large: '대형' }[size]}
            </button>
          ))}
        </div>
      </div>

      {data.sizes.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            가격 (엔)
          </label>
          <div className="flex flex-wrap gap-2">
            {data.sizes.map((size) => (
              <div key={size} className="flex items-center gap-1">
                <span className="text-xs text-gray-500">
                  {{ small: '소형', medium: '중형', large: '대형' }[size]}
                </span>
                <input
                  type="number"
                  min={0}
                  placeholder="¥"
                  value={data.prices[size] ?? ''}
                  onChange={(e) => {
                    const val =
                      e.target.value === '' ? null : Number(e.target.value)
                    onChange({
                      ...data,
                      prices: { ...data.prices, [size]: val },
                    })
                  }}
                  className="w-20 rounded border border-gray-200 px-2 py-1 text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          이용 시간
        </label>
        <input
          type="text"
          placeholder="예: 05:00-24:00"
          value={data.operatingHours ?? ''}
          onChange={(e) =>
            onChange({ ...data, operatingHours: e.target.value || null })
          }
          className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          대형 로커 (캐리어 보관)
        </label>
        <TriToggle
          value={data.hasLargeLocker}
          onChange={(v) => onChange({ ...data, hasLargeLocker: v })}
          trueLabel="있음"
          falseLabel="없음"
        />
      </div>
    </fieldset>
  )
}

function SoloDiningFields({
  data,
  onChange,
}: {
  data: SoloDiningDetails
  onChange: (d: SoloDiningDetails) => void
}) {
  return (
    <fieldset className="space-y-3 rounded-md border border-rose-200 bg-rose-50/30 p-3">
      <legend className="px-1 text-sm font-semibold text-rose-700">
        🍜 혼밥 식당 상세
      </legend>
      <div className="grid grid-cols-2 gap-3">
        <TriToggleField
          label="카운터석"
          value={data.hasCounterSeat}
          onChange={(v) => onChange({ ...data, hasCounterSeat: v })}
        />
        <TriToggleField
          label="1인 메뉴"
          value={data.hasSoloMenu}
          onChange={(v) => onChange({ ...data, hasSoloMenu: v })}
        />
        <TriToggleField
          label="빠른 식사"
          value={data.isQuickMeal}
          onChange={(v) => onChange({ ...data, isQuickMeal: v })}
        />
        <TriToggleField
          label="심야 영업"
          value={data.isLateNight}
          onChange={(v) => onChange({ ...data, isLateNight: v })}
        />
      </div>
    </fieldset>
  )
}

function ChargingCafeFields({
  data,
  onChange,
}: {
  data: ChargingCafeDetails
  onChange: (d: ChargingCafeDetails) => void
}) {
  return (
    <fieldset className="space-y-3 rounded-md border border-cyan-200 bg-cyan-50/30 p-3">
      <legend className="px-1 text-sm font-semibold text-cyan-700">
        🔌 충전/와이파이 상세
      </legend>
      <div className="grid grid-cols-2 gap-3">
        <TriToggleField
          label="충전 콘센트"
          value={data.hasCharging}
          onChange={(v) => onChange({ ...data, hasCharging: v })}
        />
        <TriToggleField
          label="무료 Wi-Fi"
          value={data.hasWifi}
          onChange={(v) => onChange({ ...data, hasWifi: v })}
        />
      </div>
    </fieldset>
  )
}

function PublicRestroomFields({
  data,
  onChange,
}: {
  data: PublicRestroomDetails
  onChange: (d: PublicRestroomDetails) => void
}) {
  return (
    <fieldset className="space-y-3 rounded-md border border-teal-200 bg-teal-50/30 p-3">
      <legend className="px-1 text-sm font-semibold text-teal-700">
        🚻 화장실 상세
      </legend>
      <div className="grid grid-cols-2 gap-3">
        <TriToggleField
          label="장애인 접근 가능"
          value={data.isAccessible}
          onChange={(v) => onChange({ ...data, isAccessible: v })}
        />
        <TriToggleField
          label="24시간 이용"
          value={data.is24Hours}
          onChange={(v) => onChange({ ...data, is24Hours: v })}
        />
      </div>
    </fieldset>
  )
}

function GoodsShopFields({
  data,
  onChange,
}: {
  data: GoodsShopDetails
  onChange: (d: GoodsShopDetails) => void
}) {
  return (
    <fieldset className="space-y-3 rounded-md border border-pink-200 bg-pink-50/30 p-3">
      <legend className="px-1 text-sm font-semibold text-pink-700">
        🛍️ 굿즈/잡화 상세
      </legend>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          매장 유형
        </label>
        <div className="flex gap-2">
          {[
            {
              value: 'subculture_shop' as GoodsShopSubtype,
              label: '서브컬처 매장',
            },
            {
              value: 'general_store' as GoodsShopSubtype,
              label: '대형 잡화점',
            },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...data, subtype: opt.value })}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                data.subtype === opt.value
                  ? 'border-pink-400 bg-pink-100 text-pink-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          영업시간
        </label>
        <input
          type="text"
          placeholder="예: 10:00-21:00"
          value={data.operatingHours ?? ''}
          onChange={(e) =>
            onChange({ ...data, operatingHours: e.target.value || null })
          }
          className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm"
        />
      </div>
    </fieldset>
  )
}

// ─── 공통 UI 헬퍼 ───

/** 3-state 토글: null(미선택) / true / false */
function TriToggle({
  value,
  onChange,
  trueLabel = '예',
  falseLabel = '아니오',
}: {
  value: boolean | null
  onChange: (v: boolean | null) => void
  trueLabel?: string
  falseLabel?: string
}) {
  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => onChange(value === true ? null : true)}
        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
          value === true
            ? 'border-green-400 bg-green-100 text-green-700'
            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
        }`}
      >
        {trueLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(value === false ? null : false)}
        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
          value === false
            ? 'border-red-400 bg-red-100 text-red-700'
            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
        }`}
      >
        {falseLabel}
      </button>
    </div>
  )
}

function TriToggleField({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean | null
  onChange: (v: boolean | null) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <TriToggle value={value} onChange={onChange} />
    </div>
  )
}

// ─── 메인 FacilityReportForm ───

export default function FacilityReportForm({
  isOpen,
  onClose,
  onSuccess,
  spotCoordinates,
}: FacilityReportFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [inputMode, setInputMode] = useState<InputMode>(null)
  const [formData, setFormData] = useState<FormData>(getInitialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<'success' | 'error' | null>(
    null
  )
  const [serverError, setServerError] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const geo = useGeolocation()

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData())
    setErrors({})
    setInputMode(null)
    setSubmitResult(null)
    setServerError('')
    setIsMapOpen(false)
  }, [])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요'
    if (!formData.type) newErrors.type = '카테고리를 선택해주세요'
    if (!formData.coordinates) newErrors.coordinates = '위치를 지정해주세요'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buildOtakuDetails = () => {
    if (
      !formData.type ||
      !OTAKU_TYPES.includes(formData.type as OtakuFacilityType)
    ) {
      return undefined
    }
    switch (formData.type) {
      case 'coin_locker':
        return formData.coinLocker
      case 'solo_dining':
        return formData.soloDining
      case 'charging_cafe':
        return formData.chargingCafe
      case 'public_restroom':
        return formData.publicRestroom
      case 'goods_shop':
        return formData.goodsShop
      default:
        return undefined
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      setShowLoginModal(true)
      return
    }

    if (!validate()) return

    setIsSubmitting(true)
    setSubmitResult(null)
    setServerError('')

    try {
      const body = {
        name: formData.name.trim(),
        type: formData.type,
        coordinates: formData.coordinates,
        address: formData.address.trim(),
        ...(formData.googlePlaceId && {
          googlePlaceId: formData.googlePlaceId,
        }),
        ...(buildOtakuDetails() && { otakuDetails: buildOtakuDetails() }),
      }

      const res = await fetch(API_ROUTES.FACILITIES.REPORT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || data.message || '제보에 실패했습니다')
      }

      setSubmitResult('success')
      setTimeout(() => {
        resetForm()
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (err) {
      setSubmitResult('error')
      setServerError(err instanceof Error ? err.message : '제보에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 직접 핀 모드에서 스팟 좌표를 기본값으로 사용
  const handlePinMode = () => {
    setInputMode('pin')
  }

  // 현재 위치로 좌표 설정
  const handleCurrentLocation = () => {
    geo.getCurrentPosition()
  }

  // geo 좌표가 업데이트되면 formData에 반영
  const applyGeoCoordinates = useCallback(() => {
    if (geo.coordinates) {
      setFormData((prev) => ({ ...prev, coordinates: geo.coordinates }))
      setErrors((prev) => ({ ...prev, coordinates: undefined }))
    }
  }, [geo.coordinates])

  useEffect(() => {
    applyGeoCoordinates()
  }, [applyGeoCoordinates])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl">
          {/* 헤더 */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">편의시설 제보</h2>
            <button
              onClick={handleClose}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="닫기"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            {/* 성공 메시지 */}
            {submitResult === 'success' && (
              <div className="rounded-md bg-green-50 p-3 text-center text-sm font-medium text-green-700">
                ✅ 제보가 완료되었습니다. 감사합니다!
              </div>
            )}

            {/* 서버 에러 메시지 */}
            {submitResult === 'error' && serverError && (
              <div className="rounded-md bg-red-50 p-3 text-center text-sm font-medium text-red-700">
                ❌ {serverError}
              </div>
            )}

            {/* Step 1: 장소 입력 방식 선택 */}
            {!inputMode && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  장소를 어떻게 등록하시겠어요?
                </p>
                <button
                  type="button"
                  onClick={() => setInputMode('search')}
                  className="w-full rounded-lg border-2 border-gray-200 p-4 text-left transition-colors hover:border-navy-300 hover:bg-navy-50/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔍</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        구글맵 장소 검색
                      </p>
                      <p className="text-xs text-gray-500">
                        식당, 카페 등 이미 있는 장소에 덕후 정보만 추가
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handlePinMode}
                  className="w-full rounded-lg border-2 border-gray-200 p-4 text-left transition-colors hover:border-navy-300 hover:bg-navy-50/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        지도에 직접 핀 꽂기
                      </p>
                      <p className="text-xs text-gray-500">
                        코인 로커, 화장실 등 지도에 없는 장소를 새로 등록
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Step 2: 폼 필드 (입력 방식 선택 후) */}
            {inputMode && (
              <>
                {/* 입력 방식 변경 버튼 */}
                <button
                  type="button"
                  onClick={() => {
                    setInputMode(null)
                    setFormData((prev) => ({
                      ...prev,
                      coordinates: null,
                      googlePlaceId: undefined,
                    }))
                  }}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  ← 입력 방식 다시 선택
                </button>

                {/* 구글맵 검색 모드 */}
                {inputMode === 'search' && (
                  <div className="space-y-3">
                    <GooglePlacesSearch
                      biasCenter={spotCoordinates}
                      onSelect={(place) => {
                        setFormData((prev) => ({
                          ...prev,
                          name: place.name,
                          address: place.address,
                          coordinates: place.coordinates,
                          googlePlaceId: place.googlePlaceId,
                        }))
                        setErrors({})
                      }}
                    />

                    {/* 현재 위치 버튼 */}
                    <button
                      type="button"
                      onClick={() => {
                        handleCurrentLocation()
                        // geo 결과는 비동기이므로 effect로 처리
                      }}
                      disabled={geo.isLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      {geo.isLoading ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          위치 확인 중...
                        </>
                      ) : (
                        <>🎯 내 현재 위치로 설정</>
                      )}
                    </button>
                    {geo.error && (
                      <p className="text-xs text-red-500">
                        {geo.error.message}
                      </p>
                    )}
                    {formData.coordinates && !formData.googlePlaceId && (
                      <p className="text-xs text-green-600">
                        ✅ 현재 위치가 설정되었습니다 (
                        {formData.coordinates.lat.toFixed(4)},{' '}
                        {formData.coordinates.lng.toFixed(4)})
                      </p>
                    )}
                  </div>
                )}

                {/* 직접 핀 모드 */}
                {inputMode === 'pin' && (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        이름 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="편의시설 이름"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        주소
                      </label>
                      <input
                        type="text"
                        placeholder="주소 (선택)"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        위치 <span className="text-red-500">*</span>
                      </label>

                      {/* 지도에서 위치 선택 버튼 */}
                      <button
                        type="button"
                        onClick={() => setIsMapOpen(true)}
                        className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy-300 bg-navy-50/50 py-3 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-50"
                      >
                        📍 지도에서 위치 선택하기
                      </button>

                      {/* 현재 위치 버튼 */}
                      <button
                        type="button"
                        onClick={() => {
                          handleCurrentLocation()
                        }}
                        disabled={geo.isLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                      >
                        {geo.isLoading ? (
                          <>
                            <svg
                              className="h-4 w-4 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            위치 확인 중...
                          </>
                        ) : (
                          <>🎯 내 현재 위치로 설정</>
                        )}
                      </button>
                      {geo.error && (
                        <p className="mt-1 text-xs text-red-500">
                          {geo.error.message}
                        </p>
                      )}

                      {errors.coordinates && !formData.coordinates && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.coordinates}
                        </p>
                      )}
                      {formData.coordinates && (
                        <p className="mt-1 text-xs text-green-600">
                          ✅ 위치가 선택되었습니다 (
                          {formData.coordinates.lat.toFixed(4)},{' '}
                          {formData.coordinates.lng.toFixed(4)})
                        </p>
                      )}
                    </div>

                    {/* 지도 모달 */}
                    <LocationPickerMap
                      isOpen={isMapOpen}
                      onClose={() => setIsMapOpen(false)}
                      onConfirm={(coords) => {
                        setFormData((prev) => ({
                          ...prev,
                          coordinates: coords,
                        }))
                        setErrors((prev) => ({
                          ...prev,
                          coordinates: undefined,
                        }))
                      }}
                      center={
                        spotCoordinates ?? { lat: 35.6812, lng: 139.7671 }
                      }
                    />
                  </div>
                )}

                {/* 카테고리 선택 */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as FacilityType,
                      }))
                    }
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.type ? 'border-red-400' : 'border-gray-200'}`}
                  >
                    <option value="">카테고리 선택...</option>
                    <optgroup label="일반 편의시설">
                      {ALL_FACILITY_TYPES.filter(
                        (t) =>
                          !OTAKU_TYPES.includes(t.value as OtakuFacilityType)
                      ).map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.icon} {t.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="덕후 특화 편의시설">
                      {ALL_FACILITY_TYPES.filter((t) =>
                        OTAKU_TYPES.includes(t.value as OtakuFacilityType)
                      ).map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.icon} {t.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-xs text-red-500">{errors.type}</p>
                  )}
                </div>

                {/* 카테고리별 동적 필드 */}
                {formData.type === 'coin_locker' && (
                  <CoinLockerFields
                    data={formData.coinLocker}
                    onChange={(d) =>
                      setFormData((prev) => ({ ...prev, coinLocker: d }))
                    }
                  />
                )}
                {formData.type === 'solo_dining' && (
                  <SoloDiningFields
                    data={formData.soloDining}
                    onChange={(d) =>
                      setFormData((prev) => ({ ...prev, soloDining: d }))
                    }
                  />
                )}
                {formData.type === 'charging_cafe' && (
                  <ChargingCafeFields
                    data={formData.chargingCafe}
                    onChange={(d) =>
                      setFormData((prev) => ({ ...prev, chargingCafe: d }))
                    }
                  />
                )}
                {formData.type === 'public_restroom' && (
                  <PublicRestroomFields
                    data={formData.publicRestroom}
                    onChange={(d) =>
                      setFormData((prev) => ({ ...prev, publicRestroom: d }))
                    }
                  />
                )}
                {formData.type === 'goods_shop' && (
                  <GoodsShopFields
                    data={formData.goodsShop}
                    onChange={(d) =>
                      setFormData((prev) => ({ ...prev, goodsShop: d }))
                    }
                  />
                )}

                {/* 제출 버튼 */}
                <button
                  type="submit"
                  disabled={isSubmitting || submitResult === 'success'}
                  className="w-full rounded-lg bg-navy-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700 disabled:opacity-50"
                >
                  {isSubmitting ? '제보 중...' : '제보하기'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onConfirm={() => {
          setShowLoginModal(false)
          router.push('/auth/signin')
        }}
        description="편의시설을 제보하려면 로그인이 필요합니다."
      />
    </>
  )
}
