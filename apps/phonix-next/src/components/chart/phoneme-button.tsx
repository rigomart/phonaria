import * as React from "react";
import { cn } from "@/lib/utils";

type PhonemeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const PhonemeButton = React.forwardRef<HTMLButtonElement, PhonemeButtonProps>(
	function PhonemeButton({ className, children, type = "button", ...props }, ref) {
		return (
			<button
				ref={ref}
				type={type}
				className={cn(
					"group relative inline-flex hover:ring-primary/90 hover:ring hover:-translate-y-0.5 h-14 w-14 items-center justify-center rounded font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					className,
				)}
				{...props}
			>
				{children}
			</button>
		);
	},
);
