import { expect, test } from './fixtures'

test.describe('app shell', () => {
  test('loads without errors and passes accessibility checks', async ({ page, checkA11y }) => {
    await page.goto('/')

    await expect(page).toHaveTitle('frontend-assignment')
    await expect(page.getByRole('main')).toBeAttached()
    await checkA11y()
  })
})
