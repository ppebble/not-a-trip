import { readFileSync } from 'fs'
import path from 'path'

describe('SpotDetailMap facility legend labels', () => {
  const source = readFileSync(
    path.join(process.cwd(), 'src/components/map/SpotDetailMap.tsx'),
    'utf8'
  )
  const placeholderLabel = '?'.repeat(3)

  it('renders Korean labels instead of placeholder question marks', () => {
    expect(source).not.toContain(`restaurant: '${placeholderLabel}'`)
    expect(source).not.toContain(`convenience_store: '${placeholderLabel}'`)
    expect(source).not.toContain(`public_restroom: '${placeholderLabel}'`)
    expect(source).not.toContain(`goods_shop: '${placeholderLabel}'`)
  })

  it('defines every facility type label used by the map legend', () => {
    const expectedLabels = [
      '음식점',
      '편의점',
      '카페',
      '역/정류장',
      '기타',
      '코인 로커',
      '혼밥 식당',
      '충전/와이파이',
      '화장실',
      '굿즈/잡화',
    ]

    expectedLabels.forEach((label) => {
      expect(source).toContain(label)
    })
  })
})
