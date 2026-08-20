import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ObjectId } from 'mongodb'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { generatePostMetadata, type PostSeoData } from '@/lib/seo/metadata'
import PostDetailClient from '@/components/community/PostDetailClient'
import JsonLd from '@/components/seo/JsonLd'
import { generateBreadcrumbJsonLd, generatePostJsonLd } from '@/lib/seo/json-ld'
import { getCanonicalUrl } from '@/lib/seo/metadata'

/** 경량 projection으로 게시글 SEO 데이터 조회 */
async function getPostSeoData(id: string): Promise<PostSeoData | null> {
  try {
    if (!ObjectId.isValid(id)) return null

    const collection = await getCollection(COLLECTIONS.POSTS)
    const post = await collection.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          title: 1,
          content: 1,
        },
      }
    )

    if (!post) return null

    return {
      id: post._id.toString(),
      title: (post.title as string) || '',
      content: (post.content as string) || '',
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
  const post = await getPostSeoData(id)

  if (!post) {
    notFound()
  }

  return generatePostMetadata(post)
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPostSeoData(id)

  if (!post) notFound()

  return (
    <>
      <JsonLd data={generatePostJsonLd(post)} />
      <JsonLd
        data={generateBreadcrumbJsonLd([
          { name: '?', url: getCanonicalUrl('/') },
          { name: '????', url: getCanonicalUrl('/gallery') },
          { name: post.title, url: getCanonicalUrl('/community/' + post.id) },
        ])}
      />
      <article>
        <h1>{post.title}</h1>
        <p>{post.content.slice(0, 160)}</p>
      </article>
      <PostDetailClient />
    </>
  )
}
