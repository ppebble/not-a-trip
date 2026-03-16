import { IconProps, getIconSize } from './types'

export function ArrowLeftIcon({
  size = 'md',
  color = 'currentColor',
  className,
}: IconProps) {
  const s = getIconSize(size)
  return (
    <svg
      width={s}
      height={s}
      className={className}
      fill="none"
      stroke={color}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  )
}
