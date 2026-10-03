import { defineConfig } from '@playwright/test';
import chromium from '@sparticuz/chromium';
export default defineConfig({
  testDir: 'tests/browser',
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:5173',
    launchOptions: {
      executablePath: await chromium.executablePath(),
      args: chromium.args.filter(
        (a) =>
          ![
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--single-process',
          ].includes(a)
      ),
    },
    screenshot: 'only-on-failure',
  },
  reporter: 'list',
});
