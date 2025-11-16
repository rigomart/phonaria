import { Badge } from "@/components/ui/badge";
import { getScopedI18n } from "@/locales/server";

export async function PhonemeInspectorPreview() {
	const t = await getScopedI18n("overview-page.core-modules-section.feature-cards.inspector.preview");
	const articulationNotes = [t("articulation.first"), t("articulation.second")];
	const patterns = [t("patterns.first"), t("patterns.second"), t("patterns.third")];

	return (
		<div className="space-y-3">
			<div className="rounded-xl border border-border/70 bg-background/70 p-3 shadow-xs">
				<div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
					<span>{t("selected-label")}</span>
					<span>{t("keywords-label")}</span>
				</div>
				<div className="mt-3 flex items-baseline justify-between">
					<span className="text-3xl font-semibold text-primary">/ɝ/</span>
					<span className="text-xs font-medium text-muted-foreground">{t("keywords-example")}</span>
				</div>
			</div>
			<div className="rounded-xl border border-border/70 bg-background/70 p-3 shadow-xs">
				<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
					{t("articulation-label")}
				</p>
				<ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
					{articulationNotes.map((note) => (
						<li key={note}>{note}</li>
					))}
				</ul>
			</div>
			<div className="rounded-xl border border-border/70 bg-background/70 p-3 shadow-xs">
				<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
					{t("patterns-label")}
				</p>
				<div className="mt-2 flex flex-wrap gap-1.5">
					{patterns.map((pattern) => (
						<Badge key={pattern} variant="outline" className="rounded-full px-2 py-1 text-xs">
							{pattern}
						</Badge>
					))}
				</div>
				<p className="mt-3 text-[10px] font-medium text-primary">{t("note")}</p>
			</div>
		</div>
	);
}
