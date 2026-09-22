import { defineConfig, devices } from "@playwright/test";
import { extraHttpHeaders, loadTargetFromEnv } from "./src/target";

const IS_CI = !!process.env.CI;
const target = loadTargetFromEnv();
const extraHeaders = extraHttpHeaders(target);

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: IS_CI,
	retries: IS_CI ? 2 : 1,
	workers: IS_CI ? 2 : undefined,
	reporter: IS_CI ? [["github"], ["html", { open: "never" }]] : "html",
	timeout: 45_000,
	expect: { timeout: 15_000 },

	use: {
		baseURL: target.baseUrl,
		extraHTTPHeaders: extraHeaders,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "off",
		viewport: { width: 1280, height: 720 },
	},

	projects: [
		{
			name: target.name,
			use: { ...devices["Desktop Chrome"] },
		},
	],

	webServer: target.startLocal
		? {
				command: "bun --cwd ../../apps/phonaria start",
				url: target.baseUrl,
				reuseExistingServer: !IS_CI,
				timeout: 120_000,
			}
		: undefined,
});
