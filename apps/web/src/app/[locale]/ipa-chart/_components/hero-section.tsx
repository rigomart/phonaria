import { useTranslations } from "next-intl";

const PHONEME_COUNT = 44;
const VOWEL_COUNT = 12;
const CONSONANT_COUNT = 32;

export function HeroSection() {
	const t = useTranslations("IpaChart.HeroSection");

	return (
		<section className={"rounded-lg border bg-card p-6 text-center"}>
			<div className="space-y-3">
				<h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
				<p className="text-lg text-muted-foreground">{t("short")}</p>

				<p className="text-sm text-muted-foreground max-w-xl mx-auto">{t("description")}</p>

				<div className="pt-2">
					<div className={"flex items-center justify-center gap-4 text-sm text-muted-foreground"}>
						<div className="text-center">
							<div className="text-lg font-semibold text-foreground">{PHONEME_COUNT}</div>
							<div className="text-xs">{t("phonemes")}</div>
						</div>
						<div className="text-muted-foreground/50">•</div>
						<div className="text-center">
							<div className="text-lg font-semibold text-foreground">{VOWEL_COUNT}</div>
							<div className="text-xs">{t("vowels")}</div>
						</div>
						<div className="text-muted-foreground/50">•</div>
						<div className="text-center">
							<div className="text-lg font-semibold text-foreground">{CONSONANT_COUNT}</div>
							<div className="text-xs">{t("consonants")}</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
