import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const uiSrc = path.resolve(__dirname, "../../packages/ui/src");

/**
 * Resolves `@/` imports from within `@phonaria/ui` source files
 * to the UI package's own `src/` directory, since the global `@/`
 * alias points to this app's `src/`.
 */
function uiPackageAliasPlugin(): Plugin {
	return {
		name: "ui-package-alias",
		resolveId(source, importer) {
			if (source.startsWith("@/") && importer?.includes("packages/ui/")) {
				const resolved = path.resolve(uiSrc, source.slice(2));
				// Try .ts then .tsx
				return this.resolve(resolved, importer, { skipSelf: true });
			}
		},
	};
}

export default defineConfig({
	plugins: [uiPackageAliasPlugin(), tailwindcss(), react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
