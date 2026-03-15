import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/seo/metadata'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/auth/', '/test/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
