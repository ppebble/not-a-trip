'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import PostDetail from '@/components/community/PostDetail'
import CommentSection from '@/components/community/CommentSection'

/**
 * 게시글 상세 페이지 클라이언트 컴포넌트
 * Requirements 5.3: 게시글 전체 내용 표시 및 댓글 허용
 */
export default function PostDetailClient() {
  const params = useParams()
  const postId = params.id as string

  return (
    <main className="bg-navy-50 min-h-screen">
      {/* 페이지 타이틀 */}
      <div className="border-navy-200 border-b bg-white px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <Link
              href="/community"
              className="text-navy-500 hover:text-navy-700"
            >
              ← 커뮤니티
            </Link>
          </div>
          <h1 className="text-navy-800 mt-2 text-xl font-bold">게시글</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* 게시글 상세 */}
        <PostDetail postId={postId} className="mb-6" />

        {/* 댓글 섹션 */}
        <CommentSection postId={postId} />
      </div>
    </main>
  )
}
