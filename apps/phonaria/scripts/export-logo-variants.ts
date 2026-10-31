// Prototype: writes each logo direction to public/logo-variants as a
// currentColor mark and a favicon tile. Run: bun ./scripts/export-logo-variants.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LOGO_VARIANTS, logoVariantSvg } from "../src/components/logo-variants";

const outDir = join(import.meta.dir, "../public/logo-variants");
mkdirSync(outDir, { recursive: true });

for (const variant of LOGO_VARIANTS) {
	writeFileSync(
		join(outDir, `${variant.id}.svg`),
		`${logoVariantSvg(variant, { color: "currentColor" })}\n`,
	);
	writeFileSync(
		join(outDir, `${variant.id}-favicon.svg`),
		`${logoVariantSvg(variant, { color: "#eef0f3", tile: "#161a20" })}\n`,
	);
}

console.log(`Wrote ${LOGO_VARIANTS.length * 2} files to ${outDir}`);
