import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

// Define frontend and backend ports
const FRONTEND_PORT = 5173; // Vite default
const BACKEND_PORT = 5000;  // Backend API (Express, etc.)

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : '50%',

  reporter: [
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['line']
  ],

  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start your frontend + backend automatically
  webServer: [
    {
      command: `npm run dev --prefix ../backend`,
      url: `http://localhost:${BACKEND_PORT}`,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run dev --prefix ../Frontend -- --port ${FRONTEND_PORT}`,
      url: `http://localhost:${FRONTEND_PORT}`,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    }
  ],
});
