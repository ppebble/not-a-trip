import Image, { ImageProps } from 'next/image'
import { blurPlaceholderProps } from '@/lib/image-utils'

interface OptimizedImageProps extends Omit<
  ImageProps,
  'placeholder' | 'blurDataURL'
> {
  /** blur placeholder 비활성화 (로컬 이미지 등) */
  disableBlur?: boolean
}

/**
 * 외부 URL인지 판별 (http:// 또는 https://)
 */
function isExternalUrl(src: ImageProps['src']): boolean {
  if (typeof src === 'string') {
    return src.startsWith('http://') || src.startsWith('https://')
  }
  return false
}

/**
 * OptimizedImage - next/image 래퍼 컴포넌트
 * - blur placeholder를 자동 적용하여 로딩 중 UX 개선
 * - 외부 URL은 unoptimized로 처리 (프록시 리다이렉트 문제 방지)
 *
 * @requirements 1.1, 5.4
 */
export function OptimizedImage({
  disableBlur = false,
  ...props
}: OptimizedImageProps) {
  const blurProps = disableBlur ? {} : blurPlaceholderProps
  const shouldSkipOptimization = isExternalUrl(props.src)

  return (
    <Image
      {...blurProps}
      {...props}
      unoptimized={shouldSkipOptimization || props.unoptimized}
    />
  )
}
