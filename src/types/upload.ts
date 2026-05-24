export interface UploadedImageSet {
  original: string
  pin: string | null
  card: string | null
}

export interface UploadApiSuccess extends UploadedImageSet {
  success: true
  imageUrl: string
  fileName: string
  storage: 'r2'
}
