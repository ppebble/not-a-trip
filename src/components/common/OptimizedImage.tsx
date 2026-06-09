import Image, { type ImageProps } from 'next/image'
import { blurPlaceholderProps } from '@/lib/image-utils'
import { getSafeImageSrc } from '@/lib/safe-image-src'

interface OptimizedImageProps extends Omit<
  ImageProps,
  'alt' | 'placeholder' | 'blurDataURL'
> {
  /**
   * Meaningful alternative text is required for informative images.
   * Decorative images must intentionally pass alt="".
   */
  alt: string
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

function isGifUrl(src: ImageProps['src']): boolean {
  if (typeof src !== 'string') {
    return false
  }

  return src.split(/[?#]/, 1)[0].toLowerCase().endsWith('.gif')
}

function isLocalStaticAsset(src: ImageProps['src']): boolean {
  if (typeof src !== 'string') {
    return false
  }

  return ['/icons/', '/uploads/', '/images/'].some((prefix) =>
    src.startsWith(prefix)
  )
}

/**
 * OptimizedImage - next/image 래퍼 컴포넌트
 * - blur placeholder를 자동 적용하여 로딩 중 UX 개선
 * - 외부 URL은 unoptimized로 처리 (프록시 리다이렉트 문제 방지)
 *
 * @requirements 1.1, 5.4
 */
export function OptimizedImage({
  alt,
  disableBlur = false,
  ...props
}: OptimizedImageProps) {
  const blurProps = disableBlur ? {} : blurPlaceholderProps
  const safeSrc =
    typeof props.src === 'string' ? getSafeImageSrc(props.src) : props.src
  const shouldSkipOptimization =
    isExternalUrl(safeSrc) || isGifUrl(safeSrc) || isLocalStaticAsset(safeSrc)

  return (
    <Image
      {...blurProps}
      {...props}
      alt={alt}
      src={safeSrc}
      unoptimized={shouldSkipOptimization || props.unoptimized}
    />
  )
}
