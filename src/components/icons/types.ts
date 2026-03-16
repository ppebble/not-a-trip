export interface IconProps {
  size?: 'sm' | 'md' | 'lg' | number
  color?: string
  className?: string
}

const SIZE_MAP = { sm: 16, md: 24, lg: 32 } as const

export function getIconSize(size: IconProps['size'] = 'md'): number {
  return typeof size === 'number' ? size : SIZE_MAP[size]
}
