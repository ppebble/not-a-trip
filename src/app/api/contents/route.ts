import { NextResponse } from 'next/server'
import { fetchDiscoverableContents } from '@/lib/content-list'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  try {
    const contents = await fetchDiscoverableContents()

    return NextResponse.json({ contents, total: contents.length })
  } catch (error) {
    console.error('Error fetching contents:', error)
    return NextResponse.json(
      { error: '콘텐츠 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
