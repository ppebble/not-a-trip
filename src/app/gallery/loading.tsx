import { PageLoadingFallback } from '@/components/common/PageLoadingFallback'

export default function Loading() {
  return (
    <PageLoadingFallback
      variant="gallery"
      title="갤러리 준비 중"
      description="인증 피드를 불러오는 동안 화면을 준비하고 있습니다."
    />
  )
}
