import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
		exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
		setupFiles: [],
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
