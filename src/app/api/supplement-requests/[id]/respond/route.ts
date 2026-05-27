import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { respondToSupplementRequest } from '@/lib/spot-quality/supplement-manager'
import type { SupplementResponseInput } from '@/types/spot-quality'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Login is required.' }, { status: 401 })
    }

    const { id } = await params
    const body = (await request.json()) as Partial<SupplementResponseInput>

    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required.' },
        { status: 400 }
      )
    }

    const updated = await respondToSupplementRequest(id, {
      responderId: session.user.id!,
      content: body.content,
      photos: body.photos ?? [],
    })

    return NextResponse.json({
      message: 'Supplement response submitted.',
      updated,
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // eslint-disable-next-line no-console
    console.error('Error responding to supplement request:', error)
    return NextResponse.json(
      { error: 'Failed to respond to supplement request.' },
      { status: 500 }
    )
  }
}
