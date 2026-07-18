import { test, expect } from '@playwright/test'
import { randomUUID } from 'crypto'
import { createCompletedUser, signupTestUser } from './helpers/testUser'

// Functional admin flow — no need to repeat across every responsive viewport.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop 1280', 'Admin flows only need to run on one project')
})

// requireAdmin() (src/app/admin/users/page.tsx) gates on an exact
// process.env.ADMIN_EMAIL match, so these specs only make sense where that's
// configured (CI sets it; see .github/workflows/test.yml). Skip cleanly
// rather than failing when it isn't, e.g. an ad hoc local run.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL

async function signInAsAdmin(page: import('@playwright/test').Page, request: import('@playwright/test').APIRequestContext) {
  if (!ADMIN_EMAIL) throw new Error('ADMIN_EMAIL must be set to run admin e2e specs')
  const admin = await createCompletedUser(request, { email: ADMIN_EMAIL, name: 'Admin' })

  await page.goto('/signin')
  await page.getByLabel('Email').fill(admin.email)
  await page.getByLabel('Password').fill(admin.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/tools$/)
}

test.describe('admin users column search', () => {
  test.skip(!ADMIN_EMAIL, 'requires ADMIN_EMAIL to be configured for this run')

  test('clicking a row before the search debounce fires still navigates to that user (regression test)', async ({ page, request }) => {
    await signInAsAdmin(page, request)

    // A distinctive, unique-per-run name so the NAME column's regex search
    // matches exactly this one row, and only this run's row.
    const targetName = `RaceRow-${randomUUID().slice(0, 8)}`
    await signupTestUser(request, { name: targetName })

    await page.goto('/admin/users')
    const rowLink = page.getByRole('link', { name: `View ${targetName}` })
    await expect(rowLink).toBeVisible()

    // Open the NAME column's search panel and start typing - this schedules
    // AdminUsersColumnSearch's 300ms debounced router.replace(). Immediately
    // (well inside that window) click the now-visible matching row, exactly
    // the "type then click before the debounce lands" sequence a fast user
    // naturally produces. Before the fix, clicking the row blurs the search
    // input, whose blur handler flushes the still-pending debounce straight
    // to router.replace() - which can land after (and clobber) the row
    // Link's own router.push(), silently bouncing the user back to the list
    // instead of the detail page.
    const nameColumn = page.getByRole('columnheader', { name: 'NAME' })
    await nameColumn.locator('summary[aria-label="Search NAME"]').click()
    await nameColumn.getByPlaceholder('regex').fill(targetName)
    // rowLink's box is the *whole* row (a stretched link spanning every
    // column, including EMAIL - whose own mailto: anchor deliberately sits
    // above it there so addresses stay clickable). Click near its left edge,
    // over the NAME cell, so the click actually lands on the row link itself
    // rather than getting intercepted by that email anchor.
    await rowLink.click({ position: { x: 20, y: 10 } })

    await expect(page).not.toHaveURL(/\/admin\/users\/?(\?.*)?$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(targetName)
  })
})
