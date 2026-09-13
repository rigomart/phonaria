/**
 * TanStack Router adapter for in-app navigation.
 */
"use client";

import { Link as RouterLink } from "@tanstack/react-router";
import { forwardRef } from "react";
import type { AppLinkProps } from "../link";

export const Link = forwardRef<HTMLAnchorElement, AppLinkProps>(function Link(
	{ href, ...props },
	ref,
) {
	return <RouterLink ref={ref} to={href} {...props} />;
});
