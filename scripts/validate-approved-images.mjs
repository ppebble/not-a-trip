#!/usr/bin/env node

import fs from 'node:fs/promises'
import process from 'node:process'

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

  throw new Error(
    'Input manifest must be an array or an object with images/entries array.'
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

  const parsed = new URL(url)

  if (parsed.protocol === 'file:' || url.startsWith('/')) {
    return {
      spotId,
      url,
      host: 'local',
      status: 200,
      ok: true,
      contentType: 'image/local',
      action: 'none',
    }
  }

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
