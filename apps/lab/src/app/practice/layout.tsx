import { requireFlag } from "@/lib/flags";

/** Gates every /practice route behind the flag, including future subroutes. */
export default function PracticeLayout({ children }: { children: React.ReactNode }) {
	requireFlag("practice");
	return children;
}
