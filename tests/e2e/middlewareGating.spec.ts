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

  test('/business-audit redirects to /signup', async ({ page }) => {
    await page.goto('/business-audit')
    await expect(page).toHaveURL(/\/signup$/)
  })

  test('/tools redirects to /signup', async ({ page }) => {
    await page.goto('/tools')
    await expect(page).toHaveURL(/\/signup$/)
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
