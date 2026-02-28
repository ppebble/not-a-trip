// ============================================
// Otaku Facility Types (덕후 특화 편의시설)
// ============================================

export type LockerSize = 'small' | 'medium' | 'large'
export type GoodsShopSubtype = 'subculture_shop' | 'general_store'
export type FacilityStatus = 'active' | 'needs_verification' | 'hidden'

// ============================================
// 카테고리별 상세 인터페이스 (Req 6.2~6.6)
// ============================================

export interface CoinLockerDetails {
  sizes: LockerSize[]
  prices: Record<LockerSize, number | null>
  operatingHours: string | null
  hasLargeLocker: boolean | null
}

export interface SoloDiningDetails {
  hasCounterSeat: boolean | null
  hasSoloMenu: boolean | null
  isQuickMeal: boolean | null
  isLateNight: boolean | null
}

export interface ChargingCafeDetails {
  hasCharging: boolean | null
  hasWifi: boolean | null
}

export interface PublicRestroomDetails {
  isAccessible: boolean | null
  is24Hours: boolean | null
}

export interface GoodsShopDetails {
  subtype: GoodsShopSubtype
  operatingHours: string | null
}

// ============================================
// 판별 유니온 타입 (Discriminated Union)
// ============================================

export type OtakuFacilityDetails =
  | { type: 'coin_locker'; details: CoinLockerDetails }
  | { type: 'solo_dining'; details: SoloDiningDetails }
  | { type: 'charging_cafe'; details: ChargingCafeDetails }
  | { type: 'public_restroom'; details: PublicRestroomDetails }
  | { type: 'goods_shop'; details: GoodsShopDetails }

// ============================================
// 투표 기록 (facility_votes 컬렉션)
// ============================================

export interface FacilityVoteDocument {
  _id?: string
  facilityId: string
  userId: string
  value: boolean // true = 정확해요(👍), false = 아니에요(👎)
  createdAt: Date
  updatedAt: Date
}
