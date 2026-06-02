import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const scriptPath = path.join(
  process.cwd(),
  'scripts',
  'check-design-token-raw-utilities.mjs'
)

describe('design token raw utility scanner', () => {
  it('flags raw semantic palette and shadow utilities without flagging semantic tokens or layout utilities', () => {
    const code = `
      import { scanText } from ${JSON.stringify(pathToFileURL(scriptPath).href)};
      const findings = scanText(
        '<div className="flex gap-2 bg-red-50 text-main-text hover:bg-primary-600 shadow-sm border-border md:px-4" />',
        'fixture.tsx'
      );
      console.log(JSON.stringify(findings.map((finding) => finding.utility)));
    `

    const output = execFileSync(
      process.execPath,
      ['--input-type=module', '-e', code],
      {
        encoding: 'utf8',
      }
    )

    expect(JSON.parse(output)).toEqual(['bg-red-50', 'shadow-sm'])
  })

  it('passes the checked baseline for current admin/checkin/mobile/profile surfaces', () => {
    expect(() =>
      execFileSync(process.execPath, [scriptPath, '--check'], {
        encoding: 'utf8',
        stdio: 'pipe',
      })
    ).not.toThrow()
  })
})
