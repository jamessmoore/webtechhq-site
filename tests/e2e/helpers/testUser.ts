import type { APIRequestContext } from '@playwright/test'
import { randomUUID } from 'crypto'
import { getVerificationTokenByEmail } from './db'

interface TestUserOverrides {
  name?: string
  email?: string
  password?: string
  lastName?: string
}

export interface TestUser {
  name: string
  email: string
  password: string
  lastName?: string
}

/** Creates a lightweight account (name + email only, no password yet) via the signup API. */
export async function signupTestUser(
  request: APIRequestContext,
  overrides: TestUserOverrides = {},
): Promise<TestUser> {
  const user: TestUser = {
    name: overrides.name ?? 'E2E Tester',
    email: overrides.email ?? `e2e-${randomUUID()}@example.com`,
    password: overrides.password ?? 'testpassword123',
    lastName: overrides.lastName,
  }

  const res = await request.post('/api/auth/signup', {
    data: { name: user.name, email: user.email, recaptchaToken: '' },
  })
  if (!res.ok()) {
    throw new Error(`Failed to create test user: ${res.status()} ${await res.text()}`)
  }

  return user
}

/**
 * Signs up and verifies a real account by pulling the token straight out of
 * the sqlite file. Verifying also auto-logs the account in (on this same
 * request context) — the account still has no password until it completes
 * account creation.
 */
export async function createVerifiedUser(
  request: APIRequestContext,
  overrides: TestUserOverrides = {},
): Promise<TestUser> {
  const user = await signupTestUser(request, overrides)

  const token = getVerificationTokenByEmail(user.email)
  if (!token) throw new Error(`No verification token found for ${user.email}`)

  const verifyRes = await request.get(`/api/verify/${token}`)
  if (!verifyRes.ok()) {
    throw new Error(`Failed to verify test user: ${verifyRes.status()}`)
  }

  return user
}

/**
 * Signs up, verifies, and completes account creation (sets a password), so
 * the resulting account behaves like any normal, fully completed account —
 * e.g. for tests that need to sign in with credentials. Relies on the
 * session cookie the verify step's auto-login sets on this same request
 * context to authorize the complete-signup call.
 */
export async function createCompletedUser(
  request: APIRequestContext,
  overrides: TestUserOverrides = {},
): Promise<TestUser> {
  const user = await createVerifiedUser(request, overrides)

  const res = await request.post('/api/auth/complete-signup', {
    data: { password: user.password, lastName: user.lastName },
  })
  if (!res.ok()) {
    throw new Error(`Failed to complete test user signup: ${res.status()} ${await res.text()}`)
  }

  return user
}
