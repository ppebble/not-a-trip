// ============================================
// 중복 스팟 감지 모듈
// Spec: 40-spot-quality-workflow
// Requirements: 1.1, 1.2, 1.3, 1.6
// ============================================

import { connectToDatabase, COLLECTIONS } from '@/lib/db'
import type {
  DuplicateCheckResult,
  DuplicateCandidate,
  NearbyItem,
} from '@/types/spot-quality'

interface DuplicateDetectorOptions {
  /** 근접 검색 반경 (기본 200m) */
  searchRadius?: number
  /** 유사도 임계값 (기본 0.7) */
  similarityThreshold?: number
  /** 근접 경고 반경 (기본 50m) */
  proximityRadius?: number
}

/**
 * 한글 이름 전처리: 공백/특수문자 제거, 소문자 변환
 * 한글 자모 분리는 유니코드 정규화(NFD)로 처리
 * Requirements: 1.6
 */
export function preprocessName(name: string): string {
  if (!name) return ''

  return (
    name
      // NFD 정규화로 한글 자모 분리 (예: '가' → 'ㄱ' + 'ㅏ')
      .normalize('NFD')
      // 공백, 특수문자 제거 (한글 자모, 영문, 숫자만 유지)
      .replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]/g, '')
      // 소문자 변환
      .toLowerCase()
  )
}

/**
 * Levenshtein 거리 계산
 * 두 문자열 간의 편집 거리를 반환
 */
function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  // DP 테이블 초기화 (메모리 최적화: 두 행만 유지)
  const prevRow: number[] = Array.from({ length: b.length + 1 }, (_, i) => i)
  const currRow: number[] = new Array(b.length + 1).fill(0)

  for (let i = 1; i <= a.length; i++) {
    currRow[0] = i

    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      currRow[j] = Math.min(
        prevRow[j] + 1, // 삭제
        currRow[j - 1] + 1, // 삽입
        prevRow[j - 1] + cost // 교체
      )
    }

    // 현재 행을 이전 행으로 복사
    for (let j = 0; j <= b.length; j++) {
      prevRow[j] = currRow[j]
    }
  }

  return currRow[b.length]
}

/**
 * Levenshtein 거리 기반 유사도 계산 (0~1)
 * 동일 문자열 → 1.0, 완전히 다른 문자열 → 0.0
 * Requirements: 1.6
 */
export function calculateNameSimilarity(name1: string, name2: string): number {
  const a = preprocessName(name1)
  const b = preprocessName(name2)

  // 둘 다 빈 문자열이면 동일로 간주
  if (a.length === 0 && b.length === 0) return 1.0
  // 하나만 빈 문자열이면 완전히 다름
  if (a.length === 0 || b.length === 0) return 0.0

  const distance = levenshteinDistance(a, b)
  const maxLen = Math.max(a.length, b.length)

  return 1 - distance / maxLen
}

/**
 * Haversine 공식으로 두 좌표 간 거리 계산 (미터 단위)
 * Requirements: 1.1, 1.3
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000 // 지구 반지름 (미터)
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * 위도/경도 기반 바운딩 박스 계산 (사전 필터링용)
 * 주어진 반경(미터)에 해당하는 위도/경도 델타 반환
 */
function getBoundingBox(
  lat: number,
  lng: number,
  radiusMeters: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = (radiusMeters / 111320) * 1.1 // 약간의 여유 추가
  const lngDelta =
    (radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180))) * 1.1

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  }
}

/**
 * 중복 감지 실행
 * Haversine 거리 계산으로 200m 이내 조회 후 유사도 필터링
 * Requirements: 1.1, 1.2, 1.3
 */
