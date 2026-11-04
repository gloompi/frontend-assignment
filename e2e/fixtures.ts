import AxeBuilder from '@axe-core/playwright'
import { expect, test as base } from '@playwright/test'

// Guardrail fixtures shared by every spec:
// - fail the test on any console error, uncaught page error or failed same-origin request
// - `checkA11y()` runs axe against the current page (WCAG 2.1 A/AA)
interface Fixtures {
  checkA11y: () => Promise<void>
  pageProblems: string[]
}

export const test = base.extend<Fixtures>({
  pageProblems: [
    async ({ page, baseURL }, use) => {
      const problems: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') problems.push(`console.error: ${msg.text()}`)
      })
      page.on('pageerror', (error) => {
        problems.push(`pageerror: ${error.message}`)
      })
      page.on('response', (response) => {
        if (baseURL && response.url().startsWith(baseURL) && response.status() >= 400) {
          problems.push(`HTTP ${String(response.status())}: ${response.url()}`)
        }
      })
      await use(problems)
      expect(problems, 'Browser reported problems during the test').toEqual([])
    },
    { auto: true },
  ],
  checkA11y: async ({ page }, use) => {
    await use(async () => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(results.violations, 'Accessibility violations').toEqual([])
    })
  },
})

export { expect }
