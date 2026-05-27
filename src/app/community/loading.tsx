import { PageLoadingFallback } from '@/components/common/PageLoadingFallback'

export default function Loading() {
  return (
    <PageLoadingFallback
      title="커뮤니티 준비 중"
      description="게시글 화면으로 이동하고 콘텐츠를 불러오고 있습니다."
    />
  )
}
