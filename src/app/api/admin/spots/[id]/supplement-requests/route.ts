import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { COLLECTIONS, getCollection } from '@/lib/db'
import { createSupplementRequest } from '@/lib/spot-quality/supplement-manager'
import type {
  CreateSupplementRequestInput,
  SupplementRequestType,
} from '@/types/spot-quality'

const VALID_TYPES: SupplementRequestType[] = [
  'photo_add',
  'description_update',
  'address_verify',
  'operation_info',
]

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Login is required.' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin role is required.' },
        { status: 403 }
      )
    }

    const { id: spotId } = await params
    const collection = await getCollection(COLLECTIONS.SUPPLEMENT_REQUESTS)
    const requests = await collection
      .find({ spotId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ requests, total: requests.length })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error listing supplement requests:', error)
    return NextResponse.json(
      { error: 'Failed to list supplement requests.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Login is required.' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin role is required.' },
        { status: 403 }
      )
    }

    const { id: spotId } = await params
    const body = (await request.json()) as Partial<CreateSupplementRequestInput>

    if (
      typeof body.requestType !== 'string' ||
      !VALID_TYPES.includes(body.requestType as SupplementRequestType)
    ) {
      return NextResponse.json(
        { error: 'Invalid supplement request type.' },
        { status: 400 }
      )
    }

    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required.' },
        { status: 400 }
      )
    }

    if (!body.deadline) {
      return NextResponse.json(
        { error: 'Deadline is required.' },
        { status: 400 }
      )
    }

    const requestRecord = await createSupplementRequest({
      spotId,
      requestType: body.requestType,
      content: body.content,
      deadline: new Date(body.deadline),
      createdBy: session.user.id!,
    })

    return NextResponse.json(
      { id: requestRecord.id, request: requestRecord },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // eslint-disable-next-line no-console
    console.error('Error creating supplement request:', error)
    return NextResponse.json(
      { error: 'Failed to create supplement request.' },
      { status: 500 }
    )
  }
}
