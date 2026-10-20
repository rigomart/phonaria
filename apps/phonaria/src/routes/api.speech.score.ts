import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/speech/score")({
	server: {
		handlers: {
			// Every method, so a GET gets this route's 404 or 405 rather than the app shell.
			ANY: async ({ request }) => {
				const [{ getWorkerEnv }, { scoreSpeechOnWorker }] = await Promise.all([
					import("@/server/cloudflare/env"),
					import("@/server/speech-scoring"),
				]);
				return scoreSpeechOnWorker(request, getWorkerEnv());
			},
		},
	},
});
