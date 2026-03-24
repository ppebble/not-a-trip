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
    <div className="border-navy-100 border-b pb-6">
      <h2 className="text-navy-800 mb-4 text-lg font-semibold">
        사진{' '}
        <span className="text-navy-400 text-xs font-normal">
          (선택, 최대 5장)
        </span>
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
