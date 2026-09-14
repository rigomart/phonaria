import type { Metadata } from "next";
import { VowelsContent } from "@/components/ipa-chart/vowels-content";
import { VOWELS_PAGE_DESCRIPTION, VOWELS_PAGE_TITLE } from "@/lib/ipa-chart-metadata";

export const metadata: Metadata = {
	title: VOWELS_PAGE_TITLE,
	description: VOWELS_PAGE_DESCRIPTION,
};

export default function VowelsPage() {
	return <VowelsContent />;
}
