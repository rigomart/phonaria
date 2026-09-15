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
	it("keeps the neutral barrel free of framework adapters", () => {
		const barrel = src("./index.ts");
		expect(barrel).not.toContain('from "next/');
		expect(barrel).not.toContain('from "next-themes"');
		expect(barrel).not.toContain('from "./tanstack/');
	});

	it("keeps shared navigation and images framework-neutral", () => {
		const shellFiles = [
			"../components/header.tsx",
			"../components/footer.tsx",
			"../components/phoneme-popover-content.tsx",
			"../components/not-found-content.tsx",
			"../components/ipa-chart/consonant-chart.tsx",
			"../components/ipa-chart/vowel-chart.tsx",
			"../practice/_components/topic-card.tsx",
			"../components/transcription/display/info-button.tsx",
		];

		for (const file of shellFiles) {
			const contents = src(file);
			expect(contents, file).not.toContain('from "next/link"');
			expect(contents, file).not.toContain('from "next/image"');
		}
	});

	it("keeps theme setup and flag gates on the TanStack adapter", () => {
		expect(src("../components/theme-switcher.tsx")).toContain('from "@/platform/theme"');
		expect(src("../components/theme-switcher.tsx")).not.toContain("next-themes");
		expect(src("../lib/flags.ts")).not.toContain("next/navigation");
		expect(src("../routes/practice.tsx")).toContain("requireFlag");
		expect(src("../routes/practice.tsx")).toContain('from "@/platform/tanstack"');
	});

	it("keeps Start route head helpers on the tanstack barrel", () => {
		expect(src("../routes/__root.tsx")).toContain('from "@/platform/tanstack"');
		expect(src("../routes/__root.tsx")).not.toContain("@/lib/start-document-head");
		expect(src("../routes/credits.tsx")).toContain('from "@/platform/tanstack"');
		expect(src("../routes/credits.tsx")).not.toContain("@/lib/start-document-head");
		expect(src("../routes/index.tsx")).toContain('from "@/platform/tanstack"');
		expect(src("../routes/index.tsx")).not.toContain("@/lib/start-document-head");
		expect(src("../routes/index.tsx")).not.toContain("transcribeWordsAction");
		expect(src("../routes/ipa-chart/consonants.tsx")).toContain('from "@/platform/tanstack"');
		expect(src("../routes/ipa-chart/vowels.tsx")).toContain('from "@/platform/tanstack"');
		expect(src("../routes/ipa-chart/index.tsx")).toContain('from "@/platform/tanstack"');
		expect(src("../routes/ipa-chart/$.tsx")).toContain('from "@/platform/tanstack"');
		expect(src("../routes/practice.tsx")).toContain('from "@/platform/tanstack"');
		expect(src("../routes/practice.index.tsx")).toContain('from "@/platform/tanstack"');
		expect(src("../routes/practice.$topic.tsx")).toContain('from "@/platform/tanstack"');
		expect(src("./tanstack/document-title.tsx")).not.toContain("@/lib/start-document-head");
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
