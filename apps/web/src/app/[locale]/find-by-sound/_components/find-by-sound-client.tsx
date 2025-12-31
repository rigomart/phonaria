"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { orpc } from "@/lib/orpc";
import { ALL_PHONEMES, type KeyboardPhoneme } from "../_lib/keyboard-layout";
import { FindBySoundResults } from "./find-by-sound-results";
import { IpaKeyboard } from "./ipa-keyboard";
import { NextSoundsSuggestions } from "./next-sounds-suggestions";
import { PhonemeSearchInput } from "./phoneme-search-input";
import { SoundSequenceBuilder } from "./sound-sequence-builder";

const DEFAULT_LIMIT = 80;
const MAX_PATH_LENGTH = 20;

function phonemesToArpabetPath(phonemes: KeyboardPhoneme[]): string {
	return phonemes.map((p) => p.arpabet).join(",");
}

export function FindBySoundClient() {
	const t = useTranslations("find-by-sound-page");
	const [selectedPhonemes, setSelectedPhonemes] = useState<KeyboardPhoneme[]>([]);

	const canAddMore = selectedPhonemes.length < MAX_PATH_LENGTH;
	const hasSelection = selectedPhonemes.length > 0;
	const arpabetPath = phonemesToArpabetPath(selectedPhonemes);

	const searchQuery = useQuery(
		orpc.phonemeSearch.search.queryOptions({
			input: hasSelection ? { path: arpabetPath, limit: DEFAULT_LIMIT } : skipToken,
			staleTime: 15_000,
		}),
	);

	const handleSelectPhoneme = (phoneme: KeyboardPhoneme) => {
		if (!canAddMore) return;
		setSelectedPhonemes((prev) => [...prev, phoneme]);
	};

	const handleSelectArpabet = (arpabet: string) => {
		if (!canAddMore) return;
		const phoneme = ALL_PHONEMES.find((p) => p.arpabet === arpabet);
		if (phoneme) {
			setSelectedPhonemes((prev) => [...prev, phoneme]);
		}
	};

	const handleRemovePhoneme = (index: number) => {
		setSelectedPhonemes((prev) => prev.filter((_, i) => i !== index));
	};

	const handleClearAll = () => {
		setSelectedPhonemes([]);
	};

	const words = searchQuery.data?.words ?? [];
	const totalCount = searchQuery.data?.totalCount ?? 0;
	const nextPhonemes = searchQuery.data?.nextPhonemes ?? [];

	return (
		<div className="flex flex-col gap-4 max-w-3xl mx-auto">
			<header>
				<h1 className="text-xl font-semibold">{t("header.title")}</h1>
				<p className="text-sm text-muted-foreground">{t("header.description")}</p>
			</header>

			<div className="flex flex-col gap-4">
				<div className="rounded-lg border bg-background-soft">
					<div className="p-3 border-b bg-background rounded-t-lg flex flex-col gap-2">
						<SoundSequenceBuilder
							phonemes={selectedPhonemes}
							onRemove={handleRemovePhoneme}
							onClearAll={handleClearAll}
						/>
					</div>
					<div className="p-3 flex flex-col gap-2">
						<PhonemeSearchInput onSelectPhoneme={handleSelectPhoneme} />
						<IpaKeyboard onSelectPhoneme={handleSelectPhoneme} />
					</div>
				</div>

				{hasSelection && nextPhonemes.length > 0 && (
					<NextSoundsSuggestions
						suggestions={nextPhonemes}
						onSelect={handleSelectArpabet}
						disabled={!canAddMore}
					/>
				)}

				<FindBySoundResults
					words={words}
					totalCount={totalCount}
					limit={DEFAULT_LIMIT}
					isLoading={searchQuery.isLoading}
					isError={searchQuery.isError}
					hasSelection={hasSelection}
				/>
			</div>

			<div className="text-center text-sm text-muted-foreground">
				{t("source-note.prefix")}{" "}
				<Link href="/credits" className="underline underline-offset-4 hover:text-foreground">
					{t("source-note.link")}
				</Link>{" "}
				{t("source-note.suffix")}
			</div>
		</div>
	);
}
