import handler from "@tanstack/react-start/server-entry";

export default {
	fetch: handler.fetch,
	async scheduled(): Promise<void> {
		const [{ createClient }, { getWorkerEnv }, { pruneEvidenceLog }] = await Promise.all([
			import("@libsql/client/web"),
			import("@/server/cloudflare/env"),
			import("@/server/evidence-log"),
		]);
		await pruneEvidenceLog(getWorkerEnv(), { createClient });
	},
};
