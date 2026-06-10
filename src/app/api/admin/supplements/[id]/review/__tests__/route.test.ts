import { NextRequest } from 'next/server'

let mockSession: { user: { id: string; role: string } } | null = null

const mockSupplementsFindOne = jest.fn()
const mockSupplementsUpdateOne = jest.fn()
const mockSupplementsDeleteOne = jest.fn()
const mockSpotsFindOne = jest.fn()
const mockSpotsUpdateOne = jest.fn()
const mockScenesInsertOne = jest.fn()

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}))

jest.mock('@/lib/db', () => ({
  COLLECTIONS: {
    SPOT_SUPPLEMENTS: 'spot_supplements',
    SPOTS: 'spots',
    SCENES: 'scenes',
  },
  getCollection: jest.fn((name: string) => {
    if (name === 'spot_supplements') {
      return Promise.resolve({
        deleteOne: mockSupplementsDeleteOne,
        findOne: mockSupplementsFindOne,
        updateOne: mockSupplementsUpdateOne,
      })
    }

    if (name === 'spots') {
      return Promise.resolve({
        findOne: mockSpotsFindOne,
        updateOne: mockSpotsUpdateOne,
      })
    }

    return Promise.resolve({
      insertOne: mockScenesInsertOne,
    })
  }),
}))

import { DELETE, PUT } from '../route'

beforeEach(() => {
  jest.clearAllMocks()
  mockSession = { user: { id: 'admin-1', role: 'admin' } }
  mockSupplementsFindOne.mockResolvedValue(null)
  mockSupplementsUpdateOne.mockResolvedValue({ modifiedCount: 1 })
  mockSupplementsDeleteOne.mockResolvedValue({ deletedCount: 1 })
  mockSpotsFindOne.mockResolvedValue({ id: 'SPOT-1', description: '' })
  mockSpotsUpdateOne.mockResolvedValue({ modifiedCount: 1 })
  mockScenesInsertOne.mockResolvedValue({ insertedId: 'scene-1' })
})

describe('/api/admin/supplements/[id]/review', () => {
  test('approves legacy supplement records that do not have status yet', async () => {
    mockSupplementsFindOne.mockResolvedValue({
      id: 'SUP-1',
      spotId: 'SPOT-1',
      type: 'other',
      content: 'duplicate cleanup',
      approved: false,
    })

    const request = new NextRequest(
      'http://localhost/api/admin/supplements/SUP-1/review',
      {
        method: 'PUT',
        body: JSON.stringify({ action: 'approve' }),
        headers: { 'Content-Type': 'application/json' },
      }
    )

    const response = await PUT(request, {
      params: Promise.resolve({ id: 'SUP-1' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe('approved')
    expect(mockSupplementsUpdateOne).toHaveBeenCalledWith(
      { id: 'SUP-1' },
      { $set: { status: 'approved' } }
    )
  })

  test('deletes a supplement review queue item', async () => {
    const request = new NextRequest(
      'http://localhost/api/admin/supplements/SUP-1/review',
      { method: 'DELETE' }
    )

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'SUP-1' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.id).toBe('SUP-1')
    expect(mockSupplementsDeleteOne).toHaveBeenCalledWith({ id: 'SUP-1' })
  })
})
