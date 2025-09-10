"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PhonemeSearchProps {
	searchTerm: string;
	onSearchChange: (term: string) => void;
	placeholder?: string;
	resultCount?: number;
	className?: string;
}

/**
 * Enhanced search component for phonemes with clear functionality and result count.
 * Features search icon, clear button, and responsive design.
 */
export function PhonemeSearch({
	searchTerm,
	onSearchChange,
	placeholder = "Search by sound, word, or description...",
	resultCount,
	className,
}: PhonemeSearchProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleClear = () => {
		onSearchChange("");
		inputRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			handleClear();
		}
	};

	return (
		<div className={cn("flex flex-col items-center space-y-2", className)}>
			<div className="relative w-full max-w-md">
				<SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					ref={inputRef}
					className="pl-10 pr-10"
					placeholder={placeholder}
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
				{searchTerm && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
						aria-label="Clear search"
					>
						<XIcon className="h-4 w-4" />
					</button>
				)}
			</div>

			{searchTerm && (
				<div className="text-sm text-muted-foreground">
					{resultCount !== undefined
						? resultCount === 0
							? `No results for "${searchTerm}"`
							: `${resultCount} result${resultCount === 1 ? "" : "s"} for "${searchTerm}"`
						: `Searching for "${searchTerm}"...`}
				</div>
			)}
		</div>
	);
}

/**
 * Compact search variant for smaller spaces
 */
export function PhonemeSearchCompact({
	searchTerm,
	onSearchChange,
	placeholder = "Search phonemes...",
	className,
}: Omit<PhonemeSearchProps, "resultCount">) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleClear = () => {
		onSearchChange("");
		inputRef.current?.focus();
	};

	return (
		<div className={cn("relative", className)}>
			<SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
			<Input
				ref={inputRef}
				className="pl-8 pr-8 text-sm h-8"
				placeholder={placeholder}
				value={searchTerm}
				onChange={(e) => onSearchChange(e.target.value)}
			/>
			{searchTerm && (
				<button
					type="button"
					onClick={handleClear}
					className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
					aria-label="Clear search"
				>
					<XIcon className="h-3.5 w-3.5" />
				</button>
			)}
		</div>
	);
}
