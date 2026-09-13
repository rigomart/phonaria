import { describe, expect, it } from "vitest";
import { imageClassName } from "./image";

describe("imageClassName", () => {
	it("leaves non-fill images unchanged", () => {
		expect(imageClassName(undefined, "object-cover")).toBe("object-cover");
		expect(imageClassName(false)).toBeUndefined();
	});

	it("covers the parent box when fill is set, matching next/image fill layout", () => {
		expect(imageClassName(true, "object-cover")).toBe("absolute inset-0 size-full object-cover");
	});
});
