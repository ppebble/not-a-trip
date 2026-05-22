import Image from 'next/image'
import { MASCOT_ASSETS, type MascotVariant } from './mascotAssets'

interface MascotIllustrationProps {
  variant?: MascotVariant
  size?: 'sm' | 'md' | 'lg'
  className?: string
  priority?: boolean
}

const SIZE_CLASSES: Record<
  NonNullable<MascotIllustrationProps['size']>,
  string
> = {
  sm: 'h-20 w-20',
  md: 'h-28 w-28',
  lg: 'h-36 w-36',
}

export function MascotIllustration({
  variant = 'main',
  size = 'md',
  className = '',
  priority = false,
}: MascotIllustrationProps) {
  return (
    <div
      className={`relative ${SIZE_CLASSES[size]} ${className}`}
      aria-hidden="true"
    >
      <Image
        src={MASCOT_ASSETS[variant]}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 768px) 80px, 144px"
        className="object-contain drop-shadow-lg"
      />
    </div>
  )
}
