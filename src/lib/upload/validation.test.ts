import {
  detectImageFormat,
  validateUploadFile,
  UploadValidationError,
} from './validation'

function createFile(
  type: string,
  size: number,
  name: string = 'test.jpg'
): File {
  return {
    type,
    size,
    name,
  } as File
}

describe('upload validation', () => {
  test('detects jpeg by magic bytes', () => {
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xee])
    expect(detectImageFormat(buffer)).toBe('jpeg')
  })

  test('detects png by magic bytes', () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    expect(detectImageFormat(buffer)).toBe('png')
  })

  test('rejects unsupported mime types', () => {
    expect(() =>
      validateUploadFile(
        createFile('application/pdf', 1024),
        Buffer.from([0xff, 0xd8, 0xff])
      )
    ).toThrow(UploadValidationError)
  })

  test('rejects mismatched mime type and magic bytes', () => {
    expect(() =>
      validateUploadFile(
        createFile('image/png', 1024, 'test.png'),
        Buffer.from([0xff, 0xd8, 0xff])
      )
    ).toThrow('MIME 타입과 실제 파일 형식')
  })

  test('accepts png uploads when browser MIME is wrong but extension and magic bytes are png', () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

    expect(
      validateUploadFile(createFile('image/jpeg', 1024, 'scene.png'), buffer)
    ).toBe('png')
  })

  test('accepts valid webp uploads', () => {
    const buffer = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ])

    expect(
      validateUploadFile(createFile('image/webp', 1024, 'test.webp'), buffer)
    ).toBe('webp')
  })
})
