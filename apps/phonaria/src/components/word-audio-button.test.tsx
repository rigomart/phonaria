import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { WordAudioButton } from "./word-audio-button";

function render(word: string) {
	return renderToString(
		<AudioManagerProvider>
			<WordAudioButton targetAccent="en-us" word={word} fallback={word} />
		</AudioManagerProvider>,
	);
}

beforeEach(() => {
	vi.stubEnv("PUBLIC_BUCKET_URL", "https://assets.example");
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("WordAudioButton", () => {
	it("renders a play button for a recorded word", () => {
		const html = render("seat");
		expect(html).toContain("<button");
		expect(html).toContain('aria-label="Hear seat"');
	});

	it("renders only the fallback for a word without a recording", () => {
		const html = render("zzzz");
		expect(html).toBe("zzzz");
		expect(html).not.toContain("<button");
	});
});
