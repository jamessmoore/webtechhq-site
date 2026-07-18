import { randomUUID } from 'crypto'
import { createCompletedUser, signupTestUser } from './helpers/testUser'
import { test, expect } from './helpers/fixtures'

// Functional admin flow — no need to repeat across every responsive viewport.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop 1280', 'Admin flows only need to run on one project')
})

// requireAdmin() (src/app/admin/users/page.tsx) gates on an exact
// process.env.ADMIN_EMAIL match, so these specs only make sense where that's
// configured (CI sets it; see .github/workflows/test.yml). Skip cleanly
// rather than failing when it isn't, e.g. an ad hoc local run.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL

const ADMIN_PASSWORD = 'testpassword123'

async function signInAsAdmin(page: import('@playwright/test').Page, request: import('@playwright/test').APIRequestContext) {
  if (!ADMIN_EMAIL) throw new Error('ADMIN_EMAIL must be set to run admin e2e specs')

  try {
    await createCompletedUser(request, { email: ADMIN_EMAIL, name: 'Admin', password: ADMIN_PASSWORD })
  } catch (err) {
    // requireAdmin() gates on an exact process.env.ADMIN_EMAIL match, so
    // every test in this file has to sign in as the same one fixed account.
    // Whichever test completes that signup first "wins"; every later test
    // hits the signup API's 409 "account already exists" - which just means
    // the account is already there and usable, so sign in with it instead.
    if (!(err instanceof Error) || !err.message.includes('already exists')) throw err
  }

  await page.goto('/signin')
  await page.getByLabel('Email').fill(ADMIN_EMAIL)
  await page.getByLabel('Password').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/tools$/)
}

