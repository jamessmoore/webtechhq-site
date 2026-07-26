import { test, expect, type Page } from '@playwright/test'

const PAGES = [
  { path: '/', heading: 'I handle the noise' },
  { path: '/services', heading: 'Professional execution. No hand-holding required.' },
  { path: '/portfolio', heading: 'Recent builds, open for review.' },
  { path: '/about', heading: "Hi, I'm James Moore." },
  { path: '/contact', heading: "Let's go." },
]

const NAV_LINKS = [
  { label: 'USE CASES', path: '/use-cases' },
  { label: 'SERVICES', path: '/services' },
  { label: 'ABOUT', path: '/about' },
]

/** Open the mobile nav drawer if the viewport is below the `sm` breakpoint. */
async function openMobileNavIfNeeded(page: Page) {
  const viewport = page.viewportSize()
  if (viewport && viewport.width < 640) {
    await page.getByRole('button', { name: 'Open menu' }).click()
  }
}

test.describe('page loads', () => {
  for (const { path, heading } of PAGES) {
    test(`${path} renders its heading`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
      expect(response?.status()).toBeLessThan(400)
      await expect(page.getByRole('heading', { level: 1 })).toContainText(heading)
    })
  }
})

test.describe('primary navigation', () => {
  for (const { label, path } of NAV_LINKS) {
    test(`nav link "${label}" navigates to ${path}`, async ({ page }) => {
      await page.goto('/')
      await openMobileNavIfNeeded(page)

      const nav = page.getByRole('navigation', { name: 'Primary' })
      await nav.getByRole('link', { name: label, exact: true }).click()

      await expect(page).toHaveURL(new RegExp(`${path}$`))
    })
  }

  test('"LET\'S GO" navigates to /tools when signed out', async ({ page }) => {
    await page.goto('/')
    await openMobileNavIfNeeded(page)

    const nav = page.getByRole('navigation', { name: 'Primary' })
    await nav.getByRole('link', { name: /LET'S GO/i }).click()

    // /tools is ungated (anonymous-browsable) now, so it renders directly
    await expect(page).toHaveURL(/\/tools$/)
  })

  test('logo returns home from a sub-page', async ({ page }) => {
    await page.goto('/services', { waitUntil: 'domcontentloaded' })
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Moore Solutions' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('mobile menu closes after a link is clicked', async ({ page, isMobile }) => {
    const viewport = page.viewportSize()
    test.skip(!viewport || viewport.width >= 640, 'desktop nav has no drawer to close')

    await page.goto('/')
    await openMobileNavIfNeeded(page)
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'ABOUT', exact: true }).click()

    await expect(page).toHaveURL(/\/about$/)
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
  })
})

test.describe('hero CTAs', () => {
  test('"GET STARTED" button navigates to /tools', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /GET STARTED/i }).click()
    // href is /signup, which permanently redirects to /tools
    await expect(page).toHaveURL(/\/tools$/)
  })

  test('"SEE HOW IT WORKS" button navigates to /use-cases', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /SEE HOW IT WORKS/i }).click()
    await expect(page).toHaveURL(/\/use-cases$/)
  })
})

test.describe('footer', () => {
  for (const { label, path } of [
    { label: 'USE CASES', path: '/use-cases' },
    { label: 'SERVICES', path: '/services' },
    { label: 'ABOUT', path: '/about' },
    { label: 'CONTACT', path: '/contact' },
  ]) {
    test(`footer link "${label}" navigates to ${path}`, async ({ page }) => {
      const viewport = page.viewportSize()
      test.skip(!!viewport && viewport.width < 640, 'footer nav links are hidden below the sm breakpoint')

      await page.goto('/')
      await page.locator('footer').getByRole('link', { name: label, exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`${path}$`))
    })
  }

  for (const { label, host } of [
    { label: 'Instagram', host: 'instagram.com' },
    { label: 'GitHub', host: 'github.com' },
    { label: 'LinkedIn', host: 'linkedin.com' },
    { label: 'YouTube', host: 'youtube.com' },
  ]) {
    test(`footer social link "${label}" points to ${host} and opens in a new tab`, async ({ page }) => {
      await page.goto('/')
      const link = page.locator('footer').getByRole('link', { name: label })
      await expect(link).toHaveAttribute('href', new RegExp(host))
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', /noopener/)
    })
  }
})

test.describe('contact page', () => {
  test('LinkedIn profile link is correct and external', async ({ page }) => {
    await page.goto('/contact')
    const link = page.getByRole('link', { name: /VIEW LINKEDIN PROFILE/i })
    await expect(link).toHaveAttribute('href', 'https://linkedin.com/in/thejamesmoore')
    await expect(link).toHaveAttribute('target', '_blank')
  })
})

test.describe('about page inline links', () => {
  test('"Services page" link navigates to /services', async ({ page }) => {
    // domcontentloaded, not the default `load`: these tests only need the
    // link in the DOM, not the page's priority hero image finished loading.
    // Waiting on `load` here made these two tests intermittently time out
    // at 30s specifically on DPR-3 mobile profiles (iPhone 14, Galaxy S8),
    // which request the largest srcset variant of that image and can hit a
    // slow on-demand resize on a busy CI runner. See the "page loads" tests
    // above for the same pattern already in use on this file.
    await page.goto('/about', { waitUntil: 'domcontentloaded' })
    await page.getByRole('link', { name: 'Services page' }).click()
    await expect(page).toHaveURL(/\/services$/)
  })

  test('"let\'s go" link navigates to /tools when signed out', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' })
    await page.locator('main').getByRole('link', { name: "let's go" }).click()
    // /tools is ungated (anonymous-browsable) now, so it renders directly
    await expect(page).toHaveURL(/\/tools$/)
  })
})
