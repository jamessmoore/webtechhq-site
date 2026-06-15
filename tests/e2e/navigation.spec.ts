import { test, expect, type Page } from '@playwright/test'

const PAGES = [
  { path: '/', heading: 'I help businesses' },
  { path: '/services', heading: 'Senior-level execution. No hand-holding required.' },
  { path: '/portfolio', heading: 'Recent builds, open for review.' },
  { path: '/about', heading: "Hi, I'm James Moore." },
  { path: '/contact', heading: "Let's talk." },
]

const NAV_LINKS = [
  { label: 'SERVICES', path: '/services' },
  { label: 'PORTFOLIO', path: '/portfolio' },
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

  test('"LET\'S TALK" navigates to /contact', async ({ page }) => {
    await page.goto('/')
    await openMobileNavIfNeeded(page)

    const nav = page.getByRole('navigation', { name: 'Primary' })
    await nav.getByRole('link', { name: /LET'S TALK/i }).click()

    await expect(page).toHaveURL(/\/contact$/)
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
  test('"VIEW SERVICES" button navigates to /services', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /VIEW SERVICES/i }).click()
    await expect(page).toHaveURL(/\/services$/)
  })

  test('"SEE MY WORK" button navigates to /portfolio', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /SEE MY WORK/i }).click()
    await expect(page).toHaveURL(/\/portfolio$/)
  })
})

test.describe('footer', () => {
  for (const { label, path } of [
    { label: 'SERVICES', path: '/services' },
    { label: 'PORTFOLIO', path: '/portfolio' },
    { label: 'ABOUT', path: '/about' },
    { label: 'CONTACT', path: '/contact' },
  ]) {
    test(`footer link "${label}" navigates to ${path}`, async ({ page }) => {
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
    await page.goto('/about')
    await page.getByRole('link', { name: 'Services page' }).click()
    await expect(page).toHaveURL(/\/services$/)
  })

  test('"let\'s talk" link navigates to /contact', async ({ page }) => {
    await page.goto('/about')
    await page.locator('main').getByRole('link', { name: "let's talk" }).click()
    await expect(page).toHaveURL(/\/contact$/)
  })
})
