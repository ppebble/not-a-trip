/**
 * 스팟 품질 워크플로 MongoDB 컬렉션 초기화 스크립트
 * Spec: 40-spot-quality-workflow
 *
 * 실행: npx tsx scripts/init-spot-quality-collections.ts
 *
 * 수행 작업:
 * 1. spot_quality_reports 컬렉션 인덱스 4개 생성
 * 2. spot_lifecycle_history 컬렉션 인덱스 생성
 * 3. supplement_requests 컬렉션 인덱스 2개 생성
 * 4. spots 컬렉션에 lifecycleStatus, closureSuspected, urgentReviewRequired 필드 기본값 마이그레이션
 *
 * Requirements: 2.1, 2.6, 3.2, 4.1
 */

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'

function extractDbNameFromUri(uri: string): string {
  const match = uri.match(/\/([^/?]+)(\?|$)/)
  return match ? match[1] : 'not-a-trip'
}

const MONGODB_DB = process.env.MONGODB_DB || extractDbNameFromUri(MONGODB_URI)

async function initSpotQualityCollections(): Promise<void> {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log('MongoDB에 연결 중...')
    await client.connect()
    console.log(`MongoDB 연결 성공! (DB: ${MONGODB_DB})`)

    const db = client.db(MONGODB_DB)

    // ─────────────────────────────────────────────────────────────
    // 1. spot_quality_reports 컬렉션 인덱스 생성
    // ─────────────────────────────────────────────────────────────
    console.log('\n🔧 spot_quality_reports 인덱스 생성 시작...')
    const qualityReports = db.collection('spot_quality_reports')

    // 스팟별 신고 유형/상태 조회용
    await qualityReports.createIndex(
      { spotId: 1, reportType: 1, status: 1 },
      { background: true }
    )
    console.log('  ✅ { spotId, reportType, status } 인덱스 생성 완료')

    // 중복 신고 검증용 (24시간 이내 동일 사용자/스팟/유형)
    await qualityReports.createIndex(
      { reporterId: 1, spotId: 1, reportType: 1, createdAt: -1 },
      { background: true }
    )
    console.log(
      '  ✅ { reporterId, spotId, reportType, createdAt } 인덱스 생성 완료'
    )

    // SLA 기한 관리용 (상태별 기한 조회)
    await qualityReports.createIndex(
      { status: 1, deadline: 1 },
      { background: true }
    )
    console.log('  ✅ { status, deadline } 인덱스 생성 완료')

    // 누적 카운트용 (동일 스팟/유형 신고 집계)
    await qualityReports.createIndex(
      { spotId: 1, reportType: 1, createdAt: -1 },
      { background: true }
    )
    console.log(
      '  ✅ { spotId, reportType, createdAt } 인덱스 생성 완료 (누적 카운트용)'
    )

    console.log('✅ spot_quality_reports 인덱스 생성 완료 (4개)')

    // ─────────────────────────────────────────────────────────────
    // 2. spot_lifecycle_history 컬렉션 인덱스 생성
    // ─────────────────────────────────────────────────────────────
    console.log('\n🔧 spot_lifecycle_history 인덱스 생성 시작...')
    const lifecycleHistory = db.collection('spot_lifecycle_history')

    // 스팟별 이력 시간순 조회용
    await lifecycleHistory.createIndex(
      { spotId: 1, changedAt: -1 },
      { background: true }
    )
    console.log('  ✅ { spotId, changedAt } 인덱스 생성 완료')

    console.log('✅ spot_lifecycle_history 인덱스 생성 완료 (1개)')

    // ─────────────────────────────────────────────────────────────
    // 3. supplement_requests 컬렉션 인덱스 생성
    // ─────────────────────────────────────────────────────────────
    console.log('\n🔧 supplement_requests 인덱스 생성 시작...')
    const supplementRequests = db.collection('supplement_requests')

    // 스팟별 보완 요청 상태 조회용
    await supplementRequests.createIndex(
      { spotId: 1, status: 1 },
      { background: true }
    )
    console.log('  ✅ { spotId, status } 인덱스 생성 완료')

    // 만료 처리 배치용 (상태별 기한 조회)
    await supplementRequests.createIndex(
      { status: 1, deadline: 1 },
      { background: true }
    )
    console.log('  ✅ { status, deadline } 인덱스 생성 완료')

    console.log('✅ supplement_requests 인덱스 생성 완료 (2개)')

    // ─────────────────────────────────────────────────────────────
    // 4. spots 컬렉션 마이그레이션
    //    기존 승인된 스팟에 품질 관련 필드 기본값 추가
    // ─────────────────────────────────────────────────────────────
    console.log('\n🔧 spots 컬렉션 마이그레이션 시작...')
    const spots = db.collection('spots')

    // lifecycleStatus 필드가 없는 스팟에 기본값 설정
    // 기존 승인된 스팟(spotStatus: 'approved' 또는 필드 없음)은 'approved'로 설정
    const lifecycleResult = await spots.updateMany(
      { lifecycleStatus: { $exists: false } },
      {
        $set: {
          lifecycleStatus: 'approved',
          closureSuspected: false,
          urgentReviewRequired: false,
        },
      }
    )
    console.log(
      `  ✅ lifecycleStatus/closureSuspected/urgentReviewRequired 기본값 설정: ${lifecycleResult.modifiedCount}개 스팟 업데이트`
    )

    // closureSuspected 필드가 없는 스팟에 기본값 설정 (lifecycleStatus는 있지만 closureSuspected가 없는 경우)
    const closureResult = await spots.updateMany(
      { closureSuspected: { $exists: false } },
      { $set: { closureSuspected: false } }
    )
    if (closureResult.modifiedCount > 0) {
      console.log(
        `  ✅ closureSuspected 기본값 설정: ${closureResult.modifiedCount}개 스팟 업데이트`
      )
    }

    // urgentReviewRequired 필드가 없는 스팟에 기본값 설정
    const urgentResult = await spots.updateMany(
      { urgentReviewRequired: { $exists: false } },
      { $set: { urgentReviewRequired: false } }
    )
    if (urgentResult.modifiedCount > 0) {
      console.log(
        `  ✅ urgentReviewRequired 기본값 설정: ${urgentResult.modifiedCount}개 스팟 업데이트`
      )
    }

    console.log('✅ spots 컬렉션 마이그레이션 완료')

    // ─────────────────────────────────────────────────────────────
    // 완료 요약
    // ─────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60))
    console.log('🎉 스팟 품질 컬렉션 초기화 완료!')
    console.log('='.repeat(60))
    console.log('  - spot_quality_reports: 인덱스 4개')
    console.log('  - spot_lifecycle_history: 인덱스 1개')
    console.log('  - supplement_requests: 인덱스 2개')
    console.log(
      `  - spots 마이그레이션: ${lifecycleResult.modifiedCount}개 문서 업데이트`
    )
  } finally {
    await client.close()
    console.log('\nMongoDB 연결 종료')
  }
}

initSpotQualityCollections()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 초기화 실패:', error)
    process.exit(1)
  })
