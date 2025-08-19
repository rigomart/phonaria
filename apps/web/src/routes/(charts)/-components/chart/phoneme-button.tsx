import * as React from "react";
import { cn } from "@/lib/utils";

type PhonemeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const BASE =
	"group relative inline-flex h-14 w-14 items-center justify-center rounded font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const PhonemeButton = React.forwardRef<HTMLButtonElement, PhonemeButtonProps>(
	function PhonemeButton({ className, children, type = "button", ...props }, ref) {
		return (
			<button ref={ref} type={type} className={cn(BASE, className)} {...props}>
				{children}
			</button>
		);
	},
);
