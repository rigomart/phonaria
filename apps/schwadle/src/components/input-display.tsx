import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { useEffect, useRef, useState } from "react";
import { type SearchablePhoneme, searchPhonemes } from "@/lib/phoneme-search";
import { cn } from "@/lib/utils";
import { PhonemeChip } from "./phoneme-chip";

type InputDisplayProps = {
	phonemes: EnglishPhonemeSymbolId[];
	onRemove: (index: number) => void;
	onAdd: (phonemeId: EnglishPhonemeSymbolId) => void;
	onRemoveLast: () => void;
};

export function InputDisplay({ phonemes, onRemove, onAdd, onRemoveLast }: InputDisplayProps) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchablePhoneme[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isOpen, setIsOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (query.length > 0) {
			const matches = searchPhonemes(query);
			setResults(matches);
			setSelectedIndex(0);
			setIsOpen(matches.length > 0);
		} else {
			setResults([]);
			setIsOpen(false);
		}
	}, [query]);

	function selectPhoneme(phoneme: SearchablePhoneme) {
		onAdd(phoneme.id);
		setQuery("");
		setIsOpen(false);
		inputRef.current?.focus();
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (isOpen && results.length > 0) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((prev) => Math.max(prev - 1, 0));
			} else if (e.key === "Enter") {
				e.preventDefault();
				selectPhoneme(results[selectedIndex]);
			} else if (e.key === "Escape") {
				e.preventDefault();
				setQuery("");
				setIsOpen(false);
			}
		} else if (e.key === "Backspace" && query === "") {
			onRemoveLast();
		}
	}

	function handleContainerClick() {
		inputRef.current?.focus();
	}

	return (
		<div ref={containerRef} className="relative">
			{/* biome-ignore lint/a11y/noStaticElementInteractions: click delegates focus to the inner input */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard is handled by the inner input */}
			<div
				onClick={handleContainerClick}
				className={cn(
					"flex min-h-14 cursor-text flex-wrap items-center gap-1.5 rounded-xl border-2 px-3 py-2.5 transition-colors",
					phonemes.length > 0 || query
						? "border-primary/20 bg-primary/5"
						: "border-dashed border-muted-foreground/20",
				)}
			>
				{phonemes.map((phonemeId, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: phoneme list has duplicate IDs, index is the only stable key
					<span key={`${phonemeId}-${index}`} className="animate-pop-in">
						<PhonemeChip phonemeId={phonemeId} onClick={() => onRemove(index)} />
					</span>
				))}
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={() => {
						// Delay to allow click on dropdown items
						setTimeout(() => setIsOpen(false), 150);
					}}
					onFocus={() => {
						if (query.length > 0 && results.length > 0) setIsOpen(true);
					}}
					placeholder={phonemes.length === 0 ? "Type to search or tap below" : ""}
					className="min-w-20 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
					autoComplete="off"
					spellCheck={false}
				/>
				{phonemes.length > 0 && query === "" && (
					<span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse rounded-full bg-primary/50" />
				)}
			</div>

			{/* Dropdown */}
			{isOpen && results.length > 0 && (
				<div className="absolute z-50 mt-1 w-full animate-fade-in rounded-xl border bg-popover p-1 shadow-lg">
					<div className="max-h-48 overflow-y-auto">
						{results.slice(0, 8).map((phoneme, index) => (
							<button
								key={phoneme.id}
								type="button"
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => selectPhoneme(phoneme)}
								className={cn(
									"flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
									index === selectedIndex ? "bg-muted" : "hover:bg-muted/50",
								)}
							>
								<span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-card font-semibold">
									{phoneme.ipa}
								</span>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium">{phoneme.label}</p>
									{phoneme.commonNames.length > 0 && (
										<p className="truncate text-xs text-muted-foreground">
											{phoneme.commonNames.join(", ")}
										</p>
									)}
								</div>
								<span className="shrink-0 text-xs tabular-nums text-muted-foreground">
									{phoneme.arpabet}
								</span>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
