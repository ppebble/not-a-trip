import { PageLoadingFallback } from '@/components/common/PageLoadingFallback'

export default function Loading() {
  return (
    <PageLoadingFallback
      title="제보 페이지 준비 중"
      description="제보 화면으로 먼저 이동하고 필요한 데이터를 불러오고 있습니다."
    />
  )
}
