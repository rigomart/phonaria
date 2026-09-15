import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}", "scripts/**/*.{test,spec}.ts"],
		passWithNoTests: true,
		exclude: ["**/node_modules/**", "**/dist/**"],
		setupFiles: ["./vitest.setup.ts"],
		testTimeout: 10000,
		pool: "forks",
		poolOptions: {
			forks: {
				singleFork: true,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
