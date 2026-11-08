import { createRouter } from "@tanstack/react-router";
import { ErrorContent } from "@/components/error-content";
import { NotFoundContent } from "@/components/not-found-content";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultNotFoundComponent: NotFoundContent,
		defaultErrorComponent: ErrorContent,
	});
	return router;
}
