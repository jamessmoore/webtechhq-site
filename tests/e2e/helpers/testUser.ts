import type { APIRequestContext } from '@playwright/test'
import { randomUUID } from 'crypto'
import { getVerificationTokenByEmail } from './db'

interface TestUserOverrides {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
}

export interface TestUser {
  firstName: string
  lastName: string
  email: string
  password: string
}

/** Creates a real account via the signup API — fast, no UI interaction needed for setup. */
export async function signupTestUser(
  request: APIRequestContext,
  overrides: TestUserOverrides = {},
): Promise<TestUser> {
  const user: TestUser = {
    firstName: overrides.firstName ?? 'E2E',
    lastName: overrides.lastName ?? 'Tester',
    email: overrides.email ?? `e2e-${randomUUID()}@example.com`,
    password: overrides.password ?? 'testpassword123',
  }

  const res = await request.post('/api/auth/signup', {
    data: { ...user, recaptchaToken: '' },
  })
  if (!res.ok()) {
    throw new Error(`Failed to create test user: ${res.status()} ${await res.text()}`)
  }

  return user
}

/** Signs up and verifies a real account by pulling the token straight out of the sqlite file. */
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
