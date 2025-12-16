import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const pressableVariants = cva(
	"flex text-sm rounded-lg transition-all outline-none cursor-pointer focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 select-none",
	{
		defaultVariants: {
			size: "default",
			variant: "default",
		},
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
	},
);

type PressableProps = useRender.ComponentProps<"button"> &
	VariantProps<typeof pressableVariants> & {
		variant?: VariantProps<typeof pressableVariants>["variant"];
		size?: VariantProps<typeof pressableVariants>["size"];
	};

function Pressable({ className, variant, size, render, ...props }: PressableProps) {
	const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] = render
		? undefined
		: "button";

	const defaultProps = {
		className: cn(pressableVariants({ variant, size, className })),
		"data-size": size,
		"data-slot": "pressable",
		"data-variant": variant,
		type: typeValue,
	};

	return useRender({
		defaultTagName: "button",
		props: mergeProps(defaultProps, props),
		render,
	});
}

export { Pressable, pressableVariants, type PressableProps };
