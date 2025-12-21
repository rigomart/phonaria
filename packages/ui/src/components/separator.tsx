import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "@/lib/utils";

function Separator({ className, orientation = "horizontal", ...props }: SeparatorPrimitive.Props) {
	return (
		<SeparatorPrimitive
			className={cn(
				"shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:not-[[class^='h-']]:not-[[class*='_h-']]:self-stretch",
				className,
			)}
			data-slot="separator"
			orientation={orientation}
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
			<Separator orientation={orientation} className="h-full w-full" />
			<span className="text-xs font-semibold">{label}</span>
			<Separator orientation={orientation} className="h-full w-full" />
		</div>
	);
}

export { Separator, LabelSeparator };
