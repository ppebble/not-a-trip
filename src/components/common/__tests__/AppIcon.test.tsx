/**
 * @jest-environment jsdom
 */
/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { AppIcon } from '../AppIcon'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    width,
    height,
    className,
    style,
  }: {
    src: string
    alt: string
    width: number
    height: number
    className?: string
    style?: React.CSSProperties
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
    />
  ),
}))

describe('AppIcon sizing contract', () => {
  it('keeps rendered CSS size locked to the requested numeric icon size', () => {
    render(<AppIcon name="route" size={20} />)

    const icon = screen.getByRole('img', { name: 'route' })

    expect(icon).toHaveAttribute('src', '/icons/ui/route.webp')
    expect(icon).toHaveAttribute('width', '20')
    expect(icon).toHaveAttribute('height', '20')
    expect(icon).toHaveStyle({ width: '20px', height: '20px' })
  })

  it('maps token sizes to fixed rendered CSS dimensions instead of intrinsic asset size', () => {
    render(<AppIcon name="settings" size="xl" />)

    const icon = screen.getByRole('img', { name: 'settings' })

    expect(icon).toHaveAttribute('src', '/icons/ui/settings.webp')
    expect(icon).toHaveAttribute('width', '28')
    expect(icon).toHaveAttribute('height', '28')
    expect(icon).toHaveStyle({ width: '28px', height: '28px' })
  })
})
