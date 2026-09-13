/**
 * Next.js adapter for in-app navigation.
 */
"use client";

import NextLink from "next/link";
import { forwardRef } from "react";
import type { AppLinkProps } from "../link";

export const Link = forwardRef<HTMLAnchorElement, AppLinkProps>(function Link(
	{ href, ...props },
	ref,
) {
	return <NextLink ref={ref} href={href} {...props} />;
});
