"use client";

import { cva } from "class-variance-authority";
import { Loader2, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useG2PStore } from "../_store/g2p-store";

interface G2PInputFormProps {
	disabled?: boolean;
	placeholder?: string;
	maxLength?: number;
	className?: string;
}

/**
 * Enhanced G2P Input Form with Character Limit Visualization
 */
export function G2PInputForm({
	disabled = false,
	placeholder = "Enter text to see phonemic transcription...",
	maxLength = 200,
	className,
}: G2PInputFormProps) {
	const [inputText, setInputText] = useState("");
	const { transcribe, isLoading } = useG2PStore();

	const isDisabled = disabled || isLoading;
	const hasText = inputText.trim().length > 0;
	const characterCount = inputText.length;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (hasText && !isDisabled) {
			transcribe(inputText.trim());
		}
	};

	return (
		<div className={className}>
			{/* Compact Input Section */}
			<form onSubmit={handleSubmit} className="space-y-3">
				<div className="flex gap-3">
					<Input
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						placeholder={placeholder}
						disabled={isDisabled}
						className="flex-1"
						maxLength={maxLength}
						aria-label="Text to transcribe"
					/>
					<Button
						type="submit"
						disabled={!hasText || isDisabled}
						className="px-4 py-3"
						size="default"
					>
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<SendHorizonal className="h-4 w-4" />
						)}
					</Button>
				</div>

				{/* Character Limit Visualization */}
				<CharacterProgress current={characterCount} max={maxLength} />
			</form>
		</div>
	);
}

const progressVariants = cva("h-full transition-all duration-300", {
	variants: {
		limit: {
			close: "bg-amber-500",
			far: "bg-primary",
			full: "bg-red-500",
		},
	},
	defaultVariants: {
		limit: "far",
	},
});

interface CharacterProgressProps {
	current: number;
	max: number;
	className?: string;
}

function CharacterProgress({ current, max }: CharacterProgressProps) {
	const percentage = (current / max) * 100;
	const isApproachingLimit = current > max * 0.8 && current < max;
	const isAtLimit = current >= max;

	return (
		<div className="space-y-2">
			<div className="relative w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
				<div
					className={progressVariants({
						limit: isApproachingLimit ? "close" : isAtLimit ? "full" : "far",
					})}
					style={{ width: `${Math.min(percentage, 100)}%` }}
				/>
			</div>

			<div className="flex justify-between items-center text-xs">
				<span className="text-xs">
					{current} / {max} characters
				</span>
			</div>
		</div>
	);
}
