import { CATEGORY_SECTIONS, SECTION_HEADERS } from '@/types/spot'

describe('category detail section policy', () => {
  it('renders game spots like scene-based content instead of event schedules', () => {
    expect(CATEGORY_SECTIONS.game).toEqual(['scenes'])
    expect(CATEGORY_SECTIONS.game).not.toContain('events')
  })

  it('keeps e-sports style event schedules under sports, not game', () => {
    expect(CATEGORY_SECTIONS.sports).toContain('events')
    expect(SECTION_HEADERS.events.game).toBeUndefined()
  })
})
