import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Disclaimer } from "./disclaimer";

describe("Disclaimer", () => {
	it("shows the note, with a More button named for its details", () => {
		const html = renderToString(
			<Disclaimer title="About these pronunciations" points={["Hidden detail."]}>
				One plain sentence.
			</Disclaimer>,
		);
		expect(html).toContain("One plain sentence.");
		expect(html).toContain('aria-label="More: About these pronunciations"');
		expect(html).toContain('aria-expanded="false"');
		expect(html).not.toContain("Hidden detail.");
	});

	it("is the title alone as a link when there is no note", () => {
		const html = renderToString(
			<Disclaimer title="About these pronunciations" points={["Hidden detail."]} />,
		);
		expect(html).toContain(">About these pronunciations</button>");
		expect(html).not.toContain("More");
		expect(html).not.toContain("Hidden detail.");
	});
});
