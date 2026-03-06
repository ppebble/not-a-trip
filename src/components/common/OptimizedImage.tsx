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
 * OptimizedImage - next/image 래퍼 컴포넌트
 * blur placeholder를 자동 적용하여 로딩 중 UX 개선
 *
 * @requirements 1.1, 5.4
 */
export function OptimizedImage({
  disableBlur = false,
  ...props
}: OptimizedImageProps) {
  const blurProps = disableBlur ? {} : blurPlaceholderProps
  return <Image {...blurProps} {...props} />
}
