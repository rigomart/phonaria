import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = (relativePath: string) =>
	readFileSync(resolve(import.meta.dirname, relativePath), "utf8");

function listFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = join(directory, entry.name);
		return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
	});
}

describe("Lab platform boundary", () => {
	it("keeps the neutral barrel free of Next.js and next-themes", () => {
		const barrel = src("./index.ts");
		expect(barrel).not.toContain('from "next/');
		expect(barrel).not.toContain('from "next-themes"');
		expect(barrel).not.toContain('from "./next/');
		expect(barrel).not.toContain('from "./tanstack/');
	});

	it("keeps shell navigation and images off next/link and next/image", () => {
		const shellFiles = [
			"../components/header.tsx",
			"../components/footer.tsx",
			"../components/phoneme-popover-content.tsx",
			"../components/not-found-content.tsx",
			"../app/not-found.tsx",
			"../app/practice/_components/topic-card.tsx",
			"../app/_components/transcription-display/info-button.tsx",
		];

		for (const file of shellFiles) {
			const contents = src(file);
			expect(contents, file).not.toContain('from "next/link"');
			expect(contents, file).not.toContain('from "next/image"');
		}
	});

	it("keeps theme setup and flag gates on explicit target adapters", () => {
		expect(src("../app/providers.tsx")).toContain('from "@/platform/next"');
		expect(src("../app/providers.tsx")).not.toContain("next-themes");
		expect(src("../components/theme-switcher.tsx")).toContain('from "@/platform/theme"');
		expect(src("../components/theme-switcher.tsx")).not.toContain("next-themes");
		expect(src("../lib/flags.ts")).not.toContain("next/navigation");
		expect(src("../app/practice/layout.tsx")).toContain('from "@/platform/next"');
	});

	it("isolates remaining Next.js imports under platform/next", () => {
		expect(src("./next/link.tsx")).toContain('from "next/link"');
		expect(src("./next/navigation.ts")).toContain('from "next/navigation"');
		expect(src("./next/theme.tsx")).toContain("next-themes");
	});

	it("keeps the Start graph off next/* and next-themes", () => {
		const startRoots = [
			resolve(import.meta.dirname, "./tanstack"),
			resolve(import.meta.dirname, "../routes"),
			resolve(import.meta.dirname, "../router.tsx"),
			resolve(import.meta.dirname, "../start.ts"),
		];
		const files = startRoots.flatMap((root) => {
			try {
				return listFiles(root);
			} catch {
				return [root];
			}
		});

		for (const file of files) {
			const contents = readFileSync(file, "utf8");
			expect(contents, file).not.toContain('from "next/');
			expect(contents, file).not.toContain('from "next-themes"');
		}
	});

	it("keeps Worker bindings out of browser components", () => {
		const componentDir = resolve(import.meta.dirname, "../components");
		for (const file of listFiles(componentDir)) {
			const contents = readFileSync(file, "utf8");
			expect(contents, file).not.toContain("cloudflare:workers");
			expect(contents, file).not.toContain("@/server/cloudflare");
		}
	});
});
