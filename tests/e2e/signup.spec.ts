import { test, expect } from '@playwright/test'
import { randomUUID } from 'crypto'
import { createCompletedUser } from './helpers/testUser'

// Functional auth flow — no need to repeat across every responsive viewport.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop 1280', 'Auth flows only need to run on one project')
})

test.describe('signup', () => {
  test('shows a validation error when required fields are missing', async ({ page }) => {
    await page.goto('/signup')

    // Name is HTML5-required, so a whitespace-only value passes native
    // browser validation and reaches the server, which rejects it.
    await page.getByLabel('Name').fill('   ')
    await page.getByLabel('Email').fill(`e2e-${randomUUID()}@example.com`)
    await page.getByLabel(/agree to the/i).check()

    await page.getByRole('button', { name: /get my opportunity finder/i }).click()

    await expect(page.getByText('Name and email are required.')).toBeVisible()
  })

  test('creates an account and shows the check-your-inbox confirmation', async ({ page }) => {
    const email = `e2e-${randomUUID()}@example.com`

    await page.goto('/signup')
    await page.getByLabel('Name').fill('E2E Tester')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel(/agree to the/i).check()

    await page.getByRole('button', { name: /get my opportunity finder/i }).click()

    await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()
  })

  test('rejects signup for an email that already has an account', async ({ page, request }) => {
    const existing = await createCompletedUser(request)

    await page.goto('/signup')
    await page.getByLabel('Name').fill('Duplicate User')
    await page.getByLabel('Email').fill(existing.email)
    await page.getByLabel(/agree to the/i).check()

    await page.getByRole('button', { name: /get my opportunity finder/i }).click()

    await expect(page.getByText('An account with this email already exists.')).toBeVisible()
  })
})
