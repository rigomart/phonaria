"use client";

import type { TargetAccent } from "@phonaria/phonetics-data";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { useTargetAccentStore } from "@/store/target-accent-store";

interface ToolAccentLinkProps {
	href: string;
	accent: TargetAccent;
	children: ReactNode;
	className?: string;
}

export function ToolAccentLink({ href, accent, children, className }: ToolAccentLinkProps) {
	const setTargetAccent = useTargetAccentStore((s) => s.setTargetAccent);

	return (
		<Link href={href} onClick={() => setTargetAccent(accent)} className={className}>
			{children}
		</Link>
	);
}
