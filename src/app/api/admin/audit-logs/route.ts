import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { getCollection, COLLECTIONS } from '@/lib/db'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(Number(searchParams.get('page') || '1'), 1)
    const pageSize = Math.min(
      Math.max(Number(searchParams.get('pageSize') || '20'), 1),
      100
    )
    const actionType = searchParams.get('actionType')
    const adminId = searchParams.get('adminId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const query: Record<string, unknown> = {}

    if (actionType) {
      query.actionType = actionType
    }

    if (adminId) {
      query.adminId = adminId
    }

    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {}

      if (dateFrom) {
        createdAt.$gte = new Date(dateFrom)
      }

      if (dateTo) {
        createdAt.$lte = new Date(dateTo)
      }

      query.createdAt = createdAt
    }

    const collection = await getCollection(COLLECTIONS.AUDIT_LOGS)
    const total = await collection.countDocuments(query)
    const items = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray()

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: '감사 로그 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
