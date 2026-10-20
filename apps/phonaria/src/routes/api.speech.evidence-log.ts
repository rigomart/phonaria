import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/speech/evidence-log")({
	server: {
		handlers: {
			// Every method, so a GET gets this route's 404 or 405 rather than the app shell.
			ANY: async ({ request }) => {
				const [{ createClient }, { getWorkerEnv }, { logEvidenceOnWorker }] = await Promise.all([
					import("@libsql/client/web"),
					import("@/server/cloudflare/env"),
					import("@/server/evidence-log"),
				]);
				return logEvidenceOnWorker(request, getWorkerEnv(), { createClient });
			},
		},
	},
});
