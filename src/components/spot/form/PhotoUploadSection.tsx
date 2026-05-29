import { ImageUpload, UploadedImage } from '@/components/spot/ImageUpload'

interface PhotoUploadSectionProps {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  disabled?: boolean
}

export function PhotoUploadSection({
  images,
  onChange,
  disabled,
}: PhotoUploadSectionProps) {
  return (
    <div className="border-b border-border pb-6">
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        사진{' '}
        <span className="text-xs font-normal text-muted">(선택, 최대 5장)</span>
      </h2>
      <ImageUpload
        images={images}
        onChange={onChange}
        maxImages={5}
        disabled={disabled}
      />
    </div>
  )
}
