import type { Metadata } from "next";
import { ConsonantsContent } from "@/components/ipa-chart/consonants-content";
import { CONSONANTS_PAGE_DESCRIPTION, CONSONANTS_PAGE_TITLE } from "@/lib/ipa-chart-metadata";

export const metadata: Metadata = {
	title: CONSONANTS_PAGE_TITLE,
	description: CONSONANTS_PAGE_DESCRIPTION,
};

export default function ConsonantsPage() {
	return <ConsonantsContent />;
}
