import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { router } from "../router";

const handler = new RPCHandler(router, {
	interceptors: [
		onError((error) => {
			console.error("[RPC Error]", error);
		}),
	],
});

async function handleRequest(request: Request) {
	const { response } = await handler.handle(request, {
		prefix: "/api/rpc",
		context: { request },
	});
	return response ?? new Response("Not found", { status: 404 });
}

export const GET = handleRequest;
export const POST = handleRequest;
