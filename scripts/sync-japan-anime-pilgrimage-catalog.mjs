import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE_URL =
  'https://animetourism88.com/topic/%E3%80%8E%E8%A8%AA%E3%82%8C%E3%81%A6%E3%81%BF%E3%81%9F%E3%81%84%E6%97%A5%E6%9C%AC%E3%81%AE%E3%82%A2%E3%83%8B%E3%83%A1%E8%81%96%E5%9C%B0-88%E3%80%8F2026%E5%B9%B4%E7%89%88-%E9%81%B8%E5%AE%9A%E3%81%AB/'
const EDITION = 2026
const EXPECTED_WORK_COUNT = 146
const EXPECTED_FACILITY_COUNT = 29
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const outputPath = path.join(
  scriptDirectory,
  'data',
  'japan-anime-pilgrimage-2026.json'
)

function decodeHtml(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'")
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&nbsp;', ' ')
}

function cellText(cellHtml) {
  return decodeHtml(cellHtml.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function parseTable(tableHtml, kind) {
  const rows = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
  const selections = []

  for (const row of rows) {
    const cells = [
      ...row[1].matchAll(/<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/gi),
    ].map((match) => cellText(match[1]))

    if (cells.length < 4 || !/^\d+$/.test(cells[1])) continue

    selections.push({
      index: Number(cells[1]),
      kind,
      name: cells[2],
      region: cells[3],
      isNew: cells[0].includes('NEW'),
    })
  }

  return selections
}

function parseCatalog(html) {
  const tables = [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)].map(
    (match) => match[0]
  )
  const workTable = tables.find((table) => table.includes('作品名'))
  const facilityTable = tables.find((table) => table.includes('施設名'))

  if (!workTable || !facilityTable) {
    throw new Error('Official 2026 work/facility tables were not found.')
  }

  const works = parseTable(workTable, 'work')
  const facilities = parseTable(facilityTable, 'facility')

  if (works.length !== EXPECTED_WORK_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_WORK_COUNT} works, received ${works.length}.`
    )
  }
  if (facilities.length !== EXPECTED_FACILITY_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_FACILITY_COUNT} facilities, received ${facilities.length}.`
    )
  }

  const selections = [...works, ...facilities]
  selections.forEach((selection, offset) => {
    if (selection.index !== offset + 1) {
      throw new Error(
        `Official index sequence broke at ${selection.index}; expected ${offset + 1}.`
      )
    }
    if (!selection.name || !selection.region) {
      throw new Error(`Selection ${selection.index} is missing name or region.`)
    }
  })

  return selections
}

async function main() {
  const response = await fetch(SOURCE_URL, {
    headers: { 'user-agent': 'not-a-trip-data-sync/1.0' },
  })
  if (!response.ok) {
    throw new Error(`Official catalog request failed: HTTP ${response.status}`)
  }

  const selections = parseCatalog(await response.text())
  const catalog = {
    edition: EDITION,
    source: {
      publisher: 'Anime Tourism Association',
      url: SOURCE_URL,
      publishedAt: '2026-02-13',
      retrievedAt: new Date().toISOString().slice(0, 10),
    },
    counts: {
      works: EXPECTED_WORK_COUNT,
      facilities: EXPECTED_FACILITY_COUNT,
      total: selections.length,
      newSelections: selections.filter((selection) => selection.isNew).length,
    },
    selections,
  }
  const serialized = `${JSON.stringify(catalog, null, 2)}\n`

  if (process.argv.includes('--write')) {
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, serialized, 'utf8')
    console.log(`Wrote ${selections.length} selections to ${outputPath}`)
    return
  }

  const checkedIn = await fs.readFile(outputPath, 'utf8')
  const normalizedCheckedIn = JSON.parse(checkedIn)
  normalizedCheckedIn.source.retrievedAt = catalog.source.retrievedAt

  if (`${JSON.stringify(normalizedCheckedIn, null, 2)}\n` !== serialized) {
    throw new Error(
      'Checked-in pilgrimage catalog differs from the official page. Run with --write.'
    )
  }

  console.log(`Catalog is current: ${selections.length} official selections.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
