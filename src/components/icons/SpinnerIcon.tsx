import { IconProps, getIconSize } from './types'

export function SpinnerIcon({
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
      aria-label="로딩 중"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth={4}
      />
      <path
        className="opacity-75"
        fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
