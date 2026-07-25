import { test, expect } from './helpers/fixtures'
import type { Page } from '@playwright/test'
import { randomUUID } from 'crypto'
import { createCompletedUser } from './helpers/testUser'

// Functional auth flow — no need to repeat across every responsive viewport.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop 1280', 'Auth flows only need to run on one project')
})

// /signup is retired as a standalone account-creation page (see
// next.config.js's permanent redirect) - Opportunity Finder and Prompt Pilot
// are both usable anonymously now, and account creation happens only via the
// "save this result" claim step after a real submission (SignUpForm reused
// with a different endpoint, see PromptDisplay.tsx / PromptPilotDisplay.tsx).
test.describe('/signup', () => {
  test('permanently redirects to /tools/opportunity-finder', async ({ page }) => {
    const response = await page.goto('/signup')
    await expect(page).toHaveURL(/\/tools\/opportunity-finder$/)
    // next.config.js's redirects() entry is `permanent: true` (308).
    expect(response?.request().redirectedFrom()).not.toBeNull()
  })
})

/** Fills out and submits the Opportunity Finder anonymously, landing on the "save this result" claim form. */
async function submitOpportunityFinderAnonymously(page: Page) {
  await page.goto('/tools/opportunity-finder')

  // Step 1: Your Business
  await page.getByPlaceholder('e.g. plumbing company, restaurant, coaching practice…').fill('Plumbing company')
  await page.getByRole('button', { name: /^NEXT/i }).click()

  // Step 2: The Problem
  await page
    .getByPlaceholder('Be as specific as you can. The more detail, the better your report will be.')
    .fill('Scheduling after-hours calls eats up my whole evening.')
  await page.getByRole('button', { name: /^NEXT/i }).click()

  // Step 3: The Cost - no required fields, skip straight through
  await page.getByRole('button', { name: /^NEXT/i }).click()

  // Step 4: The Fit - no required fields, submit
  await page.getByRole('button', { name: /^SUBMIT/i }).click()

  // Anonymous result screen shows the "save this result" claim form.
  await expect(page.getByRole('button', { name: /save my result/i })).toBeVisible()
}

test.describe('Opportunity Finder anonymous claim flow (save this result)', () => {
  test('shows a validation error when required fields are missing', async ({ page }) => {
    await submitOpportunityFinderAnonymously(page)

    // Name is HTML5-required, so a whitespace-only value passes native
    // browser validation and reaches the server, which rejects it.
    await page.getByLabel('Name').fill('   ')
    await page.getByLabel('Email').fill(`e2e-${randomUUID()}@example.com`)
    await page.getByLabel(/agree to the/i).check()

    await page.getByRole('button', { name: /save my result/i }).click()

    await expect(page.getByText('Name and email are required.')).toBeVisible()
  })

  test('claims the result, creates an account, and shows the check-your-inbox confirmation', async ({ page }) => {
    const email = `e2e-${randomUUID()}@example.com`

    await submitOpportunityFinderAnonymously(page)

    await page.getByLabel('Name').fill('E2E Tester')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel(/agree to the/i).check()

    await page.getByRole('button', { name: /save my result/i }).click()

    await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()
  })

  test('rejects claiming a result for an email that already has an account', async ({ page, request }) => {
    const existing = await createCompletedUser(request)

    await submitOpportunityFinderAnonymously(page)

    await page.getByLabel('Name').fill('Duplicate User')
    await page.getByLabel('Email').fill(existing.email)
    await page.getByLabel(/agree to the/i).check()

    await page.getByRole('button', { name: /save my result/i }).click()

    await expect(page.getByText('An account with this email already exists.')).toBeVisible()
  })
})
