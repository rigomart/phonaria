import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { G2PState } from "@/types/g2p";

interface G2PInputFormProps {
	onSubmit: (text: string) => void;
	onClear: () => void;
	state: G2PState;
	disabled?: boolean;
	placeholder?: string;
	maxLength?: number;
	className?: string;
}

/**
 * Simplified G2P Input Form Component
 */
export function G2PInputForm({
	onSubmit,
	onClear,
	state,
	disabled = false,
	placeholder = "Enter text to see phonemic transcription...",
	maxLength = 200,
	className,
}: G2PInputFormProps) {
	const [inputText, setInputText] = useState("");

	const isLoading = state === "loading";
	const isDisabled = disabled || isLoading;
	const hasText = inputText.trim().length > 0;
	const hasResults = state === "success";

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (hasText && !isDisabled) {
			onSubmit(inputText.trim());
		}
	};

	const handleClear = () => {
		setInputText("");
		onClear();
	};

	return (
		<div className={className}>
			{/* Input Section */}
			<form onSubmit={handleSubmit} className="mb-8">
				<div className="flex gap-3 max-w-2xl mx-auto">
					<Input
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						placeholder={placeholder}
						disabled={isDisabled}
						className="text-lg py-6 px-4"
						maxLength={maxLength}
						aria-label="Text to transcribe"
					/>
					<Button type="submit" disabled={!hasText || isDisabled} className="px-6 py-6" size="lg">
						{isLoading ? (
							<Loader2 className="h-5 w-5 animate-spin" />
						) : (
							<Send className="h-5 w-5" />
						)}
					</Button>
				</div>
			</form>

			{/* Clear button - only show when there are results */}
			{hasResults && (
				<div className="text-center">
					<Button onClick={handleClear} variant="outline" disabled={isLoading} className="text-sm">
						Try another text
					</Button>
				</div>
			)}
		</div>
	);
}
