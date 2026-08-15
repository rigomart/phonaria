import type { Metadata } from "next";
import { requireFlag } from "@/lib/flags";

// Practice stays out of search indexes even when the feature flag is on.
export const metadata: Metadata = {
	robots: { index: false, follow: true },
};

/** Gates every /practice route behind the flag, including future subroutes. */
export default function PracticeLayout({ children }: { children: React.ReactNode }) {
	requireFlag("practice");
	return children;
}