export async function checkDuplicates(
  coordinates: { lat: number; lng: number },
  name: string,
  options?: DuplicateDetectorOptions
): Promise<DuplicateCheckResult> {
  const searchRadius = options?.searchRadius ?? 200
  const similarityThreshold = options?.similarityThreshold ?? 0.7
  const proximityRadius = options?.proximityRadius ?? 50

  const { lat, lng } = coordinates

  // 바운딩 박스로 사전 필터링 (DB 쿼리 최적화)
  const bbox = getBoundingBox(lat, lng, searchRadius)

  const { db } = await connectToDatabase()

  // spots 컬렉션에서 바운딩 박스 내 스팟 조회
  const spotsCollection = db.collection(COLLECTIONS.SPOTS)
  const rawSpots = await spotsCollection
    .find({
      'coordinates.lat': { $gte: bbox.minLat, $lte: bbox.maxLat },
      'coordinates.lng': { $gte: bbox.minLng, $lte: bbox.maxLng },
    })
    .project({
      _id: 1,
      name: 1,
      coordinates: 1,
      category: 1,
    })
    .limit(100)
    .toArray()

  // spot_reports 컬렉션에서 대기 중인 제보 조회
  const reportsCollection = db.collection(COLLECTIONS.SPOT_REPORTS)
  const rawReports = await reportsCollection
    .find({
      'coordinates.lat': { $gte: bbox.minLat, $lte: bbox.maxLat },
      'coordinates.lng': { $gte: bbox.minLng, $lte: bbox.maxLng },
      status: { $in: ['pending', 'approved'] },
    })
    .project({
      _id: 1,
      name: 1,
      coordinates: 1,
      category: 1,
    })
    .limit(100)
    .toArray()

  const nearbyItems: NearbyItem[] = []
  const highDuplicates: DuplicateCandidate[] = []
  const proximityWarnings: NearbyItem[] = []

  // spots 처리
  for (const spot of rawSpots) {
    const spotCoords = spot.coordinates as { lat: number; lng: number }
    if (!spotCoords?.lat || !spotCoords?.lng) continue

    const distance = haversineDistance(lat, lng, spotCoords.lat, spotCoords.lng)

    // searchRadius 초과 항목 제외 (바운딩 박스 오버샘플링 보정)
    if (distance > searchRadius) continue

    const spotName = (spot.name as string) ?? ''
    const similarity = calculateNameSimilarity(name, spotName)

    const nearbyItem: NearbyItem = {
      id: spot._id.toString(),
      name: spotName,
      coordinates: spotCoords,
      distance,
      type: 'spot',
      category: spot.category as string | undefined,
    }

    nearbyItems.push(nearbyItem)

    // 높은 중복 가능성: 유사도 >= threshold AND searchRadius 이내
    if (similarity >= similarityThreshold) {
      highDuplicates.push({
        ...nearbyItem,
        similarityScore: similarity,
      })
    }

    // 근접 경고: proximityRadius 이내
    if (distance <= proximityRadius) {
      proximityWarnings.push(nearbyItem)
    }
  }

  // spot_reports 처리
  for (const report of rawReports) {
    const reportCoords = report.coordinates as { lat: number; lng: number }
    if (!reportCoords?.lat || !reportCoords?.lng) continue

    const distance = haversineDistance(
      lat,
      lng,
      reportCoords.lat,
      reportCoords.lng
    )

    if (distance > searchRadius) continue

    const reportName = (report.name as string) ?? ''
    const similarity = calculateNameSimilarity(name, reportName)

    const nearbyItem: NearbyItem = {
      id: report._id.toString(),
      name: reportName,
      coordinates: reportCoords,
      distance,
      type: 'report',
      category: report.category as string | undefined,
    }

    nearbyItems.push(nearbyItem)

    if (similarity >= similarityThreshold) {
      highDuplicates.push({
        ...nearbyItem,
        similarityScore: similarity,
      })
    }

    if (distance <= proximityRadius) {
      proximityWarnings.push(nearbyItem)
    }
  }

  // 거리 기준 정렬
  nearbyItems.sort((a, b) => a.distance - b.distance)
  highDuplicates.sort((a, b) => b.similarityScore - a.similarityScore)
  proximityWarnings.sort((a, b) => a.distance - b.distance)

  return {
    nearbyItems,
    highDuplicates,
    proximityWarnings,
  }
}
