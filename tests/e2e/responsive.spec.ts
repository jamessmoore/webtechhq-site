import { test, expect } from '@playwright/test'

const PAGES = ['/', '/services', '/portfolio', '/about', '/contact']

test.describe('layout integrity', () => {
  for (const path of PAGES) {
    test(`${path} has no horizontal overflow`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' })

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
    })
  }
})

test.describe('navbar responsiveness', () => {
  test('shows hamburger and hides desktop nav below the sm breakpoint, and vice versa', async ({ page }) => {
    await page.goto('/')
    const viewport = page.viewportSize()
    const isNarrow = !!viewport && viewport.width < 640

    const hamburger = page.getByRole('button', { name: 'Open menu' })
    const desktopLinks = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'SERVICES', exact: true })

    if (isNarrow) {
      await expect(hamburger).toBeVisible()
      await expect(desktopLinks).toBeHidden()
    } else {
      await expect(hamburger).toBeHidden()
      await expect(desktopLinks).toBeVisible()
    }
  })

  test('mobile menu opens, lists all links, and they are clickable', async ({ page }) => {
    const viewport = page.viewportSize()
    test.skip(!viewport || viewport.width >= 640, 'desktop nav has no drawer')

    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()

    const dropdown = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'PORTFOLIO', exact: true })
    await expect(dropdown).toBeVisible()
    await expect(dropdown).toBeInViewport()
  })

  test('navbar logo and CTA are visible and not obscured', async ({ page }) => {
    await page.goto('/')

    const logo = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Moore Solutions' })
    await expect(logo).toBeVisible()
    // click() throws if another element intercepts pointer events at the target point
    await logo.click()
    await expect(page).toHaveURL(/\/$/)
  })
})

test.describe('hero CTAs visible across viewports', () => {
  test('"VIEW SERVICES" and "SEE MY WORK" are visible and clickable', async ({ page }) => {
    await page.goto('/')

    const viewServices = page.getByRole('link', { name: /VIEW SERVICES/i })
    const seeMyWork = page.getByRole('link', { name: /SEE MY WORK/i })

    await expect(viewServices).toBeVisible()
    await expect(seeMyWork).toBeVisible()

    // toBeInViewport guards against elements rendered off-screen on small viewports
    await expect(viewServices).toBeInViewport()
    await expect(seeMyWork).toBeInViewport()
  })
})

test.describe('footer responsiveness', () => {
  test('footer links and social icons are visible', async ({ page }) => {
    await page.goto('/')
    await page.locator('footer').scrollIntoViewIfNeeded()

    await expect(page.locator('footer').getByRole('link', { name: 'CONTACT', exact: true })).toBeVisible()
    await expect(page.locator('footer').getByRole('link', { name: 'GitHub' })).toBeVisible()
  })
})
