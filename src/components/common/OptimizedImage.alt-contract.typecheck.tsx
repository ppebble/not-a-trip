import { OptimizedImage } from './OptimizedImage'

export function OptimizedImageAltContractTypecheck() {
  return (
    <>
      <OptimizedImage
        src="/images/example.webp"
        alt="Example content image"
        width={1}
        height={1}
      />
      <OptimizedImage
        src="/images/decorative.webp"
        alt=""
        width={1}
        height={1}
      />
      {/* @ts-expect-error OptimizedImage requires explicit alt text or intentional alt="". */}
      <OptimizedImage src="/images/missing-alt.webp" width={1} height={1} />
    </>
  )
}
