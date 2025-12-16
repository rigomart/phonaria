"use client";

import { Button } from "@phonaria/ui/components/button";
import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPanel,
	DialogPopup,
	DialogTitle,
} from "@phonaria/ui/components/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
import { ArrowUpRight, ExternalLink, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useDictionary } from "../_hooks/use-dictionary";
import { useDictionaryStore } from "../_store/dictionary-store";
import {
	WordDefinitionDetailsContent,
	WordDefinitionDetailsContentLoading,
	WordDefinitionDetailsContentNotFound,
	WordDefinitionDetailsHeader,
} from "./word-definition-details";

export function WordDefinitionDialog() {
	const { selectedWord, setSelectedWord } = useDictionaryStore();
	const open = !!selectedWord;
	const t = useTranslations("g2p-page.dictionary-dialog");

	const { data, isLoading, error } = useDictionary(selectedWord);
	const normalizedWord = selectedWord?.trim() ?? "";
	const encodedWord = normalizedWord ? encodeURIComponent(normalizedWord.toLowerCase()) : "";
	const dictionaryFallbackLinks = encodedWord
		? [
				{
					label: "Oxford",
					href: `https://www.oxfordlearnersdictionaries.com/search/english/direct/?q=${encodedWord}`,
				},
				{
					label: "Cambridge",
					href: `https://dictionary.cambridge.org/dictionary/english/${encodedWord}`,
				},
			]
		: [];

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (!o) setSelectedWord(null);
			}}
		>
			<DialogPopup>
				<DialogHeader>
					<DialogTitle className="sr-only">{`Definition`}</DialogTitle>
					<DialogDescription className="sr-only">{`Definition for ${selectedWord}`}</DialogDescription>

					<div className="flex items-end gap-2">
						<WordDefinitionDetailsHeader word={selectedWord ?? ""} audioUrl={data?.audioUrl} />
						<Popover>
							<PopoverTrigger
								render={
									<Button variant="ghost" size="icon" aria-label={t("source-info.button-aria")} />
								}
							>
								<Info className="size-4" />
							</PopoverTrigger>
							<PopoverContent className="max-w-xs">
								<p className="text-xs text-muted-foreground leading-relaxed">
									{t("source-info.text")}
								</p>
								<Button
									variant="link"
									size="xs"
									className="mt-2"
									render={
										<Link href="/credits" target="_blank" className="underline underline-offset-4">
											{t("source-info.link")}
											<ArrowUpRight className="size-4" aria-hidden="true" />
										</Link>
									}
								/>
							</PopoverContent>
						</Popover>
					</div>
				</DialogHeader>
				<DialogPanel>
					{data && <WordDefinitionDetailsContent wordDefinition={data} />}
					{isLoading && <WordDefinitionDetailsContentLoading />}
					{error && <WordDefinitionDetailsContentNotFound />}
				</DialogPanel>
				{dictionaryFallbackLinks.length > 0 && (
					<DialogFooter className="items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-xs text-muted-foreground">You can also check this word in:</p>
						<div className="flex flex-wrap gap-1">
							{dictionaryFallbackLinks.map((link) => (
								<Button
									key={link.label}
									variant="ghost"
									size="xs"
									render={
										<Link href={link.href} target="_blank" rel="noreferrer noopener">
											{link.label}
											<ExternalLink className="size-4" aria-hidden="true" />
										</Link>
									}
								/>
							))}
						</div>
					</DialogFooter>
				)}
			</DialogPopup>
		</Dialog>
	);
}
