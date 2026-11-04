// Browser session helper for manual QA scripts (used by the qa-verifier agent).
//
//   import { openApp } from '<repo>/scripts/qa/browser.mjs'
//   const app = await openApp({ url: process.env.APP_URL, evidenceDir: import.meta.dirname })
//   await app.page.getByRole('button', { name: 'Save' }).click()
//   await app.shot('after-save')          // full-page PNG in evidenceDir, path is printed
//   console.log(await app.snapshot())     // accessibility tree as YAML (what a user can perceive)
//   await app.close()                     // prints console errors, page errors, failed requests
import { chromium, devices } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const PROFILES = {
  desktop: devices['Desktop Chrome'],
  mobile: devices['Pixel 7'],
}

export async function openApp({
  url = process.env.APP_URL,
  evidenceDir = process.cwd(),
  device = 'desktop',
  path: route = '/',
} = {}) {
  if (!url) throw new Error('openApp: pass { url } or set APP_URL (see scripts/qa/serve.mjs)')
  mkdirSync(evidenceDir, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({ ...PROFILES[device], baseURL: url })
  const page = await context.newPage()

  const problems = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      problems.push(`console.${msg.type()}: ${msg.text()}`)
    }
  })
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
  page.on('requestfailed', (request) =>
    problems.push(`requestfailed: ${request.url()} (${request.failure()?.errorText ?? '?'})`),
  )
  page.on('response', (response) => {
    if (response.status() >= 400)
      problems.push(`HTTP ${String(response.status())}: ${response.url()}`)
  })

  await page.goto(route)

  let shotIndex = 0
  return {
    page,
    context,
    problems,
    async shot(name, options = {}) {
      shotIndex += 1
      const file = path.join(
        evidenceDir,
        `${String(shotIndex).padStart(2, '0')}-${device}-${name}.png`,
      )
      await page.screenshot({ path: file, fullPage: true, ...options })
      console.log(`screenshot: ${file}`)
      return file
    },
    async snapshot(locator = page.locator('body')) {
      return locator.ariaSnapshot()
    },
    async close() {
      console.log(
        problems.length
          ? `BROWSER PROBLEMS (${String(problems.length)}):\n${problems.join('\n')}`
          : 'BROWSER PROBLEMS: none',
      )
      await browser.close()
    },
  }
}
