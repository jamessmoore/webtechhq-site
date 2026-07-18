import { test as base, expect } from '@playwright/test'
import { randomUUID } from 'crypto'

/**
 * Auth-flow specs (signin/signup/forgotReset/middlewareGating) all funnel
 * through the signup endpoint's per-source-IP rate limit (see
 * signupIpAttempts.ts). getClientIp() falls back to X-Forwarded-For when
 * there's no nginx hop in front of the app to set X-Real-IP - which is
 * exactly the CI/local Playwright setup. Left alone, every test in the
 * suite (across all viewport projects) would share the literal "unknown"
 * bucket and trip the cap after 3 signups total, breaking unrelated tests.
 *
 * This extends the base `test` so that both the `page` fixture (browser-
 * driven form submissions) and the `request` fixture (API-driven signup
 * helper calls in testUser.ts) send a distinct X-Forwarded-For value per
 * test, giving each test its own rate-limit bucket. Import `test`/`expect`
 * from this file instead of '@playwright/test' in any spec that creates
 * accounts via the signup endpoint, directly or via the testUser helpers.
 */
// Playwright fixture functions take a callback conventionally named `use`,
// but that name trips this repo's react-hooks/rules-of-hooks lint rule
// (it heuristically treats any `use*`-named call as a React hook call).
// Renamed to `provide` here purely to dodge that false positive - it's the
// same Playwright fixture callback either way.
export const test = base.extend<{ testClientIp: string }>({
  testClientIp: async ({}, provide) => {
    await provide(randomUUID())
  },

  page: async ({ page, testClientIp }, provide) => {
    await page.context().setExtraHTTPHeaders({ 'x-forwarded-for': testClientIp })
    await provide(page)
  },

  request: async ({ playwright, baseURL, testClientIp }, provide) => {
    const context = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { 'x-forwarded-for': testClientIp },
    })
    await provide(context)
    await context.dispose()
  },
})

export { expect }
