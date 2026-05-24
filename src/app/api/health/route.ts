import { NextResponse } from 'next/server'

import { createHealthStatus } from '@/lib/health'

export async function GET(): Promise<NextResponse> {
  const { body, statusCode } = await createHealthStatus()
  return NextResponse.json(body, { status: statusCode })
}
