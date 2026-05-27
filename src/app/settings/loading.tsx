import { PageLoadingFallback } from '@/components/common/PageLoadingFallback'

export default function Loading() {
  return (
    <PageLoadingFallback
      title="설정 페이지 준비 중"
      description="계정 상태를 확인하고 설정 화면으로 이동하고 있습니다."
    />
  )
}
