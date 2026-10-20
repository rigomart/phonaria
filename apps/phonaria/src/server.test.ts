import { describe, expect, it, vi } from "vitest";

const stubs = vi.hoisted(() => ({
	fetch: vi.fn(),
	prune: vi.fn(async () => ({ deleted: 0 })),
	createClient: vi.fn(),
	env: { EVIDENCE_LOG_DATABASE_URL: "libsql://evidence.example" },
}));

vi.mock("@tanstack/react-start/server-entry", () => ({ default: { fetch: stubs.fetch } }));
vi.mock("@libsql/client/web", () => ({ createClient: stubs.createClient }));
vi.mock("@/server/cloudflare/env", () => ({ getWorkerEnv: () => stubs.env }));
vi.mock("@/server/evidence-log", () => ({ pruneEvidenceLog: stubs.prune }));

import entry from "./server";

describe("Worker entry", () => {
	it("answers requests with TanStack Start", () => {
		expect(entry.fetch).toBe(stubs.fetch);
	});

	it("prunes the evidence log on the Cron Trigger", async () => {
		await entry.scheduled();
		expect(stubs.prune).toHaveBeenCalledWith(stubs.env, { createClient: stubs.createClient });
	});
});
