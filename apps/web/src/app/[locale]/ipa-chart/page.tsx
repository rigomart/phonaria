import { PhonemeDialog } from "./_components/phoneme-dialog";
import { HeroSection } from "./_sections/hero-section";
import { NavTabsSection } from "./_sections/nav-tabs-section";

export default function IpaChartPage() {
	return (
		<main className="mx-auto max-w-6xl py-6 space-y-6 px-4">
			<HeroSection />
			<NavTabsSection />
			<PhonemeDialog />
		</main>
	);
}
