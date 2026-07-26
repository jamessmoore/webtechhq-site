import { test, expect } from './helpers/fixtures'
import { createCompletedUser } from './helpers/testUser'

// Functional auth flow — no need to repeat across every responsive viewport.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop 1280', 'Auth flows only need to run on one project')
})

test.describe('middleware gating (signed out)', () => {
  test('/admin redirects to /signin', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/signin$/)
  })

  test('/business-audit redirects to /tools', async ({ page }) => {
    await page.goto('/business-audit')
    // proxy.ts redirects the gated top-level /business-audit to /signup,
    // which itself permanently redirects to /tools.
    await expect(page).toHaveURL(/\/tools$/)
  })

  test('/tools renders without redirecting when signed out', async ({ page }) => {
    await page.goto('/tools')
    // /tools root is in proxy.ts's isUngatedToolsPath, so it's anonymous-browsable
    await expect(page).toHaveURL(/\/tools$/)
    await expect(page.getByRole('heading', { name: 'Your AI toolkit.' })).toBeVisible()
  })

  test('/tools/business-audit renders the gate screen instead of redirecting when signed out', async ({ page }) => {
    const response = await page.goto('/tools/business-audit')
    // /tools/business-audit is also in proxy.ts's isUngatedToolsPath, so an
    // anonymous visitor gets a 200 with the "finish the Opportunity Finder
    // first" gate screen rather than a redirect to /signup.
    expect(response?.status()).toBe(200)
    await expect(page).toHaveURL(/\/tools\/business-audit$/)
    await expect(page.getByRole('heading', { name: 'Finish the Opportunity Finder first' })).toBeVisible()
  })
})

test.describe('middleware gating (signed in)', () => {
  test('an authenticated user reaches /tools without being redirected', async ({ page, request }) => {
    const user = await createCompletedUser(request)

    await page.goto('/signin')
    await page.getByLabel('Email').fill(user.email)
    await page.getByLabel('Password').fill(user.password)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/tools$/)

    await page.goto('/tools')
    await expect(page).toHaveURL(/\/tools$/)
  })
})
