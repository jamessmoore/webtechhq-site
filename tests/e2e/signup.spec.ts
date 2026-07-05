import { test, expect } from '@playwright/test'
import { randomUUID } from 'crypto'
import { signupTestUser } from './helpers/testUser'

// Functional auth flow — no need to repeat across every responsive viewport.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop 1280', 'Auth flows only need to run on one project')
})

test.describe('signup', () => {
  test('shows a validation error when required fields are missing', async ({ page }) => {
    await page.goto('/signup')

    await page.getByLabel('Last name').fill('Tester')
    await page.getByLabel('Email').fill(`e2e-${randomUUID()}@example.com`)
    await page.getByLabel('Password').fill('testpassword123')
    await page.getByLabel(/agree to the/i).check()

    await page.getByRole('button', { name: /get started/i }).click()

    await expect(page.getByText('All fields are required.')).toBeVisible()
  })

  test('creates an account and shows the check-your-inbox confirmation', async ({ page }) => {
    const email = `e2e-${randomUUID()}@example.com`

    await page.goto('/signup')
    await page.getByLabel('First name').fill('E2E')
    await page.getByLabel('Last name').fill('Tester')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill('testpassword123')
    await page.getByLabel(/agree to the/i).check()

    await page.getByRole('button', { name: /get started/i }).click()

    await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()
  })

  test('rejects signup for an email that already has an account', async ({ page, request }) => {
    const existing = await signupTestUser(request)

    await page.goto('/signup')
    await page.getByLabel('First name').fill('Duplicate')
    await page.getByLabel('Last name').fill('User')
    await page.getByLabel('Email').fill(existing.email)
    await page.getByLabel('Password').fill('anotherpassword123')
    await page.getByLabel(/agree to the/i).check()

    await page.getByRole('button', { name: /get started/i }).click()

    await expect(page.getByText('An account with this email already exists.')).toBeVisible()
  })
})
