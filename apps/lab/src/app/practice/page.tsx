import type { Metadata } from "next";
import { PracticeActivity } from "@/lib/practice/activity";
import { PracticeIndexContent } from "./_components/practice-index-content";

export const metadata: Metadata = {
	title: PracticeActivity.name,
	description: PracticeActivity.description,
};

export default function PracticePage() {
	return <PracticeIndexContent />;
}
