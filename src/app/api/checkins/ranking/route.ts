import { NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { runtimeLogger } from '@/lib/runtime-logger'

/**
 * 이번 주 시작일 계산 (월요일 00:00:00 UTC)
 */
function getWeekStart(): Date {
  const now = new Date()
  const dayOfWeek = now.getUTCDay()
  // 일요일(0)이면 6일 전, 그 외에는 (dayOfWeek - 1)일 전이 월요일
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() - daysToMonday)
  monday.setUTCHours(0, 0, 0, 0)
  return monday
}

/**
 * 이번 주 종료일 계산 (일요일 23:59:59 UTC)
 */
function getWeekEnd(): Date {
  const weekStart = getWeekStart()
  const sunday = new Date(weekStart)
  sunday.setUTCDate(weekStart.getUTCDate() + 6)
  sunday.setUTCHours(23, 59, 59, 999)
  return sunday
}

interface SpotRankingItem {
  spotId: string
  spotName: string
  spotThumbnail?: string
  weeklyCheckIns: number
}

interface CheckInRankingItem {
  checkInId: string
  photoUrl: string
  userName: string
  likeCount: number
}

interface RankingResponse {
  spotRanking: SpotRankingItem[]
  checkInRanking: CheckInRankingItem[]
  period: {
    start: Date
    end: Date
  }
}

/**
 * GET /api/checkins/ranking - 랭킹 조회
 * - 이번 주 인증 많은 스팟 랭킹 (Top 10)
 * - 좋아요 많은 인증샷 랭킹 (Top 10)
 * Requirements: 3.3
 */
export async function GET(): Promise<NextResponse> {
  try {
    const checkinsCollection = await getCollection(COLLECTIONS.CHECKINS)
    const spotsCollection = await getCollection(COLLECTIONS.SPOTS)

    const weekStart = getWeekStart()
    const weekEnd = getWeekEnd()

    // 1. 이번 주 인증 많은 스팟 랭킹 (aggregate)
    const spotRankingAgg = await checkinsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: weekStart, $lte: weekEnd },
          },
        },
        {
          $group: {
            _id: '$spotId',
            weeklyCheckIns: { $sum: 1 },
          },
        },
        {
          $sort: { weeklyCheckIns: -1 },
        },
        {
          $limit: 10,
        },
      ])
      .toArray()

    // 스팟 정보 조회
    const spotIds = spotRankingAgg.map((item) => item._id)
    const spots = await spotsCollection
      .find({ id: { $in: spotIds } })
      .project({ id: 1, name: 1, photos: 1 })
      .toArray()

    const spotMap = new Map(spots.map((s) => [s.id, s]))

    const spotRanking: SpotRankingItem[] = spotRankingAgg.map((item) => {
      const spot = spotMap.get(item._id)
      return {
        spotId: item._id,
        spotName: spot?.name || '알 수 없는 스팟',
        spotThumbnail: spot?.photos?.[0],
        weeklyCheckIns: item.weeklyCheckIns,
      }
    })

    // 2. 좋아요 많은 인증샷 랭킹 (Top 10)
    const checkInRankingDocs = await checkinsCollection
      .find({ likeCount: { $gt: 0 } })
      .sort({ likeCount: -1 })
      .limit(10)
      .project({ id: 1, photoUrl: 1, userName: 1, likeCount: 1 })
      .toArray()

    const checkInRanking: CheckInRankingItem[] = checkInRankingDocs.map(
      (doc) => ({
        checkInId: doc.id,
        photoUrl: doc.photoUrl,
        userName: doc.userName,
        likeCount: doc.likeCount,
      })
    )

    const response: RankingResponse = {
      spotRanking,
      checkInRanking,
      period: {
        start: weekStart,
        end: weekEnd,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    runtimeLogger.error('Error fetching ranking:', error)
    return NextResponse.json(
      { error: '랭킹 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
