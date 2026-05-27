import { PageLoadingFallback } from '@/components/common/PageLoadingFallback'

export default function Loading() {
  return (
    <PageLoadingFallback
      title="스팟 페이지 준비 중"
      description="스팟 화면으로 이동하고 상세 정보를 불러오고 있습니다."
    />
  )
}
