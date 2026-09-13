/**
 * Next.js adapter for in-app navigation.
 * Temporary migration boundary — TanStack Start will implement the same
 * `AppLinkProps` with its own Link.
 */
import NextLink from "next/link";
import { type ComponentProps, forwardRef } from "react";

export type AppLinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
	href: string;
};

export const Link = forwardRef<HTMLAnchorElement, AppLinkProps>(function Link(
	{ href, ...props },
	ref,
) {
	return <NextLink ref={ref} href={href} {...props} />;
});
