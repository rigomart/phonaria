import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getLanguageAlternates, getLocalePath } from "@/lib/seo";
import { G2PInputForm } from "./_components/g2p-input-form";
import { PhonemeDialog } from "./_components/phoneme-dialog";
import { PhonemeInspector } from "./_components/phoneme-inspector";
import { TranscriptionDisplay } from "./_components/transcription-display";
import { WordDefinitionDialog } from "./_components/word-definition-dialog";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const locale = (await params).locale as Locale;
	const t = await getTranslations({
		locale,
		namespace: "transcription-page",
	});

	return {
		title: t("meta.title"),
		description: t("meta.description"),
		alternates: {
			canonical: getLocalePath(locale, "/transcription"),
			languages: getLanguageAlternates("/transcription"),
		},
	};
}

export default function Index() {
	return (
		<div className="flex flex-1 flex-col items-center bg-background bg-grid-pattern overflow-hidden">
			<div className="w-full max-w-6xl my-3 px-3 h-[calc(100dvh-6.5rem)]">
				<div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_400px] bg-background-soft rounded-xl border">
					<div className="flex min-h-0 flex-col border-b lg:border-b-0 lg:border-r overflow-hidden">
						<div className="border-b p-3 shrink-0">
							<G2PInputForm />
						</div>
						<div className="flex-1 min-h-0 overflow-y-auto">
							<TranscriptionDisplay />
						</div>
					</div>

					<div className="hidden lg:flex lg:flex-col min-h-0 overflow-hidden">
						<PhonemeInspector />
					</div>
				</div>

				<PhonemeDialog />
				<WordDefinitionDialog />
			</div>
		</div>
	);
}
