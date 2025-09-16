"use client";

import { useMemo, useState } from "react";
import { AudioControls } from "@/components/audio-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { phonixUtils } from "shared-data";
import { MINIMAL_PAIRS } from "../_data/minimal-pairs";
import { PhonemeContrastInfo } from "./phoneme-contrast-info";

const { toPhonemic, getExampleAudioUrl } = phonixUtils;

export function MinimalPairsPageContent() {
	const [query, setQuery] = useState("");

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return MINIMAL_PAIRS;
		return MINIMAL_PAIRS.filter((p) =>
			p.a.word.toLowerCase().includes(q) ||
			p.b.word.toLowerCase().includes(q) ||
			p.contrast.includes(q),
		);
	}, [query]);

	return (
		<div className="space-y-6">
			<div className="flex items-end justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Minimal Pairs</h1>
					<p className="text-sm text-muted-foreground">Compare and practice commonly confused sounds.</p>
				</div>
				<div className="w-64">
					<Input
						placeholder="Search words or phonemes…"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Predefined Pair Sets</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-xs text-muted-foreground mb-3">Showing {filtered.length} of {MINIMAL_PAIRS.length}</div>
					<div className="rounded-md border overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[160px]">Contrast</TableHead>
									<TableHead>Word A</TableHead>
									<TableHead>Word B</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filtered.map((pair) => (
									<TableRow key={`${pair.contrast}-${pair.a.word}-${pair.b.word}`}>
										<TableCell className="align-top">
											<div className="font-medium">{pair.contrast}</div>
											<div className="text-xs text-muted-foreground">{pair.category}</div>
											<div className="mt-2">
												<PhonemeContrastInfo contrast={pair.contrast} category={pair.category} />
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center justify-between gap-4">
												<div>
													<div className="font-medium">{pair.a.word}</div>
													<div className="text-xs text-muted-foreground">{toPhonemic(pair.a.phonemic)}</div>
												</div>
												<AudioControls src={getExampleAudioUrl(pair.a.word)} label={`Play ${pair.a.word}`} />
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center justify-between gap-4">
												<div>
													<div className="font-medium">{pair.b.word}</div>
													<div className="text-xs text-muted-foreground">{toPhonemic(pair.b.phonemic)}</div>
												</div>
												<AudioControls src={getExampleAudioUrl(pair.b.word)} label={`Play ${pair.b.word}`} />
											</div>
											{pair.note ? (
												<div className="text-xs text-muted-foreground mt-2">{pair.note}</div>
											) : null}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					<Separator className="my-4" />
					<p className="text-xs text-muted-foreground">
						Tip: Click the play buttons to compare. Use the search box to filter by word or contrast.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

