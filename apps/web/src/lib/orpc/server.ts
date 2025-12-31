import "server-only";
import { createRouterClient, type RouterClient } from "@orpc/server";
import { headers } from "next/headers";
import { router } from "@/app/api/rpc/router";

declare global {
	// eslint-disable-next-line no-var
	var $orpcClient: RouterClient<typeof router> | undefined;
}

if (!globalThis.$orpcClient) {
	globalThis.$orpcClient = createRouterClient(router, {
		context: async () => ({
			request: new Request("http://localhost", {
				headers: await headers(),
			}),
		}),
	});
}

export const serverClient: RouterClient<typeof router> = globalThis.$orpcClient;
