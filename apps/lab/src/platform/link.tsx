"use client";

import { type ComponentProps, createContext, forwardRef, type ReactNode, useContext } from "react";

/**
 * Portable in-app link contract. The route root provides the TanStack
 * implementation; shell components consume this module instead of the
 * router's Link directly.
 */
export type AppLinkProps = Omit<ComponentProps<"a">, "href"> & {
	href: string;
};

export type AppLinkComponent = typeof Link;

const LinkContext = createContext<AppLinkComponent | null>(null);

export function LinkProvider({
	Link: Implementation,
	children,
}: {
	Link: AppLinkComponent;
	children: ReactNode;
}) {
	return <LinkContext.Provider value={Implementation}>{children}</LinkContext.Provider>;
}

export const Link = forwardRef<HTMLAnchorElement, AppLinkProps>(function Link(
	{ href, ...props },
	ref,
) {
	const Implementation = useContext(LinkContext);
	if (Implementation && Implementation !== Link) {
		return <Implementation ref={ref} href={href} {...props} />;
	}
	return <a ref={ref} href={href} {...props} />;
});
