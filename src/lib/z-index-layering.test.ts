import fs from 'fs'
import path from 'path'

const repoRoot = process.cwd()

function read(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

describe('global z-index layering', () => {
  test('persistent chrome stays below fixed modal overlays', () => {
    const header = read('src/components/layout/Header.tsx')
    const installBottomSheet = read('src/components/pwa/InstallBottomSheet.tsx')
    const installToast = read('src/components/pwa/InstallToast.tsx')
    const iosPwaGuide = read('src/components/pwa/IosPwaGuide.tsx')

    expect(header).toContain('z-40')
    expect(header).not.toContain('z-[1100]')
    expect(installBottomSheet).toContain('z-40')
    expect(installToast).toContain('z-40')
    expect(iosPwaGuide).toContain('z-40')
  })

  test('check-in detail modal remains above persistent chrome', () => {
    const detailModal = read('src/components/checkin/CheckInDetailModal.tsx')

    expect(detailModal).toContain('fixed inset-0 z-[1200]')
  })
})
