/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import { FALLBACK_IMAGE_SRC } from '@/lib/safe-image-src'
import { ComparisonViewer } from '../ComparisonViewer'

jest.mock('next/image', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockImage({ fill: _fill, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  }
})

describe('ComparisonViewer', () => {
  test('replaces disallowed placeholder image URLs before rendering next/image', () => {
    render(
      <ComparisonViewer
        sceneImageUrl="https://picsum.photos/seed/shibuya109/800/600"
        userPhotoUrl="https://picsum.photos/seed/user-checkin/800/600"
      />
    )

    const renderedImages = screen.getAllByRole('img')

    expect(renderedImages).toHaveLength(2)
    renderedImages.forEach((image) => {
      expect(image).toHaveAttribute('src', FALLBACK_IMAGE_SRC)
      expect(image).not.toHaveAttribute(
        'src',
        expect.stringContaining('picsum.photos')
      )
    })
  })
})
