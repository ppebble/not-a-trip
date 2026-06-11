import type { Metadata } from 'next'
import { getCollection, COLLECTIONS } from '@/lib/db'
import {
  generateSpotMetadata,
  getCanonicalUrl,
  getDefaultMetadata,
  type SpotSeoData,
} from '@/lib/seo/metadata'
import { generateBreadcrumbJsonLd, generateSpotJsonLd } from '@/lib/seo/json-ld'
import JsonLd from '@/components/seo/JsonLd'
import SpotDetailClient from '@/components/spot/SpotDetailClient'

/** 경량 projection으로 스팟 SEO 데이터 조회 */
async function getSpotSeoData(id: string): Promise<SpotSeoData | null> {
  try {
    const collection = await getCollection(COLLECTIONS.SPOTS)
    const spot = await collection.findOne(
      { id },
      {
        projection: {
          id: 1,
          name: 1,
          description: 1,
          address: 1,
          category: 1,
          photos: 1,
          coordinates: 1,
        },
      }
    )

    if (!spot) return null

    return {
      id: spot.id as string,
      name: spot.name as string,
      description: (spot.description as string) || '',
      address: (spot.address as string) || '',
      category: spot.category as SpotSeoData['category'],
      photos: (spot.photos as string[]) || [],
      coordinates: spot.coordinates as SpotSeoData['coordinates'],
    }
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const spot = await getSpotSeoData(id)

  if (!spot) {
    return getDefaultMetadata()
  }

  return generateSpotMetadata(spot)
}

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const spot = await getSpotSeoData(id)

  return (
    <>
      {spot && <JsonLd data={generateSpotJsonLd(spot)} />}
      {spot && (
        <JsonLd
          data={generateBreadcrumbJsonLd([
            { name: '홈', url: getCanonicalUrl('/') },
            { name: '스팟', url: getCanonicalUrl('/map') },
            { name: spot.name, url: getCanonicalUrl(`/spots/${spot.id}`) },
          ])}
        />
      )}
      <SpotDetailClient />
    </>
  )
}
