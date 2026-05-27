import { COLLECTIONS, getCollection } from '@/lib/db'
import { syncSpotQualityFlags } from './report-processor'
import type {
  CreateSupplementRequestInput,
  SupplementRequest,
  SupplementResponseInput,
} from '@/types/spot-quality'

async function generateSupplementRequestId(): Promise<string> {
  const collection = await getCollection<{ id: string }>(
    COLLECTIONS.SUPPLEMENT_REQUESTS
  )
  const requests = await collection
    .find({ id: { $regex: /^SUPREQ-\d+$/ } })
    .project({ id: 1 })
    .sort({ id: -1 })
    .limit(1)
    .toArray()

  if (requests.length === 0) return 'SUPREQ-001'

  const match = requests[0].id.match(/^SUPREQ-(\d+)$/)
  const nextNumber = match ? parseInt(match[1], 10) + 1 : 1
  return `SUPREQ-${nextNumber.toString().padStart(3, '0')}`
}

export async function createSupplementRequest(
  input: CreateSupplementRequestInput
): Promise<SupplementRequest> {
  const collection = await getCollection<SupplementRequest>(
    COLLECTIONS.SUPPLEMENT_REQUESTS
  )
  const now = new Date()
  const request: SupplementRequest = {
    id: await generateSupplementRequestId(),
    spotId: input.spotId,
    requestType: input.requestType,
    content: input.content.trim(),
    deadline: input.deadline,
    status: 'pending',
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  }

  await collection.insertOne(request)
  await syncSpotQualityFlags(input.spotId)
  return request
}

export async function listSupplementRequests(spotId: string) {
  const collection = await getCollection<SupplementRequest>(
    COLLECTIONS.SUPPLEMENT_REQUESTS
  )
  return collection.find({ spotId }).sort({ createdAt: -1 }).toArray()
}

export async function respondToSupplementRequest(
  requestId: string,
  input: SupplementResponseInput
) {
  const collection = await getCollection<SupplementRequest>(
    COLLECTIONS.SUPPLEMENT_REQUESTS
  )
  const request = await collection.findOne({ id: requestId })

  if (!request) {
    throw new Error('Supplement request not found.')
  }

  if (request.status !== 'pending') {
    throw new Error('Supplement request is no longer pending.')
  }

  const now = new Date()
  await collection.updateOne(
    { id: requestId },
    {
      $set: {
        status: 'responded',
        response: {
          responderId: input.responderId,
          content: input.content.trim(),
          photos: input.photos ?? [],
          respondedAt: now,
        },
        updatedAt: now,
      },
    }
  )

  await syncSpotQualityFlags(request.spotId)
  return collection.findOne({ id: requestId })
}

export async function expireOverdueSupplementRequests() {
  const collection = await getCollection<SupplementRequest>(
    COLLECTIONS.SUPPLEMENT_REQUESTS
  )
  const now = new Date()
  const expired = await collection
    .find({ status: 'pending', deadline: { $lt: now } })
    .toArray()

  if (expired.length === 0) return 0

  await collection.updateMany(
    { status: 'pending', deadline: { $lt: now } },
    { $set: { status: 'expired', updatedAt: now } }
  )

  await Promise.all(
    expired.map((request) => syncSpotQualityFlags(request.spotId))
  )
  return expired.length
}
