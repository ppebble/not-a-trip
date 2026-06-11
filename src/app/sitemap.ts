import type { MetadataRoute } from 'next'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { getBaseUrl } from '@/lib/seo/metadata'
import { runtimeLogger } from '@/lib/runtime-logger'

/** 정적 페이지 사이트맵 엔트리 생성 */
function getStaticPages(baseUrl: string): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/welcome`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contents`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/routes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const staticPages = getStaticPages(baseUrl)

  try {
    const [spotsCollection, routesCollection, postsCollection] =
      await Promise.all([
        getCollection(COLLECTIONS.SPOTS),
        getCollection(COLLECTIONS.ROUTES),
        getCollection(COLLECTIONS.POSTS),
      ])

    const [spots, routes, posts] = await Promise.all([
      spotsCollection
        .find({}, { projection: { id: 1, updatedAt: 1 } })
        .toArray(),
      routesCollection
        .find({ isPublic: true }, { projection: { id: 1, updatedAt: 1 } })
        .toArray(),
      postsCollection
        .find({}, { projection: { _id: 1, updatedAt: 1 } })
        .toArray(),
    ])

    const spotEntries: MetadataRoute.Sitemap = spots.map((spot) => ({
      url: `${baseUrl}/spots/${spot.id}`,
      lastModified: spot.updatedAt ? new Date(spot.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    const routeEntries: MetadataRoute.Sitemap = routes.map((route) => ({
      url: `${baseUrl}/routes/${route.id}`,
      lastModified: route.updatedAt ? new Date(route.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/community/${post._id.toString()}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...spotEntries, ...routeEntries, ...postEntries]
  } catch (error) {
    runtimeLogger.error('사이트맵 생성 중 DB 조회 실패:', error)
    return staticPages
  }
}
