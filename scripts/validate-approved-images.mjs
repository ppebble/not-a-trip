#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const DEFAULT_TIMEOUT_MS = 10_000
const IMAGE_CONTENT_TYPE = /^image\//

function classifyAction(status) {
  if (status === 404 || status === 410) return 'replace'
  if (status === 429) return 'retry later'
  if (status >= 500) return 'investigate storage credentials'
  if (status >= 200 && status < 300) return 'none'
  return 'archive'
}

function groupKey(host, status) {
  return `${host}::${status}`
}

async function loadEntries(inputPath) {
  if (!inputPath) return []

  const raw = await fs.readFile(inputPath, 'utf8')
  const parsed = JSON.parse(raw)

  if (Array.isArray(parsed)) return parsed
  if (Array.isArray(parsed.images)) return parsed.images
  if (Array.isArray(parsed.entries)) return parsed.entries
  if (Array.isArray(parsed.records)) return parsed.records

  throw new Error(
    'Input manifest must be an array or an object with images/entries/records array.'
  )
}

async function validateEntry(entry) {
  const spotId = entry.spotId ?? entry.id ?? 'unknown'
  const url = entry.ownedUrl ?? entry.url

  if (!url) {
    return {
      spotId,
      url: '',
      host: 'missing',
      status: 0,
      ok: false,
      contentType: '',
      action: 'replace',
    }
  }

  if (url.startsWith('file:') || url.startsWith('/')) {
    return validateLocalEntry(spotId, url)
  }

  const parsed = new URL(url)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    })
    const contentType = response.headers.get('content-type') ?? ''
    const ok = response.ok && IMAGE_CONTENT_TYPE.test(contentType)

    return {
      spotId,
      url,
      host: parsed.hostname,
      status: response.status,
      ok,
      contentType,
      action: ok ? 'none' : classifyAction(response.status),
    }
  } catch {
    return {
      spotId,
      url,
      host: parsed.hostname,
      status: 0,
      ok: false,
      contentType: '',
      action: 'retry later',
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function validateLocalEntry(spotId, url) {
  let filePath
  try {
    if (url.startsWith('file:')) {
      filePath = fileURLToPath(url)
    } else {
      const publicRoot = path.resolve(process.cwd(), 'public')
      filePath = path.resolve(publicRoot, `.${decodeURIComponent(url)}`)
      if (
        filePath !== publicRoot &&
        !filePath.startsWith(`${publicRoot}${path.sep}`)
      ) {
        throw new Error('local URL escapes public directory')
      }
    }

    const stat = await fs.stat(filePath)
    if (!stat.isFile() || stat.size === 0)
      throw new Error('not a non-empty file')

    const header = Buffer.alloc(16)
    const handle = await fs.open(filePath, 'r')
    try {
      await handle.read(header, 0, header.length, 0)
    } finally {
      await handle.close()
    }
    const contentType = detectImageContentType(header)
    if (!contentType) throw new Error('unsupported or invalid image signature')

    return {
      spotId,
      url,
      host: 'local',
      status: 200,
      ok: true,
      contentType,
      action: 'none',
    }
  } catch (error) {
    return {
      spotId,
      url,
      host: 'local',
      status: 0,
      ok: false,
      contentType: '',
      action: 'replace',
      error:
        error instanceof Error
          ? error.message
          : 'local image validation failed',
    }
  }
}

function detectImageContentType(header) {
  if (header.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])))
    return 'image/jpeg'
  if (
    header
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return 'image/png'
  if (
    header.subarray(0, 4).toString('ascii') === 'RIFF' &&
    header.subarray(8, 12).toString('ascii') === 'WEBP'
  )
    return 'image/webp'
  if (['GIF87a', 'GIF89a'].includes(header.subarray(0, 6).toString('ascii')))
    return 'image/gif'
  if (header.subarray(4, 12).toString('ascii').includes('ftypavif'))
    return 'image/avif'
  return ''
}

function summarize(results) {
  const byHostStatus = {}

  for (const result of results) {
    const key = groupKey(result.host, result.status)
    byHostStatus[key] ??= {
      host: result.host,
      status: result.status,
      count: 0,
      affectedSpotIds: [],
      action: result.action,
    }
    byHostStatus[key].count += 1
    byHostStatus[key].affectedSpotIds.push(result.spotId)
  }

  return {
    total: results.length,
    passed: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
    byHostStatus: Object.values(byHostStatus),
  }
}

const inputPath = process.argv[2]
const entries = await loadEntries(inputPath)
const results = []

for (const entry of entries) {
  results.push(await validateEntry(entry))
}

const report = {
  generatedAt: new Date().toISOString(),
  mutating: false,
  inputPath: inputPath ?? null,
  ...summarize(results),
  results,
}

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)

if (report.failed > 0) {
  process.exitCode = 1
}
