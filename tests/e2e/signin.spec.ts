import { test, expect } from './helpers/fixtures'
import { createCompletedUser, signupTestUser } from './helpers/testUser'

// Functional auth flow — no need to repeat across every responsive viewport.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop 1280', 'Auth flows only need to run on one project')
})

test.describe('signin', () => {
  test('signs in with valid credentials and reaches /tools', async ({ page, request }) => {
    const user = await createCompletedUser(request)

    await page.goto('/signin')
    await page.getByLabel('Email').fill(user.email)
    await page.getByLabel('Password').fill(user.password)
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/tools$/)
  })

  test('shows an error for the wrong password', async ({ page, request }) => {
    const user = await createCompletedUser(request)

    await page.goto('/signin')
    await page.getByLabel('Email').fill(user.email)
    await page.getByLabel('Password').fill('completely-wrong-password')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText('Incorrect email or password.')).toBeVisible()
  })

  test('blocks sign-in until the email is verified', async ({ page, request }) => {
    const user = await signupTestUser(request)

    await page.goto('/signin')
    await page.getByLabel('Email').fill(user.email)
    await page.getByLabel('Password').fill(user.password)
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/verify your email before signing in/i)).toBeVisible()
  })
})
