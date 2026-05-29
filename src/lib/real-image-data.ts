import type { SpotCategory } from '@/types/spot'
import { ANIMATION_SPOT_IMAGE_ASSET_BY_ID } from './animation-spot-image-assets'

export const DATA_REVIEW_STATUSES = [
  'draft',
  'needs_review',
  'approved',
  'rejected',
  'archived',
] as const

export type DataReviewStatus = (typeof DATA_REVIEW_STATUSES)[number]

export interface SourceEvidence {
  url: string
  label?: string
  evidenceType:
    | 'official'
    | 'wiki'
    | 'user_report'
    | 'admin_review'
    | 'document'
    | 'other'
  collectedAt: string
}

export interface LicensedImage {
  originalUrl: string
  sourcePageUrl: string
  author: string
  license: string
  licenseUrl: string
  collectedAt: string
  reviewStatus: DataReviewStatus
  attributionText?: string
  lastHttpStatus?: number
  lastValidatedAt?: string
}

export interface ImageDerivative {
  variant: 'thumbnail' | 'card' | 'detail'
  url: string
  width: number
  height: number
  contentHash: string
  byteSize?: number
}

export interface AssetManifestEntry {
  spotId: string
  source: LicensedImage
  ownedUrl: string
  derivatives: ImageDerivative[]
  reviewStatus: DataReviewStatus
  version: string
}

export interface RealSpotData {
  id: string
  name: string
  category: SpotCategory
  coordinates: {
    lat: number
    lng: number
  }
  country: string
  region: string
  address: string
  description: string
  relatedContent: Array<{
    name: string
    type?: string
  }>
  sourceUrls: SourceEvidence[]
  photos: AssetManifestEntry[]
  reviewStatus: DataReviewStatus
}

export interface ValidationIssue {
  field: string
  code: string
  message: string
}

export const EXTERNAL_HOTLINK_HOSTS = new Set([
  'upload.wikimedia.org',
  'commons.wikimedia.org',
  'picsum.photos',
  'via.placeholder.com',
])

export const COMPATIBLE_IMAGE_LICENSES = new Set([
  'cc0 1.0',
  'cc by 2.0',
  'cc by 3.0',
  'cc by 4.0',
  'cc by-sa 3.0',
  'cc by-sa 4.0',
  'public domain',
])

export const CATEGORY_LOCAL_FALLBACK_IMAGES: Record<SpotCategory, string> = {
  animation: '/images/showcase/kamakura.webp',
  sports: '/images/showcase/camp-nou.webp',
  movie_drama: '/images/showcase/kings-cross.webp',
  music: '/images/showcase/abbey-road.webp',
  game: '/images/showcase/nintendo-hq.webp',
  other: '/images/showcase/petra.webp',
}

const SPOT_CATEGORY_FALLBACKS: Record<string, SpotCategory> = {
  'REAL-ANI': 'animation',
  'REAL-SPO': 'sports',
  'REAL-MOV': 'movie_drama',
  'REAL-MUS': 'music',
  'REAL-GAM': 'game',
}

export function isDataReviewStatus(
  status: unknown
): status is DataReviewStatus {
  return (
    typeof status === 'string' &&
    DATA_REVIEW_STATUSES.includes(status as DataReviewStatus)
  )
}

export function isExternalHotlinkUrl(url: string | null | undefined): boolean {
  if (!url) return false

  try {
    const parsed = new URL(url)
    return EXTERNAL_HOTLINK_HOSTS.has(parsed.hostname)
  } catch {
    return url.includes('picsum.photos/seed/')
  }
}

export function getControlledFallbackImageForSpot(
  spotId: string,
  category: SpotCategory = 'other'
): string {
  const animationAsset = ANIMATION_SPOT_IMAGE_ASSET_BY_ID[spotId]
  if (animationAsset) {
    return animationAsset.ownedUrl
  }

  const matchedCategory =
    Object.entries(SPOT_CATEGORY_FALLBACKS).find(([prefix]) =>
      spotId.startsWith(prefix)
    )?.[1] ?? category

  return CATEGORY_LOCAL_FALLBACK_IMAGES[matchedCategory]
}

export function validateRealSpotData(spot: RealSpotData): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const requiredTextFields: Array<keyof RealSpotData> = [
    'id',
    'name',
    'country',
    'region',
    'address',
    'description',
  ]

  for (const field of requiredTextFields) {
    if (typeof spot[field] !== 'string' || !spot[field].trim()) {
      issues.push({
        field,
        code: 'spot.required',
        message: `${field} is required.`,
      })
    }
  }

  if (!Number.isFinite(spot.coordinates.lat)) {
    issues.push({
      field: 'coordinates.lat',
      code: 'spot.coordinates.invalid',
      message: 'Latitude must be a finite number.',
    })
  }

  if (!Number.isFinite(spot.coordinates.lng)) {
    issues.push({
      field: 'coordinates.lng',
      code: 'spot.coordinates.invalid',
      message: 'Longitude must be a finite number.',
    })
  }

  if (!isDataReviewStatus(spot.reviewStatus)) {
    issues.push({
      field: 'reviewStatus',
      code: 'spot.review-status.invalid',
      message: 'reviewStatus must be a known data review status.',
    })
  }

  if (spot.reviewStatus === 'approved' && spot.sourceUrls.length === 0) {
    issues.push({
      field: 'sourceUrls',
      code: 'spot.source-evidence.missing',
      message: 'Approved spots require at least one source evidence item.',
    })
  }

  return issues
}

export function validateLicensedImageMetadata(
  image: LicensedImage
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const requiredFields: Array<keyof LicensedImage> = [
    'originalUrl',
    'sourcePageUrl',
    'author',
    'license',
    'licenseUrl',
    'collectedAt',
  ]

  for (const field of requiredFields) {
    if (typeof image[field] !== 'string' || !image[field].trim()) {
      issues.push({
        field,
        code: 'image.metadata.required',
        message: `${field} is required for licensed images.`,
      })
    }
  }

  const normalizedLicense = image.license.trim().toLowerCase()
  if (!COMPATIBLE_IMAGE_LICENSES.has(normalizedLicense)) {
    issues.push({
      field: 'license',
      code: 'image.license.incompatible',
      message: 'Image license is missing, unknown, or incompatible.',
    })
  }

  if (image.lastHttpStatus && [404, 410, 429].includes(image.lastHttpStatus)) {
    issues.push({
      field: 'lastHttpStatus',
      code: 'image.source.unavailable',
      message: 'Unavailable or rate-limited image source cannot be approved.',
    })
  }

  if (image.lastHttpStatus && image.lastHttpStatus >= 500) {
    issues.push({
      field: 'lastHttpStatus',
      code: 'image.source.server-error',
      message: 'Server-erroring image source cannot be approved.',
    })
  }

  return issues
}

export function generateDerivativeFileName(
  assetId: string,
  variant: ImageDerivative['variant'],
  contentHash: string,
  extension: 'avif' | 'webp' = 'webp'
): string {
  const safeAssetId = assetId.toLowerCase().replace(/[^a-z0-9-]+/g, '-')
  const safeHash = contentHash
    .toLowerCase()
    .replace(/[^a-f0-9]/g, '')
    .slice(0, 12)

  return `${safeAssetId}-${variant}-${safeHash}.${extension}`
}

export function classifyImageValidationAction(status: number): string {
  if (status === 404 || status === 410) return 'replace'
  if (status === 429) return 'retry later'
  if (status >= 500) return 'investigate storage credentials'
  if (status >= 200 && status < 300) return 'none'
  return 'archive'
}
