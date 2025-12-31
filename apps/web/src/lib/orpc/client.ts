import "client-only";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { router } from "@/app/api/rpc/router";

const link = new RPCLink({
	url: () => {
		if (typeof window === "undefined") {
			throw new Error("RPCLink is not allowed on the server side.");
		}
		return `${window.location.origin}/api/rpc`;
	},
});

export const client: RouterClient<typeof router> = createORPCClient(link);
