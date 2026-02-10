import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ?? "3000";
const BASE_URL = `http://localhost:${PORT}`;
const IS_CI = !!process.env.CI;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: IS_CI,
	retries: IS_CI ? 2 : 0,
	workers: IS_CI ? 1 : undefined,
	reporter: IS_CI ? "github" : "html",
	timeout: 30_000,
	expect: { timeout: 10_000 },

	use: {
		baseURL: BASE_URL,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	webServer: {
		command: IS_CI ? "bun run start" : "bun run dev",
		url: BASE_URL,
		reuseExistingServer: !IS_CI,
		timeout: 120_000,
		env: {
			SKIP_RATE_LIMIT: "true",
		},
	},
});
