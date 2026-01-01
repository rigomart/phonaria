"use client";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@phonaria/ui/components/input-group";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { usePhonemeDetailsCopy } from "@/data/phoneme-details/client";
import { cn } from "@/lib/utils";
import { ALL_PHONEMES, type KeyboardPhoneme } from "../_lib/keyboard-layout";

interface PhonemeSearchInputProps {
	onSelectPhoneme: (phoneme: KeyboardPhoneme) => void;
}

export function PhonemeSearchInput({ onSelectPhoneme }: PhonemeSearchInputProps) {
	const t = useTranslations("find-by-sound-page.search");
	const { phonemeDetailsById } = usePhonemeDetailsCopy();
	const [query, setQuery] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const filteredPhonemes = useMemo(() => {
		if (!query.trim()) return [];

		const q = query.toLowerCase().trim();
		return ALL_PHONEMES.filter((phoneme) => {
			const label = phonemeDetailsById[phoneme.id]?.label ?? "";
			return (
				phoneme.ipa.toLowerCase().includes(q) ||
				phoneme.arpabet.toLowerCase().includes(q) ||
				label.toLowerCase().includes(q)
			);
		}).slice(0, 8);
	}, [query, phonemeDetailsById]);

	const handleSelect = (phoneme: KeyboardPhoneme) => {
		onSelectPhoneme(phoneme);
		setQuery("");
		setShowSuggestions(false);
		inputRef.current?.focus();
	};

	const hasSuggestions = showSuggestions && filteredPhonemes.length > 0;

	return (
		<div className="relative">
			<div className="relative">
				<InputGroup>
					<InputGroupAddon>
						<Search className="size-4 text-muted-foreground pointer-events-none" />
					</InputGroupAddon>
					<InputGroupInput
						ref={inputRef}
						type="search"
						value={query}
						size="lg"
						onChange={(e) => {
							setQuery(e.target.value);
							setShowSuggestions(true);
						}}
						onFocus={() => setShowSuggestions(true)}
						onBlur={() => {
							// Delay to allow click on suggestion
							setTimeout(() => setShowSuggestions(false), 150);
						}}
						placeholder={t("placeholder")}
						aria-label={t("aria-label")}
					/>
				</InputGroup>
			</div>

			{hasSuggestions && (
				<div
					className={cn(
						"absolute z-50 w-full mt-1 rounded-lg border bg-background shadow-lg",
						"max-h-64 overflow-y-auto",
					)}
				>
					<div className="p-1">
						{filteredPhonemes.map((phoneme) => {
							const label = phonemeDetailsById[phoneme.id]?.label ?? phoneme.id;
							return (
								<button
									key={phoneme.id}
									type="button"
									onClick={() => handleSelect(phoneme)}
									className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
								>
									<span className="font-medium min-w-6">/{phoneme.ipa}/</span>
									<span className="text-muted-foreground truncate">{label}</span>
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
