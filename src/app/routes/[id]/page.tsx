import type { Metadata } from 'next'
import { getCollection, COLLECTIONS } from '@/lib/db'
import {
  generateRouteMetadata,
  getCanonicalUrl,
  getDefaultMetadata,
  type RouteSeoData,
} from '@/lib/seo/metadata'
import {
  generateBreadcrumbJsonLd,
  generateRouteJsonLd,
} from '@/lib/seo/json-ld'
import JsonLd from '@/components/seo/JsonLd'
import RouteDetailClient from '@/components/route/RouteDetailClient'

/** 경량 projection으로 코스 SEO 데이터 조회 */
async function getRouteSeoData(id: string): Promise<RouteSeoData | null> {
  try {
    const collection = await getCollection(COLLECTIONS.ROUTES)
    const route = await collection.findOne(
      { id },
      {
        projection: {
          id: 1,
          name: 1,
          description: 1,
          spots: 1,
        },
      }
    )

    if (!route) return null

    const spots = (route.spots as Array<{ spotName?: string }>) || []

    return {
      id: route.id as string,
      name: route.name as string,
      description: (route.description as string) || '',
      spots: spots.map((s) => ({ spotName: s.spotName || '' })),
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
  const route = await getRouteSeoData(id)

  if (!route) {
    return getDefaultMetadata()
  }

  return generateRouteMetadata(route)
}

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const route = await getRouteSeoData(id)

  return (
    <>
      {route && <JsonLd data={generateRouteJsonLd(route)} />}
      {route && (
        <JsonLd
          data={generateBreadcrumbJsonLd([
            { name: '홈', url: getCanonicalUrl('/') },
            { name: '코스', url: getCanonicalUrl('/routes') },
            { name: route.name, url: getCanonicalUrl(`/routes/${route.id}`) },
          ])}
        />
      )}
      <RouteDetailClient />
    </>
  )
}
