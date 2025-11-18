import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const pressableVariants = cva(
	"flex text-sm rounded-lg transition-all outline-none cursor-pointer focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 select-none",
	{
		variants: {
			variant: {
				default: "bg-transparent hover:bg-accent/50 active:bg-accent/70 focus-visible:bg-accent/50",
				outline:
					"border border-border bg-transparent hover:bg-accent/50 active:bg-accent/70 focus-visible:bg-accent/50",
				muted: "bg-muted/50 hover:bg-muted active:bg-muted/80 focus-visible:bg-muted",
				ghost: "hover:bg-accent/50 active:bg-accent/70 focus-visible:bg-accent/50",
			},
			size: {
				default: "p-2 gap-2",
				sm: "p-1 gap-1",
				lg: "p-3 gap-3",
				fit: "p-0 gap-0",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Pressable({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof pressableVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "button";
	return (
		<Comp
			data-slot="pressable"
			data-variant={variant}
			data-size={size}
			className={cn(pressableVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Pressable, pressableVariants };
