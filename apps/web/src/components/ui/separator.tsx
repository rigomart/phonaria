"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Separator({
	className,
	orientation = "horizontal",
	decorative = true,
	...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
	return (
		<SeparatorPrimitive.Root
			data-slot="separator"
			decorative={decorative}
			orientation={orientation}
			className={cn(
				"bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
				className,
			)}
			{...props}
		/>
	);
}

type LabelSeparatorProps = {
	label: string;
	orientation?: "horizontal" | "vertical";
	className?: string;
};

function LabelSeparator({ label, orientation = "horizontal", className }: LabelSeparatorProps) {
	const isVertical = orientation === "vertical";

	return (
		<div
			className={cn(
				"flex items-center justify-center gap-1 overflow-hidden",
				isVertical ? "flex-col" : "flex-row",
				className,
			)}
		>
			<Separator orientation={orientation} />
			<span className="text-xs font-semibold">{label}</span>
			<Separator orientation={orientation} />
		</div>
	);
}

export { Separator, LabelSeparator };
