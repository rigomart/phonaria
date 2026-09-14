import { describe, expect, it } from "vitest";
import { IPA_CHART_CONSONANTS_PATH } from "@/lib/ipa-chart-metadata";
import { redirect } from "./navigation";

describe("TanStack redirect adapter", () => {
	it("throws a temporary 307 to the given path", () => {
		expect.assertions(3);
		try {
			redirect(IPA_CHART_CONSONANTS_PATH);
		} catch (error) {
			expect(error).toBeInstanceOf(Response);
			const response = error as Response;
			expect(response.status).toBe(307);
			expect(response.headers.get("Location")).toBe(IPA_CHART_CONSONANTS_PATH);
		}
	});
});
