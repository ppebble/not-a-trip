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

const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xee])
const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const gifBuffer = Buffer.from('GIF89a')
const webpBuffer = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
])

describe('upload validation', () => {
  test('detects jpeg by magic bytes', () => {
    expect(detectImageFormat(jpegBuffer)).toBe('jpeg')
  })

  test('detects png by magic bytes', () => {
    expect(detectImageFormat(pngBuffer)).toBe('png')
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
      validateUploadFile(createFile('image/png', 1024, 'test.png'), jpegBuffer)
    ).toThrow('MIME')
  })

  test('accepts png uploads when browser MIME is wrong but extension and magic bytes are png', () => {
    expect(
      validateUploadFile(createFile('image/jpeg', 1024, 'scene.png'), pngBuffer)
    ).toBe('png')
  })

  test('accepts png uploads when browser reports a generic binary MIME', () => {
    expect(
      validateUploadFile(
        createFile('application/octet-stream', 1024, 'scene.png'),
        pngBuffer
      )
    ).toBe('png')
  })

  test('reports file size errors before type mismatch errors', () => {
    expect(() =>
      validateUploadFile(
        createFile('application/pdf', 11 * 1024 * 1024, 'scene.pdf'),
        jpegBuffer
      )
    ).toThrow('10MB')
  })

  test.each([
    ['jpeg', createFile('image/jpeg', 1024, 'scene.jpeg'), jpegBuffer],
    ['png', createFile('image/png', 1024, 'scene.png'), pngBuffer],
    ['gif', createFile('image/gif', 1024, 'scene.gif'), gifBuffer],
    ['webp', createFile('image/webp', 1024, 'scene.webp'), webpBuffer],
  ])('accepts %s extension/MIME/binary agreement', (format, file, buffer) => {
    expect(validateUploadFile(file, buffer)).toBe(format)
  })
})
