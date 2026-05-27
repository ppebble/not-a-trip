import { PageLoadingFallback } from '@/components/common/PageLoadingFallback'

export default function Loading() {
  return (
    <PageLoadingFallback
      variant="routes"
      title="코스 페이지 준비 중"
      description="코스 화면으로 먼저 이동하고 목록을 불러오고 있습니다."
    />
  )
}
