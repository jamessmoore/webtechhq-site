import { test, expect } from '@playwright/test'

// robots.txt / sitemap.xml / JSON-LD rendering are viewport-independent —
// no need to repeat this across every responsive project.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'Desktop 1280', 'SEO checks only need to run on one project')
})

/**
 * Parse a served robots.txt body into { userAgent -> disallow[] }. Good
 * enough for this file's simple, one-directive-per-line format.
 */
function parseRobotsTxt(body: string): Map<string, string[]> {
  const rules = new Map<string, string[]>()
  let currentAgent: string | null = null

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim()
    const [key, ...rest] = line.split(':')
    const value = rest.join(':').trim()
    if (!key) continue

    if (key.toLowerCase() === 'user-agent') {
      currentAgent = value
      if (!rules.has(currentAgent)) rules.set(currentAgent, [])
    } else if (key.toLowerCase() === 'disallow' && currentAgent) {
      if (value) rules.get(currentAgent)!.push(value)
    }
  }

  return rules
}

function extractLlmsTxtPaths(markdown: string): string[] {
  const linkPattern = /\[[^\]]+\]\((https?:\/\/[^)]+)\)/g
  const paths: string[] = []
  let match: RegExpExecArray | null
  while ((match = linkPattern.exec(markdown)) !== null) {
    const url = new URL(match[1])
    paths.push(url.pathname || '/')
  }
  return paths
}

test.describe('robots.txt / sitemap.xml / llms.txt', () => {
  test('served robots.txt disallow list has no overlap with llms.txt links, for the named AI crawlers', async ({ request }) => {
    const [robotsResponse, llmsResponse] = await Promise.all([request.get('/robots.txt'), request.get('/llms.txt')])
    expect(robotsResponse.ok()).toBe(true)
    expect(llmsResponse.ok()).toBe(true)

    const rules = parseRobotsTxt(await robotsResponse.text())
    const linkedPaths = extractLlmsTxtPaths(await llmsResponse.text())
    expect(linkedPaths.length).toBeGreaterThan(0)

    for (const [agent, disallowed] of rules) {
      if (agent === '*') continue // scoped to the named AI crawlers, per Fix 1
      for (const linkedPath of linkedPaths) {
        const isBlocked = disallowed.some((blocked) => linkedPath === blocked || linkedPath.startsWith(`${blocked}/`))
        expect(isBlocked, `robots.txt blocks ${agent} from ${linkedPath}, which llms.txt links to`).toBe(false)
      }
    }
  })

  test('sitemap.xml is served and lists the homepage', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.ok()).toBe(true)
    const body = await response.text()
    expect(body).toContain('<urlset')
    expect(body).toContain('https://webtechhq.com')
  })
})

test.describe('JSON-LD structured data', () => {
  for (const path of ['/', '/services']) {
    test(`${path} renders valid, parseable JSON-LD`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      const scripts = await page.locator('script[type="application/ld+json"]').all()
      expect(scripts.length).toBeGreaterThan(0)

      for (const script of scripts) {
        const content = await script.textContent()
        expect(content).toBeTruthy()
        expect(() => JSON.parse(content!)).not.toThrow()
        const parsed = JSON.parse(content!)
        expect(parsed['@context']).toBe('https://schema.org')
        expect(parsed['@type']).toBeTruthy()
      }
    })
  }
})
