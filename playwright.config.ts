import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    // Mobile phones
    { name: 'iPhone SE', use: { ...devices['iPhone SE'] } },
    { name: 'iPhone 14', use: { ...devices['iPhone 14'] } },
    { name: 'Pixel 7', use: { ...devices['Pixel 7'] } },
    { name: 'Galaxy S8', use: { ...devices['Galaxy S8'] } },

    // Tablets — straddle the sm: (640px) nav breakpoint
    { name: 'iPad Mini', use: { ...devices['iPad Mini'] } },
    { name: 'iPad Pro 11 landscape', use: { ...devices['iPad Pro 11 landscape'] } },

    // Desktop
    { name: 'Desktop 1280', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'Desktop 1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'Desktop 1920', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
  ],
})
