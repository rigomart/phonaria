import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Image } from "@/components/image";
import { MouthDiagram } from "@/components/mouth-diagram/mouth-diagram";
import { MouthParts } from "@/components/mouth-diagram/mouth-parts";
import { MOUTH_SOUNDS } from "@/components/mouth-diagram/sounds";
import { notFound } from "@/lib/navigation";
import { getPublicAssetBaseUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

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
	// `?air=lines` draws the air as streaks instead of dots.
	const { only, air: airParam } = useSearch({ strict: false }) as { only?: string; air?: string };
	const air = airParam === "lines" ? "lines" : "dots";
	const single = MOUTH_SOUNDS.find((sound) => sound.id === only);
	if (single) {
		return (
			<div className="mx-auto w-full max-w-xl p-4">
				<MouthDiagram sound={single} air={air} />
			</div>
		);
	}
	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-4 sm:p-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<h1 className="font-display text-2xl font-semibold tracking-tight">
					Animated mouth diagrams
				</h1>
				<nav aria-label="Air style" className="flex items-center gap-1 text-sm">
					<span className="mr-1 text-muted-foreground">Air as</span>
					{(["dots", "lines"] as const).map((style) => (
						<a
							key={style}
							href={style === "dots" ? "?" : "?air=lines"}
							aria-current={air === style ? "page" : undefined}
							className={cn(
								"rounded-full px-3 py-1.5 font-medium",
								air === style
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							{style}
						</a>
					))}
				</nav>
			</div>
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
						<MouthDiagram sound={sound} air={air} />
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
