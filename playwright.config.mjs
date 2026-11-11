import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 4173);
// Set CHROME_PATH to run against a locally installed Chrome instead of Playwright's browsers.
const chromePath = process.env.CHROME_PATH;

const projects = chromePath
  ? [
      {
        name: "chrome",
        use: { ...devices["Desktop Chrome"], launchOptions: { executablePath: chromePath } },
      },
    ]
  : [
      { name: "chromium", use: { ...devices["Desktop Chrome"] } },
      { name: "firefox", use: { ...devices["Desktop Firefox"] } },
      { name: "webkit", use: { ...devices["Desktop Safari"] } },
    ];

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: `http://localhost:${port}`, trace: "retain-on-failure" },
  projects,
  webServer: {
    command: "node scripts/serve.mjs",
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(port) },
  },
});
