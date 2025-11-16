import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

// Define frontend and backend ports
const FRONTEND_PORT = 5173; // Vite default
const BACKEND_PORT = 3001;  // Your backend API

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : '50%',

  reporter: [
    // ---
    // THE FIX: Changed this path to match your .yml file
    // ---
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
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

  webServer: [
    {
      // This is the backend, using 'npm start' is correct
      command: `npm start --prefix ../backend`,
      url: `http://localhost:${BACKEND_PORT}`,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    {
      // ---
      // THE FIX: Use the stable 'preview' server, not 'dev'
      // This requires the 'Build Frontend' step in the .yml file
      // ---
      command: `npm run preview --prefix ../Frontend -- --port ${FRONTEND_PORT}`,
      url: `http://localhost:${FRONTEND_PORT}`,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    }
  ],
});