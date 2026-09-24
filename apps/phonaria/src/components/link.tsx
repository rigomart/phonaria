"use client";

import { Link as RouterLink } from "@tanstack/react-router";
import { type ComponentProps, forwardRef } from "react";

/**
 * In-app link. Wraps the router's `Link` so shell components pass a plain
 * `href` string instead of the router's typed `to`.
 */
export type AppLinkProps = Omit<ComponentProps<"a">, "href"> & {
	href: string;
};

export const Link = forwardRef<HTMLAnchorElement, AppLinkProps>(function Link(
	{ href, ...props },
	ref,
) {
	return <RouterLink ref={ref} to={href} {...props} />;
});
