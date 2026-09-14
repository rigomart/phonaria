import { createRouter } from "@tanstack/react-router";
import { NotFoundContent } from "@/components/not-found-content";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultNotFoundComponent: NotFoundContent,
	});
	return router;
}
