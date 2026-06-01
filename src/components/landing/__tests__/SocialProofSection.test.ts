import { getExtendedData } from '../SocialProofSection'
import { LANDING_PROOF_CARDS } from '../data/proofData'
import type { SpotCategory } from '@/types/spot'

const CLONE_COUNT = 4

const injectedProofImages: Record<SpotCategory, string[]> = {
  animation: ['https://example.com/wrong-animation.jpg'],
  sports: ['https://example.com/wrong-sports.jpg'],
  movie_drama: ['https://example.com/wrong-movie.jpg'],
  music: ['https://example.com/wrong-music.jpg'],
  game: ['https://example.com/wrong-game.jpg'],
  other: ['https://example.com/wrong-other.jpg'],
}

describe('SocialProofSection spot-specific images', () => {
  it('keeps each proof card image bound to its specific spot instead of category image pools', () => {
    const { extended } = getExtendedData(injectedProofImages, undefined)
    const originalCards = extended.slice(
      CLONE_COUNT,
      extended.length - CLONE_COUNT
    )

    expect(originalCards).toHaveLength(LANDING_PROOF_CARDS.length)

    for (const sourceCard of LANDING_PROOF_CARDS) {
      const renderedCard = originalCards.find(
        (card) => card.id === sourceCard.id
      )

      expect(renderedCard).toBeDefined()
      expect(renderedCard?.spotName).toBe(sourceCard.spotName)
      expect(renderedCard?.image).toBe(sourceCard.image)
      expect(renderedCard?.image).not.toBe(
        injectedProofImages[sourceCard.categoryTag][0]
      )
    }
  })

  it('uses the Tokyo Dome photo for the Tokyo Dome card', () => {
    const { extended } = getExtendedData(injectedProofImages, undefined)
    const originalCards = extended.slice(
      CLONE_COUNT,
      extended.length - CLONE_COUNT
    )
    const tokyoDomeCard = originalCards.find(
      (card) => card.spotName === '도쿄돔'
    )

    expect(tokyoDomeCard?.contentName).toBe('BTS')
    expect(tokyoDomeCard?.image).toBe(
      '/uploads/scenes/REAL-MUS-002-scene-0.jpg'
    )
    expect(tokyoDomeCard?.image).not.toContain('REAL-MUS-001')
    expect(tokyoDomeCard?.image).not.toContain('abbey')
  })

  it('does not ship category icons as proof-card photos', () => {
    for (const card of LANDING_PROOF_CARDS) {
      expect(card.image).not.toContain('/icons/categories/')
      expect(card.sceneImage).toBeUndefined()
    }
  })

  it('preserves check-in photos before curated proof cards', () => {
    const { extended } = getExtendedData(injectedProofImages, [
      {
        id: 'checkin-1',
        spotName: '실제 체크인 스팟',
        contentName: '체크인 작품',
        photoUrl: 'https://example.com/checkin.jpg',
        comment: '직접 다녀왔어요',
        categoryTag: 'music',
        migrationStatus: 'resolved',
      },
    ])

    const originalCards = extended.slice(
      CLONE_COUNT,
      extended.length - CLONE_COUNT
    )

    expect(originalCards[0]).toMatchObject({
      id: 'checkin-checkin-1',
      spotName: '실제 체크인 스팟',
      contentName: '체크인 작품',
      image: 'https://example.com/checkin.jpg',
    })
    expect(originalCards[1].id).toBe(LANDING_PROOF_CARDS[0].id)
  })
})
