"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const characterProgressVariants = cva("space-y-2", {
	variants: {
		size: {
			sm: "space-y-1",
			md: "space-y-2",
			lg: "space-y-3",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

interface CharacterProgressProps extends VariantProps<typeof characterProgressVariants> {
	current: number;
	max: number;
	className?: string;
}

/**
 * Character progress visualization component with limit indication
 */
export function CharacterProgress({ current, max, size, className }: CharacterProgressProps) {
	const percentage = (current / max) * 100;
	const isApproachingLimit = current > max * 0.8 && current < max;
	const isAtLimit = current >= max;

	const getProgressColor = () => {
		if (isAtLimit) return "bg-red-500";
		if (isApproachingLimit) return "bg-amber-500";
		return "bg-primary";
	};

	const getTextColor = () => {
		if (isAtLimit) return "text-red-600";
		if (isApproachingLimit) return "text-amber-600";
		return "text-muted-foreground";
	};

	return (
		<div className={cn(characterProgressVariants({ size }), className)}>
			{/* Progress bar with background showing the limit */}
			<div className="relative w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
				<div
					className={cn("h-full transition-all duration-300", getProgressColor())}
					style={{ width: `${Math.min(percentage, 100)}%` }}
				/>
			</div>

			{/* Character count and limit status */}
			<div className="flex justify-between items-center text-xs">
				<span className={cn("text-xs", getTextColor())}>
					{current} / {max} characters
				</span>
				{isApproachingLimit && <span className="text-amber-600">Approaching limit</span>}
				{isAtLimit && <span className="text-red-600">Character limit reached</span>}
			</div>
		</div>
	);
}
