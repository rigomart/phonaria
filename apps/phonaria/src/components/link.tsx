import { Link as RouterLink } from "@tanstack/react-router";
import { type ComponentProps, forwardRef } from "react";

/**
 * In-app link. Wraps the router's `Link` so shell components pass a plain
 * `href` string instead of the router's typed `to`. Only a link to the current
 * page itself gets `aria-current="page"`, not links to its parent paths.
 */
export type AppLinkProps = Omit<ComponentProps<"a">, "href"> & {
	href: string;
};

export const Link = forwardRef<HTMLAnchorElement, AppLinkProps>(function Link(
	{ href, ...props },
	ref,
) {
	return <RouterLink ref={ref} to={href} activeOptions={{ exact: true }} {...props} />;
});
