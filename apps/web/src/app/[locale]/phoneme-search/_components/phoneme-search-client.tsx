"use client";

import { Button } from "@phonaria/ui/components/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@phonaria/ui/components/empty";
import { Input } from "@phonaria/ui/components/input";
import { ScrollArea } from "@phonaria/ui/components/scroll-area";
import { Separator } from "@phonaria/ui/components/separator";
import { Spinner } from "@phonaria/ui/components/spinner";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PHONEME_OPTIONS } from "../_lib/phoneme-options";
import { fetchPhonemeSearch } from "../_lib/phoneme-search-client";

const MAX_PATH_LENGTH = 20;
const DEFAULT_LIMIT = 80;

function formatIpa(ipaOrFallback: string) {
	if (ipaOrFallback.startsWith("/")) return ipaOrFallback;
	return `/${ipaOrFallback}/`;
}

const IPA_BY_ARPABET = new Map(PHONEME_OPTIONS.map((opt) => [opt.arpabet, opt.ipa]));
const VALID_ARPABET = new Set(PHONEME_OPTIONS.map((opt) => opt.arpabet));

export function PhonemeSearchClient() {
	const t = useTranslations("phoneme-search-page");
	const [path, setPath] = useState<string[]>([]);
	const [input, setInput] = useState("");

	const canAppend = path.length < MAX_PATH_LENGTH;

	const searchQuery = useQuery({
		queryKey: ["phoneme-search", path, DEFAULT_LIMIT],
		queryFn: async () => fetchPhonemeSearch({ path, limit: DEFAULT_LIMIT }),
		enabled: path.length > 0,
		staleTime: 15_000,
	});

	const removeAt = (index: number) => {
		setPath((prev) => prev.filter((_, i) => i !== index));
	};

	const clear = () => setPath([]);

	const addFromInput = () => {
		const token = input.trim().toUpperCase();
		if (!token) return;
		if (!VALID_ARPABET.has(token)) return;
		if (!canAppend) return;
		setPath((prev) => [...prev, token]);
		setInput("");
	};

	return (
		<div className="min-h-0 rounded-xl border bg-background-soft ring-1 ring-foreground/10 flex flex-col">
			<div className="border-b px-4 py-4">
				<div className="text-base font-medium leading-snug">{t("builder.title")}</div>
			</div>

			<div className="min-h-0 flex flex-col gap-4 px-4 py-4">
				<div className="flex flex-wrap items-center gap-2">
					{path.length === 0 ? (
						<span className="text-sm text-muted-foreground">{t("builder.path-empty")}</span>
					) : (
						<div className="flex flex-wrap items-center gap-1.5">
							{path.map((p, index) => (
								<Button
									key={`${index}-${p}`}
									size="xs"
									variant="outline"
									className="gap-1.5"
									onClick={() => removeAt(index)}
									aria-label={t("builder.remove-phoneme-aria", { phoneme: p })}
									title={t("builder.remove-phoneme-hint")}
								>
									<span className="font-mono">{p}</span>
									<span className="text-muted-foreground font-mono">
										{formatIpa(IPA_BY_ARPABET.get(p) ?? p)}
									</span>
									<X className="size-3.5 opacity-70" aria-hidden="true" />
								</Button>
							))}
						</div>
					)}

					{path.length > 0 && (
						<Button size="xs" variant="ghost" className="ms-auto" onClick={clear}>
							{t("builder.clear")}
						</Button>
					)}
				</div>

				<div className="flex items-center gap-2">
					<div className="flex-1">
						<Input
							type="search"
							size="lg"
							list="phoneme-search-arpabet-options"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder={t("builder.search-placeholder")}
							aria-label={t("builder.search-aria")}
							disabled={!canAppend}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addFromInput();
								}
								if (e.key === "Backspace" && input.length === 0 && path.length > 0) {
									setPath((prev) => prev.slice(0, -1));
								}
							}}
						/>
						<datalist id="phoneme-search-arpabet-options">
							{PHONEME_OPTIONS.map((opt) => (
								<option
									key={opt.arpabet}
									value={opt.arpabet}
									label={`${opt.arpabet} ${formatIpa(opt.ipa)}`}
								/>
							))}
						</datalist>
					</div>
					<Button variant="outline" size="lg" onClick={addFromInput} disabled={!canAppend}>
						{t("builder.add")}
					</Button>
				</div>

				{path.length > 0 && searchQuery.data?.nextPhonemes?.length ? (
					<div className="flex flex-col gap-2">
						<div className="text-xs font-medium text-muted-foreground">
							{t("builder.next-phonemes")}
						</div>
						<div className="flex flex-wrap gap-1.5">
							{searchQuery.data.nextPhonemes.slice(0, 18).map((next) => (
								<Button
									key={next.arpabet}
									variant="outline"
									size="xs"
									className="gap-2"
									onClick={() => {
										if (!canAppend) return;
										setPath((prev) => [...prev, next.arpabet]);
									}}
									disabled={!canAppend}
								>
									<span className="font-mono">{next.arpabet}</span>
									<span className="text-muted-foreground font-mono">{formatIpa(next.ipa)}</span>
									<span className="text-muted-foreground text-xs tabular-nums">{next.count}</span>
								</Button>
							))}
						</div>
					</div>
				) : null}

				<Separator />

				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<div className="text-sm font-medium">{t("results.title")}</div>
					</div>
					{path.length > 0 && (
						<div className="text-xs text-muted-foreground tabular-nums">
							{t("results.total", { count: searchQuery.data?.totalCount ?? 0 })}
						</div>
					)}
				</div>

				{path.length === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyTitle>{t("results.empty.title")}</EmptyTitle>
							<EmptyDescription>{t("results.empty.description")}</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : searchQuery.isLoading ? (
					<div className="flex items-center justify-center py-10 text-sm text-muted-foreground gap-2">
						<Spinner className="size-4" />
						{t("results.loading")}
					</div>
				) : searchQuery.isError ? (
					<div className="rounded-xl border p-4">
						<div className="text-sm font-medium">{t("results.error.title")}</div>
						<div className="mt-1 text-sm text-muted-foreground">
							{t("results.error.description")}
						</div>
					</div>
				) : !searchQuery.data || searchQuery.data.words.length === 0 ? (
					<div className="rounded-xl border border-dashed p-6 text-center">
						<div className="text-sm font-medium">{t("results.no-matches.title")}</div>
						<div className="mt-1 text-sm text-muted-foreground">
							{t("results.no-matches.description")}
						</div>
					</div>
				) : (
					<div className="min-h-0 overflow-hidden rounded-xl border">
						<ScrollArea scrollbarGutter>
							<div className="grid gap-1 p-2">
								{searchQuery.data.words.map((word) => (
									<Button
										key={word}
										variant="ghost"
										size="sm"
										className="w-full justify-start font-medium"
										onClick={() => {
											navigator.clipboard?.writeText(word).catch(() => {});
										}}
										title={t("results.word-hint")}
									>
										{word}
									</Button>
								))}
							</div>
						</ScrollArea>
					</div>
				)}
			</div>
		</div>
	);
}
