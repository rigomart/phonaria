import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = (relativePath: string) =>
	readFileSync(resolve(import.meta.dirname, relativePath), "utf8");

describe("Next.js migration boundary", () => {
	it("keeps shell navigation and images off next/link and next/image", () => {
		const shellFiles = [
			"../components/header.tsx",
			"../components/footer.tsx",
			"../components/phoneme-popover-content.tsx",
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

	it("keeps theme setup and flag gates on platform adapters", () => {
		expect(src("../app/providers.tsx")).toContain('from "@/platform/next/theme"');
		expect(src("../app/providers.tsx")).not.toContain("next-themes");
		expect(src("../components/theme-switcher.tsx")).toContain('from "@/platform/next/theme"');
		expect(src("../components/theme-switcher.tsx")).not.toContain("next-themes");
		expect(src("../lib/flags.ts")).not.toContain("next/navigation");
		expect(src("../app/practice/layout.tsx")).toContain('from "@/platform"');
	});

	it("isolates remaining Next.js imports under platform/next", () => {
		expect(src("./next/link.tsx")).toContain('from "next/link"');
		expect(src("./next/navigation.ts")).toContain('from "next/navigation"');
		expect(src("./next/theme.tsx")).toContain("next-themes");
	});
});
