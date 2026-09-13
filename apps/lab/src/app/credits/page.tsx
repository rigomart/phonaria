import type { Metadata } from "next";
import { CreditsContent } from "@/components/credits-content";
import { CREDITS_PAGE_DESCRIPTION, CREDITS_PAGE_TITLE } from "@/lib/credits-metadata";

export const metadata: Metadata = {
	title: CREDITS_PAGE_TITLE,
	description: CREDITS_PAGE_DESCRIPTION,
};

export default function CreditsPage() {
	return <CreditsContent />;
}
