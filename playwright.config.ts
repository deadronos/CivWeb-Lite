import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5175',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  use: {
    baseURL: 'http://localhost:5175',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        // Launch Chromium with SwiftShader (software GL) to avoid driver/GPU issues in headless CI
        launchOptions: {
          args: [
            '--disable-gpu',
            '--enable-unsafe-swiftshader',
            '--use-gl=swiftshader',
          ],
        },
      },
    },
  ],
  testDir: 'playwright/tests',
});
