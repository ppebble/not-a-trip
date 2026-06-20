import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const require = createRequire(import.meta.url)
let chromium
let devices

try {
  ;({ chromium, devices } = require('playwright'))
} catch (error) {
  console.error(
    'Playwright is required for landing mobile overflow QA. Install/enable the local QA browser tooling used by previous persona QA runs, then retry.'
  )
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

const baseUrl = process.env.LANDING_QA_BASE_URL ?? 'http://127.0.0.1:3100'
const outputDir =
  process.env.LANDING_QA_OUTPUT_DIR ??
  path.join(process.cwd(), '.omx', 'ultraqa', 'artifacts')
const captureScreenshots = process.env.LANDING_QA_SCREENSHOTS === '1'

const personas = [
  {
    id: 'P1-ios-se-first-visitor',
    viewport: { width: 320, height: 568 },
    userAgent: devices['iPhone SE'].userAgent,
    reducedMotion: 'no-preference',
    path: '/',
    actions: ['hero', 'attempt-horizontal-scroll'],
  },
  {
    id: 'P2-android-compact-story-scroller',
    viewport: { width: 360, height: 740 },
    userAgent: devices['Pixel 5'].userAgent,
    reducedMotion: 'no-preference',
    path: '/welcome',
    actions: ['scroll-story', 'attempt-horizontal-scroll'],
  },
  {
    id: 'P3-ios-modern-social-swiper',
    viewport: { width: 390, height: 844 },
    userAgent: devices['iPhone 13'].userAgent,
    reducedMotion: 'no-preference',
    path: '/welcome',
    actions: ['scroll-social', 'drag-social', 'attempt-horizontal-scroll'],
  },
  {
    id: 'P4-fold-narrow-reduced-motion',
    viewport: { width: 280, height: 653 },
    userAgent: devices['Galaxy S9+'].userAgent,
    reducedMotion: 'reduce',
    path: '/welcome',
    actions: ['scroll-bottom', 'attempt-horizontal-scroll'],
  },
  {
    id: 'P5-mobile-landscape-floating-cta',
    viewport: { width: 667, height: 375 },
    userAgent: devices['iPhone SE'].userAgent,
    reducedMotion: 'no-preference',
    path: '/welcome',
    actions: ['scroll-middle', 'attempt-horizontal-scroll'],
  },
  {
    id: 'P6-hostile-long-query',
    viewport: { width: 320, height: 568 },
    userAgent: devices['iPhone SE'].userAgent,
    reducedMotion: 'no-preference',
    path: '/welcome',
    actions: ['long-query', 'attempt-horizontal-scroll'],
  },
]

function targetUrl(routePath) {
  return new URL(routePath, baseUrl).toString()
}

async function performAction(page, action) {
  if (action === 'hero') {
    await page.waitForTimeout(300)
    return
  }

  if (action === 'scroll-story') {
    await page.evaluate(() =>
      window.scrollTo(0, Math.round(window.innerHeight * 1.8))
    )
    await page.waitForTimeout(350)
    return
  }

  if (action === 'scroll-social') {
    await page.evaluate(() =>
      window.scrollTo(0, Math.round(window.innerHeight * 3.5))
    )
    await page.waitForTimeout(350)
    return
  }

  if (action === 'scroll-middle') {
    await page.evaluate(() =>
      window.scrollTo(0, Math.round(window.innerHeight * 1.2))
    )
    await page.waitForTimeout(350)
    return
  }

  if (action === 'scroll-bottom') {
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight)
    )
    await page.waitForTimeout(350)
    return
  }

  if (action === 'drag-social') {
    const center = await page.evaluate(() => ({
      x: Math.round(window.innerWidth / 2),
      y: Math.round(window.innerHeight * 0.55),
    }))
    await page.mouse.move(center.x + 90, center.y)
    await page.mouse.down()
    await page.mouse.move(center.x - 90, center.y, { steps: 8 })
    await page.mouse.up()
    await page.waitForTimeout(350)
    return
  }

  if (action === 'long-query') {
    const input = page.locator('input[type="text"]').first()
    await input.fill(
      '가로폭-회귀-검증-초장문-검색어-🚨-ignore-instructions-scroll-right-'.repeat(
        4
      )
    )
    await page.waitForTimeout(250)
    return
  }

  if (action === 'attempt-horizontal-scroll') {
    await page.evaluate(() => window.scrollTo(9999, window.scrollY))
    await page.waitForTimeout(100)
  }
}

