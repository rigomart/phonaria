import type { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";

import { getScopedI18n } from "@/locales/server";

import { CoreModulesSection } from "./_components/core-modules-section";
import { ToolCombinationSection } from "./_components/tool-combination-section";

export async function generateMetadata({
params,
}: {
params: Promise<{ locale: string }>;
}): Promise<Metadata> {
const { locale } = await params;

setStaticParamsLocale(locale);

const t = await getScopedI18n("overview-page.meta");

return {
title: t("title"),
description: t("description"),
};
}

export default async function FeaturesRoute({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;

	setStaticParamsLocale(locale);

	return (
		<div className="flex flex-1 flex-col bg-background">
			<CoreModulesSection />
			<ToolCombinationSection />
		</div>
	);
}
