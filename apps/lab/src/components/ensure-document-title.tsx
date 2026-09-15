"use client";

import { useRouterState } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { extractDocumentTitle } from "@/lib/document-head";

/**
 * HeadContent can drop the SSR `<title>` during hydration when route `head()`
 * cannot read Worker env. Re-apply the resolved title after paint so axe still
 * sees a non-empty document title on Credits, IPA charts, and not-found.
 */
export function EnsureDocumentTitle() {
	const title = useRouterState({
		select: (state) => extractDocumentTitle(state.matches),
	});

	useLayoutEffect(() => {
		document.title = title;
	}, [title]);

	return null;
}
