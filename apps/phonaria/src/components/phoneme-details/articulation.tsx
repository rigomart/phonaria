"use client";

import {
	type DiphthongVowelArticulation,
	formatPhonemeLabel,
	getIpaForPhonemeId,
	getPhonemeArticulationRegistryForLanguage,
	type LanguagePhonemeId,
	type PhonemeArticulation,
	type TargetAccent,
	type VowelArticulatoryFeatures,
} from "@phonaria/phonetics-data";
import { ToggleGroup, ToggleGroupItem } from "@phonaria/ui/components/toggle-group";
import { ChevronDown, MoveRight } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Image } from "@/components/image";
import { getPublicAssetBaseUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { type VowelPosition, VowelPositionChart } from "./vowel-position-chart";

const BUCKET_URL = getPublicAssetBaseUrl();

/** How the sound is made: a mouth diagram for consonants, a chart position for vowels. */
export function Articulation({
	targetAccent,
	phonemeId,
}: {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
}) {
	const articulation = (
		getPhonemeArticulationRegistryForLanguage(targetAccent) as Record<
			LanguagePhonemeId<TargetAccent>,
			PhonemeArticulation
		>
	)[phonemeId];
	const label = formatPhonemeLabel(targetAccent, phonemeId);

	if (articulation.category === "consonant") {
		if (articulation.features.manner === "affricate") {
			return <AffricateDiagram targetAccent={targetAccent} phonemeId={phonemeId} label={label} />;
		}
		return (
			<DiagramFrame>
				<Image
					src={`${BUCKET_URL}/diagrams/${targetAccent}/${phonemeId}.svg`}
					alt={`${label} articulation`}
					fill
					unoptimized
					className="object-cover"
				/>
			</DiagramFrame>
		);
	}

	if (articulation.vowelType === "monophthong") {
		return (
			<VowelPositionChart ipa={getIpaForPhonemeId(phonemeId)} features={articulation.features} />
		);
	}

	return <DiphthongGlide phonemeId={phonemeId} articulation={articulation} />;
}

function DiagramFrame({ children }: { children: ReactNode }) {
	return (
		<div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-diagram">
			{children}
		</div>
	);
}

// --- Affricate: a stop, then a fricative ---

type AffricatePhase = "stop" | "fricative";

const AFFRICATE_PHASES: { value: AffricatePhase; label: string }[] = [
	{ value: "stop", label: "Stop" },
	{ value: "fricative", label: "Fricative" },
];

function AffricateDiagram({
	targetAccent,
	phonemeId,
	label,
}: {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
	label: string;
}) {
	const [phase, setPhase] = useState<AffricatePhase>("stop");

	return (
		<div className="flex flex-col gap-2">
			<DiagramFrame>
				{AFFRICATE_PHASES.map(({ value, label: phaseLabel }) => (
					<Image
						key={value}
						src={`${BUCKET_URL}/diagrams/${targetAccent}/${phonemeId}_${value}.svg`}
						alt={`${label} (${phaseLabel})`}
						fill
						unoptimized
						className={cn(
							"absolute inset-0 object-cover transition-opacity duration-200 ease-out motion-reduce:transition-none",
							phase === value ? "opacity-100" : "opacity-0",
						)}
						aria-hidden={phase !== value}
					/>
				))}
			</DiagramFrame>

			<ToggleGroup
				aria-label="Affricate phase"
				className="self-start"
				spacing={0}
				value={[phase]}
				onValueChange={([next]) => {
					if (next) setPhase(next as AffricatePhase);
				}}
				variant="outline"
			>
				{AFFRICATE_PHASES.map(({ value, label: phaseLabel }) => (
					<ToggleGroupItem key={value} value={value} className="h-11 px-4">
						{phaseLabel}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}

// --- Diphthong: where the glide starts and ends ---

type GlidePosition = "start" | "target";

function DiphthongGlide({
	phonemeId,
	articulation,
}: {
	phonemeId: LanguagePhonemeId<TargetAccent>;
	articulation: DiphthongVowelArticulation;
}) {
	const [expanded, setExpanded] = useState<GlidePosition | null>(null);
	const { features } = articulation;
	const ipa = getIpaForPhonemeId(phonemeId);
	const positions = {
		start: {
			ipa: ipa.charAt(0),
			features: {
				height: features.height,
				backness: features.backness,
				roundness: features.roundness,
			},
		},
		target: {
			ipa: ipa.slice(-1),
			features: {
				height: features.targetHeight,
				backness: features.targetBackness,
				roundness: features.targetRoundness,
			},
		},
	} satisfies Record<GlidePosition, { ipa: string; features: VowelPosition }>;
	const toggle = (position: GlidePosition) => setExpanded(expanded === position ? null : position);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<GlidePositionButton
					ipa={positions.start.ipa}
					roundness={positions.start.features.roundness}
					active={expanded === "start"}
					onClick={() => toggle("start")}
				/>
				<MoveRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
				<GlidePositionButton
					ipa={positions.target.ipa}
					roundness={positions.target.features.roundness}
					active={expanded === "target"}
					onClick={() => toggle("target")}
				/>
			</div>
			{expanded ? (
				<VowelPositionChart ipa={positions[expanded].ipa} features={positions[expanded].features} />
			) : null}
		</div>
	);
}

function GlidePositionButton({
	ipa,
	roundness,
	active,
	onClick,
}: {
	ipa: string;
	roundness: VowelArticulatoryFeatures["roundness"];
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-expanded={active}
			onClick={onClick}
			className={cn(
				"flex min-h-11 flex-1 cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
				active
					? "border-primary bg-secondary"
					: "border-border hover:border-primary hover:bg-muted",
			)}
		>
			<span className="font-display text-xl leading-none">{ipa}</span>
			<span className="text-xs text-muted-foreground">{roundness}</span>
			<ChevronDown
				aria-hidden="true"
				className={cn(
					"ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none",
					active && "rotate-180 text-primary",
				)}
			/>
		</button>
	);
}
