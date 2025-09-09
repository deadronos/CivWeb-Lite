import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  testDir: 'playwright/tests',
});