test.describe('admin users column search', () => {
  test.skip(!ADMIN_EMAIL, 'requires ADMIN_EMAIL to be configured for this run')

  // Every test here signs in as the same fixed ADMIN_EMAIL account (see
  // signInAsAdmin above) - run them one at a time so two tests can't race
  // to create/complete that one shared account concurrently.
  test.describe.configure({ mode: 'serial' })

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

  test('clicking a row still navigates even when the search blur handler\'s deferred check is delayed past the old, now-removed TTL window (regression test)', async ({ page, request }) => {
    await signInAsAdmin(page, request)

    const targetName = `SlowBlurRace-${randomUUID().slice(0, 8)}`
    await signupTestUser(request, { name: targetName })

    // AdminUsersColumnSearch's onBlur defers its "did focus really end up
    // outside the panel" check via `window.setTimeout(fn, 0)` (see
    // AdminUsersColumnSearch.tsx). src/lib/adminUsersRowNavigation.ts used to
    // bound its shared pending-navigation flag with a 200ms self-expiring
    // timer; Argus flagged that a timer only guarantees a *minimum* delay,
    // not a *maximum* one, so under real main-thread contention this deferred
    // check could fire *after* that timer already cleared the flag,
    // reintroducing the original row-click-vs-debounce-flush race. Reproduce
    // exactly that contention deterministically - delay every zero-delay
    // timeout well past the old 200ms window - so this test would have failed
    // against that timer-based fix and must pass against the current one,
    // which has no duration left to race against at all.
    await page.addInitScript(() => {
      const realSetTimeout = window.setTimeout.bind(window)
      window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
        const delay = timeout === 0 || timeout === undefined ? 350 : timeout
        return realSetTimeout(handler, delay, ...args)
      }) as typeof window.setTimeout
    })

    await page.goto('/admin/users')
    const rowLink = page.getByRole('link', { name: `View ${targetName}` })
    await expect(rowLink).toBeVisible()

    const nameColumn = page.getByRole('columnheader', { name: 'NAME' })
    await nameColumn.locator('summary[aria-label="Search NAME"]').click()
    await nameColumn.getByPlaceholder('regex').fill(targetName)
    await rowLink.click({ position: { x: 20, y: 10 } })

    await expect(page).not.toHaveURL(/\/admin\/users\/?(\?.*)?$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(targetName)
  })

  test('typing a column search and clicking away still commits after an earlier, unrelated row click (regression test)', async ({ page, request }) => {
    await signInAsAdmin(page, request)

    // A row to click first with no column search open anywhere - the
    // ordinary, overwhelmingly common case. This is what armed the stale
    // `rowNavigationPending` flag in the round-2 regression: nothing ever
    // consumes it here, since `closePanel()` (the only consumer) never runs
    // when no search is open.
    const firstClickName = `PlainRowClick-${randomUUID().slice(0, 8)}`
    await signupTestUser(request, { name: firstClickName })

    // A second, distinct row to search for later - a completely separate
    // interaction from the row click above.
    const targetName = `SearchAfterClick-${randomUUID().slice(0, 8)}`
    await signupTestUser(request, { name: targetName })

    await page.goto('/admin/users')

    const firstRowLink = page.getByRole('link', { name: `View ${firstClickName}` })
    await expect(firstRowLink).toBeVisible()
    await firstRowLink.click({ position: { x: 20, y: 10 } })
    await expect(page).not.toHaveURL(/\/admin\/users\/?(\?.*)?$/)

    // Navigate back to the list - by now the row click above is long over,
    // but before the fix, the flag it set is still armed (nothing bounded
    // its lifetime).
    await page.goBack()
    await expect(page).toHaveURL(/\/admin\/users\/?(\?.*)?$/)

    // Open a column search, type, and click elsewhere to dismiss it - the
    // ordinary "commit on blur" flow this whole PR exists to support. Before
    // the fix, `closePanel()` wrongly reads the stale flag from the earlier,
    // unrelated row click as "a row navigation is in flight" and silently
    // drops this pending debounce instead of flushing it - the search never
    // commits, with no error and no visual feedback.
    const nameColumn = page.getByRole('columnheader', { name: 'NAME' })
    await nameColumn.locator('summary[aria-label="Search NAME"]').click()
    await nameColumn.getByPlaceholder('regex').fill(targetName)
    await page.getByText(/^USERS \(/).click()

    await expect(page).toHaveURL(new RegExp(`searchName=${targetName}`))
  })

  test('typing a column search via keyboard only and tabbing away still commits after an earlier, unrelated mouse row click (regression test)', async ({ page, request }) => {
    await signInAsAdmin(page, request)

    // Arm the stale rowNavigationPending flag exactly like the previous test
    // does - a plain mouse row click with no search open anywhere.
    const firstClickName = `KeyboardPlainRowClick-${randomUUID().slice(0, 8)}`
    await signupTestUser(request, { name: firstClickName })

    const targetName = `KeyboardSearchAfterClick-${randomUUID().slice(0, 8)}`
    await signupTestUser(request, { name: targetName })

    await page.goto('/admin/users')

    const firstRowLink = page.getByRole('link', { name: `View ${firstClickName}` })
    await expect(firstRowLink).toBeVisible()
    await firstRowLink.click({ position: { x: 20, y: 10 } })
    await expect(page).not.toHaveURL(/\/admin\/users\/?(\?.*)?$/)

    await page.goBack()
    await expect(page).toHaveURL(/\/admin\/users\/?(\?.*)?$/)

    // From here on, drive everything purely by keyboard - no further pointer
    // interaction anywhere on the page. src/lib/adminUsersRowNavigation.ts's
    // round-4 fix (a document-level, capture-phase `pointerdown` listener
    // that clears the stale flag) only covers mouse-driven re-arming: a
    // keyboard-only user who never dispatches a `pointerdown` at all - Tab to
    // the summary, Enter to open it, type, Tab away - never clears the flag
    // left over from the earlier row click, so `closePanel()` still reads it
    // as true and silently drops the debounce instead of flushing it, with no
    // error and no visual feedback. `.focus()` here (rather than fighting the
    // page's full tab order to reach this exact column) is the standard way
    // to enter a keyboard-navigation test at a specific element - like a real
    // Tab keypress, it's a native DOM focus change that fires a real
    // `focusin` event and dispatches no pointer event at all, which is
    // precisely the property this test needs to exercise.
    const nameColumn = page.getByRole('columnheader', { name: 'NAME' })
    const summary = nameColumn.locator('summary[aria-label="Search NAME"]')
    await summary.focus()
    // Native `<details>`/`<summary>` keyboard activation - a `click`, not a
    // pointer event.
    await page.keyboard.press('Enter')

    const input = nameColumn.getByPlaceholder('regex')
    await expect(input).toBeFocused()
    await page.keyboard.type(targetName)
    await page.keyboard.press('Tab')

    await expect(page).toHaveURL(new RegExp(`searchName=${targetName}`))
  })
})
