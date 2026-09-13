/**
 * TanStack Start Vite config for the Cloudflare target.
 * Named `.mts` so Vite 8 can load the ESM-only Start plugin from a
 * CommonJS package. Plugin order is Cloudflare, tanstackStart(), React.
 */
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 3001,
	},
	preview: {
		port: 3001,
	},
	resolve: {
		tsconfigPaths: true,
		alias: {
			"@": new URL("./src", import.meta.url).pathname,
		},
	},
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tanstackStart({
			srcDirectory: "src",
			prerender: {
				enabled: true,
				crawlLinks: true,
				filter: ({ path }) => path === "/credits",
			},
		}),
		viteReact(),
	],
});
