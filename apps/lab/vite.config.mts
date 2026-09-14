/**
 * TanStack Start Vite config for the Cloudflare target.
 * Named `.mts` so Vite 8 can load the ESM-only Start plugin from a
 * CommonJS package. Plugin order is Cloudflare, tanstackStart(), React.
 */
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const curated10kStub = new URL("./src/lib/phoneme-lookup/curated-10k.ssr-stub.ts", import.meta.url)
	.pathname;

/** Keep the 10k pronunciation table out of the Worker graph. */
function stubCurated10kOnSsr(): Plugin {
	return {
		name: "stub-curated-10k-on-ssr",
		enforce: "pre",
		resolveId(id) {
			if (this.environment?.name !== "ssr") return undefined;
			if (
				id === "@phonaria/phonetics-data/data/en/curated-10k" ||
				id.endsWith("/data/en/curated-10k") ||
				id.endsWith("/data/en/curated-10k.ts")
			) {
				return curated10kStub;
			}
			return undefined;
		},
	};
}

/** Same host as `ASSET_BUCKET_HOST` in `src/lib/security-headers.ts`. */
const PUBLIC_ASSET_HOST = "assets.rigos.dev";

function publicBucketUrl(): string {
	return (
		process.env.PUBLIC_BUCKET_URL?.trim() ||
		process.env.NEXT_PUBLIC_BUCKET_URL?.trim() || // pragma: allowlist secret
		`https://${PUBLIC_ASSET_HOST}`
	);
}

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
	define: {
		// Chart audio/diagrams are fetched in the browser. Inline the public
		// bucket origin so client modules can read process.env.PUBLIC_BUCKET_URL.
		"process.env.PUBLIC_BUCKET_URL": JSON.stringify(publicBucketUrl()),
	},
	plugins: [
		stubCurated10kOnSsr(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tanstackStart({
			srcDirectory: "src",
			prerender: {
				enabled: true,
				crawlLinks: true,
				filter: ({ path }) =>
					path === "/credits" ||
					path === "/ipa-chart" ||
					path === "/ipa-chart/" ||
					path === "/ipa-chart/consonants" ||
					path === "/ipa-chart/vowels",
			},
		}),
		viteReact(),
	],
});
