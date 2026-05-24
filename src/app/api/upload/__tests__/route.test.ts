jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/upload', () => ({
  validateUploadFile: jest.fn(),
  assertUploadQuota: jest.fn(),
  prepareUploadArtifacts: jest.fn(),
  uploadImageVariantsToStorage: jest.fn(),
  recordUploadQuotaUsage: jest.fn(),
}))

import { POST } from '../route'
import { auth } from '@/lib/auth'
import {
  assertUploadQuota,
  prepareUploadArtifacts,
  recordUploadQuotaUsage,
  uploadImageVariantsToStorage,
  validateUploadFile,
} from '@/lib/upload'

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockValidateUploadFile = validateUploadFile as jest.MockedFunction<
  typeof validateUploadFile
>
const mockAssertUploadQuota = assertUploadQuota as jest.MockedFunction<
  typeof assertUploadQuota
>
const mockPrepareUploadArtifacts =
  prepareUploadArtifacts as jest.MockedFunction<typeof prepareUploadArtifacts>
const mockUploadImageVariantsToStorage =
  uploadImageVariantsToStorage as jest.MockedFunction<
    typeof uploadImageVariantsToStorage
  >
const mockRecordUploadQuotaUsage =
  recordUploadQuotaUsage as jest.MockedFunction<typeof recordUploadQuotaUsage>

describe('POST /api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(null as never)

    const response = await POST({} as never)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toContain('로그인')
  })

  test('returns 400 when file is missing', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1' },
    } as never)

    const response = await POST({
      formData: jest.fn().mockResolvedValue(new FormData()),
    } as never)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toContain('파일')
  })

  test('returns uploaded variant urls and legacy imageUrl alias', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    mockValidateUploadFile.mockReturnValue('jpeg')
    mockAssertUploadQuota.mockResolvedValue()
    mockPrepareUploadArtifacts.mockResolvedValue({
      original: {
        keySuffix: 'original',
        buffer: Buffer.from('original'),
        contentType: 'image/webp',
        extension: 'webp',
      },
      pin: null,
      card: null,
    })
    mockUploadImageVariantsToStorage.mockResolvedValue({
      original: 'https://cdn.example.com/uploads/original.webp',
      pin: null,
      card: null,
    })
    mockRecordUploadQuotaUsage.mockResolvedValue()

    const file = new File([Buffer.from([0xff, 0xd8, 0xff])], 'photo.jpg', {
      type: 'image/jpeg',
    })
    const formData = new FormData()
    formData.append('file', file)

    const response = await POST({
      formData: jest.fn().mockResolvedValue(formData),
    } as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.original).toBe('https://cdn.example.com/uploads/original.webp')
    expect(body.imageUrl).toBe(body.original)
    expect(body.pin).toBeNull()
    expect(body.card).toBeNull()
    expect(body.storage).toBe('r2')
  })
})
