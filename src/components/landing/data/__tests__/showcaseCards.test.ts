import { isDisallowedPlaceholderImageSrc } from '@/lib/safe-image-src'

import { CATEGORY_STORIES } from '../categoryStories'
import { SHOWCASE_CARDS } from '../showcaseCards'

describe('landing static image data', () => {
  it('does not use placeholder or icon assets as showcase photos', () => {
    expect(SHOWCASE_CARDS).toHaveLength(12)
    expect(
      SHOWCASE_CARDS.filter((card) =>
        isDisallowedPlaceholderImageSrc(card.imageUrl)
      )
    ).toEqual([])
  })

  it('does not use placeholder or icon assets as category story spot photos', () => {
    expect(
      CATEGORY_STORIES.filter((story) =>
        isDisallowedPlaceholderImageSrc(story.spotImage)
      )
    ).toEqual([])
  })
})