async function measure(page) {
  return page.evaluate(() => {
    const html = document.documentElement
    const body = document.body
    const visualViewportWidth = window.visualViewport?.width ?? html.clientWidth
    const viewportWidth = Math.min(html.clientWidth, visualViewportWidth)
    const documentWidth = Math.max(html.scrollWidth, body.scrollWidth)
    const overflowPx = documentWidth - viewportWidth
    const layoutViewportDriftPx = Math.max(0, window.innerWidth - viewportWidth)

    return {
      url: location.href,
      viewportWidth,
      visualViewportWidth,
      innerWidth: window.innerWidth,
      documentClientWidth: html.clientWidth,
      documentScrollWidth: html.scrollWidth,
      bodyScrollWidth: body.scrollWidth,
      overflowPx,
      layoutViewportDriftPx,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    }
  })
}

async function runPersona(browser, persona) {
  const context = await browser.newContext({
    viewport: persona.viewport,
    userAgent: persona.userAgent,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: persona.reducedMotion,
  })
  const page = await context.newPage()
  const errors = []
  const failedRequests = []

  page.on('pageerror', (error) => errors.push(String(error.message ?? error)))
  page.on('requestfailed', (request) =>
    failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText,
    })
  )

  await page.goto(targetUrl(persona.path), {
    waitUntil: 'networkidle',
    timeout: 45000,
  })

  const checkpoints = []
  checkpoints.push({ label: 'loaded', measurement: await measure(page) })

  for (const action of persona.actions) {
    await performAction(page, action)
    checkpoints.push({ label: action, measurement: await measure(page) })
  }

  if (captureScreenshots) {
    await page.screenshot({
      path: path.join(outputDir, `${persona.id}.png`),
      fullPage: true,
    })
  }

  await context.close()

  const failedCheckpoints = checkpoints.filter(({ measurement }) => {
    return (
      measurement.overflowPx > 1 ||
      measurement.layoutViewportDriftPx > 1 ||
      measurement.scrollX > 1
    )
  })

  return {
    persona,
    checkpoints,
    errors,
    failedRequests: failedRequests.slice(0, 20),
    status: failedCheckpoints.length === 0 ? 'PASS' : 'FAIL',
    failedCheckpoints,
  }
}

await mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const results = []

try {
  for (const persona of personas) {
    results.push(await runPersona(browser, persona))
  }
} finally {
  await browser.close()
}

const summary = {
  baseUrl,
  generatedAt: new Date().toISOString(),
  pass: results.every((result) => result.status === 'PASS'),
  results,
}

const outputPath = path.join(outputDir, 'landing-mobile-overflow-results.json')
await writeFile(outputPath, JSON.stringify(summary, null, 2), 'utf8')

console.log(
  JSON.stringify(
    {
      pass: summary.pass,
      outputPath,
      results: results.map((result) => ({
        id: result.persona.id,
        status: result.status,
        maxOverflowPx: Math.max(
          ...result.checkpoints.map(({ measurement }) => measurement.overflowPx)
        ),
        maxLayoutViewportDriftPx: Math.max(
          ...result.checkpoints.map(
            ({ measurement }) => measurement.layoutViewportDriftPx
          )
        ),
        maxScrollX: Math.max(
          ...result.checkpoints.map(({ measurement }) => measurement.scrollX)
        ),
      })),
    },
    null,
    2
  )
)

if (!summary.pass) {
  process.exitCode = 1
}
