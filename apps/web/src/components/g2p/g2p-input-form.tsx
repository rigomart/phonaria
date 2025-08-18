/**
 * G2P Input Form Component
 * Provides text input and submission for phonemic transcription
 */

import { Loader2, Mic2, RotateCcw, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { G2PState } from "@/types/g2p";

interface G2PInputFormProps {
	onSubmit: (text: string) => void;
	onClear: () => void;
	state: G2PState;
	disabled?: boolean;
	placeholder?: string;
	maxLength?: number;
}

/**
 * G2P Input Form Component
 */
export function G2PInputForm({
	onSubmit,
	onClear,
	state,
	disabled = false,
	placeholder = "Enter text to see its phonemic transcription...",
	maxLength = 200,
}: G2PInputFormProps) {
	const [inputText, setInputText] = useState("");

	const isLoading = state === "loading";
	const isDisabled = disabled || isLoading;
	const hasText = inputText.trim().length > 0;
	const hasResults = state === "success" || state === "error";

	const handleSubmit = () => {
		if (hasText && !isDisabled) {
			onSubmit(inputText.trim());
		}
	};

	const handleClear = () => {
		setInputText("");
		onClear();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && hasText) {
			e.preventDefault();
			handleSubmit();
		}
	};

	const remainingChars = maxLength - inputText.length;
	const isNearLimit = remainingChars < 50;

	return (
		<Card className="w-full">
			<CardHeader className="space-y-2">
				<CardTitle className="flex items-center gap-2">
					<Mic2 className="h-5 w-5 text-primary" />
					Phonemic Transcription
				</CardTitle>
				<CardDescription>
					Enter words or sentences to see their pronunciation in phonemic notation (IPA).
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Textarea
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						disabled={isDisabled}
						maxLength={maxLength}
						className="min-h-24 resize-none"
						aria-label="Text to transcribe"
					/>
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>Use Ctrl+Enter (Cmd+Enter on Mac) to submit quickly</span>
						<span className={isNearLimit ? "text-warning" : ""}>
							{remainingChars} characters remaining
						</span>
					</div>
				</div>

				<div className="flex items-center justify-between gap-2">
					<Button
						onClick={handleSubmit}
						disabled={!hasText || isDisabled}
						className="flex-1"
						size="default"
					>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Transcribing...
							</>
						) : (
							<>
								<Send className="h-4 w-4" />
								Transcribe
							</>
						)}
					</Button>

					{hasResults && (
						<Button onClick={handleClear} variant="outline" size="default" disabled={isLoading}>
							<RotateCcw className="mr-2 h-4 w-4" />
							Clear
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
