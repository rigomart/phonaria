import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Image } from "@/components/image";
import { MouthDiagram, MouthStill } from "@/components/mouth-diagram/mouth-diagram";
import { MouthParts } from "@/components/mouth-diagram/mouth-parts";
import { getMouthSound, MOUTH_SOUNDS } from "@/components/mouth-diagram/sounds";
import { ArticulationThumbnail } from "@/components/phoneme-details/articulation-thumbnail";
import { notFound } from "@/lib/navigation";
import { getPublicAssetBaseUrl } from "@/lib/site";

/** Prototype: every animated mouth diagram next to the drawing it would replace. Development only. */
export const Route = createFileRoute("/prototype/mouth")({
	beforeLoad: () => {
		if (!import.meta.env.DEV) notFound();
	},
	component: MouthPrototype,
});

const BUCKET_URL = getPublicAssetBaseUrl();
/** The file each sound's current drawing is stored under; the glottal stop has none. */
const CURRENT_FILE: Record<string, string> = { CH: "CH_stop", J: "J_stop" };

function MouthPrototype() {
	// `?only=T` shows one sound large, for a close look.
	const { only } = useSearch({ strict: false }) as { only?: string };
	const single = MOUTH_SOUNDS.find((sound) => sound.id === only);
	if (single) {
		return (
			<div className="mx-auto w-full max-w-xl p-4">
				<MouthDiagram sound={single} />
			</div>
		);
	}
	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-4 sm:p-6">
			<h1 className="font-display text-2xl font-semibold tracking-tight">
				Animated mouth diagrams
			</h1>
			<InPlace />
			<h2 className="font-display text-xl font-semibold tracking-tight">Every sound</h2>
			<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{MOUTH_SOUNDS.map((sound) => (
					<section key={sound.id} className="flex flex-col gap-3 rounded-3xl bg-popover p-5">
						<div className="flex items-end justify-between gap-3">
							<h2 className="font-display text-xl font-semibold">
								/{sound.ipa}/{" "}
								<span className="text-sm text-muted-foreground">as in {sound.example}</span>
							</h2>
							{BUCKET_URL && sound.id !== "GLOTTAL" ? (
								<div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-diagram">
									<Image
										src={`${BUCKET_URL}/diagrams/en-us/${CURRENT_FILE[sound.id] ?? sound.id}.svg`}
										alt="Current drawing"
										fill
										className="object-cover"
									/>
								</div>
							) : null}
						</div>
						<MouthDiagram sound={sound} />
					</section>
				))}
			</div>
			<section className="flex flex-col gap-4">
				<h2 className="font-display text-xl font-semibold tracking-tight">The parts</h2>
				<p className="max-w-3xl text-sm text-muted-foreground">
					Every diagram above is the same set of shapes, painted in this order. Nothing is outlined,
					so shapes that overlap join without a seam. The faint drawing behind each one is the whole
					mouth as drawn, for position.
				</p>
				<MouthParts />
			</section>
		</div>
	);
}

/** The diagram at the sizes and in the surroundings it would ship in. */
function InPlace() {
	const moving = getMouthSound("T");
	const held = getMouthSound("Z");
	if (!moving || !held) return null;
	return (
		<section className="flex flex-col gap-4">
			<h2 className="font-display text-xl font-semibold tracking-tight">Where it would go</h2>
			<div className="flex flex-wrap items-start gap-8">
				{[moving, held].map((sound) => (
					<div key={sound.id} className="flex w-96 max-w-full flex-col gap-2">
						<p className="text-sm text-muted-foreground">
							Sound page and details panel, /{sound.ipa}/:{" "}
							{sound.steps.length > 1 ? "a sound that moves" : "a sound that is held"}
						</p>
						{/* The same card and heading the sound page puts round its drawing. */}
						<div className="flex flex-col gap-3 rounded-3xl bg-popover p-5">
							<h3 className="text-sm font-semibold text-foreground">How it's made</h3>
							<MouthDiagram sound={sound} />
						</div>
					</div>
				))}
				<div className="flex flex-col gap-2">
					<p className="text-sm text-muted-foreground">
						Sound card on the chart: a still, no controls
					</p>
					<div className="flex items-start gap-4 rounded-3xl bg-popover p-5">
						<div className="flex w-36 flex-col gap-2">
							<MouthStill sound={moving} />
							<span className="text-xs text-muted-foreground">New</span>
						</div>
						<div className="flex w-36 flex-col gap-2">
							<ArticulationThumbnail targetAccent="en-us" phonemeId="T" />
							<span className="text-xs text-muted-foreground">Current</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
