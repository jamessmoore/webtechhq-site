import { test, expect } from '@playwright/test'
import { randomUUID } from 'crypto'
import { createVerifiedUser } from './helpers/testUser'
import { getResetTokenByEmail } from './helpers/db'

// Functional auth flow — no need to repeat across every responsive viewport.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop 1280', 'Auth flows only need to run on one project')
})

test.describe('forgot password', () => {
  test('shows a generic confirmation even for an email with no account', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByLabel('Email').fill(`no-account-${randomUUID()}@example.com`)
    await page.getByRole('button', { name: /send reset link/i }).click()

    await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible()
  })

  test('sends a reset link for a known account and completes the password reset', async ({ page, request }) => {
    const user = await createVerifiedUser(request)

    await page.goto('/forgot-password')
    await page.getByLabel('Email').fill(user.email)
    await page.getByRole('button', { name: /send reset link/i }).click()
    await expect(page.getByRole('heading', { name: 'Check your inbox' })).toBeVisible()

    const token = getResetTokenByEmail(user.email)
    expect(token).toBeTruthy()

    await page.goto(`/reset-password/${token}`)
    await page.getByLabel(/^new password$/i).fill('brandnewpassword123')
    await page.getByLabel('Confirm new password').fill('brandnewpassword123')
    await page.getByRole('button', { name: /reset password/i }).click()

    await expect(page.getByRole('heading', { name: 'Password updated' })).toBeVisible()

    // Confirm the new password actually works.
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/signin$/)
    await page.getByLabel('Email').fill(user.email)
    await page.getByLabel('Password').fill('brandnewpassword123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/tools$/)
  })

  test('shows a client-side error when the confirmation password does not match', async ({ page }) => {
    await page.goto('/reset-password/some-token-value')
    await page.getByLabel(/^new password$/i).fill('firstpassword123')
    await page.getByLabel('Confirm new password').fill('differentpassword123')
    await page.getByRole('button', { name: /reset password/i }).click()

    await expect(page.getByText("Passwords don't match.")).toBeVisible()
  })

  test('shows a server error for an invalid or expired reset token', async ({ page }) => {
    await page.goto('/reset-password/this-token-does-not-exist')
    await page.getByLabel(/^new password$/i).fill('anewpassword123')
    await page.getByLabel('Confirm new password').fill('anewpassword123')
    await page.getByRole('button', { name: /reset password/i }).click()

    await expect(page.getByText(/invalid/i)).toBeVisible()
  })
})
