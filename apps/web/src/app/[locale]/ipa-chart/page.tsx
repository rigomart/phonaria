import { PhonemeDialog } from "./_components/phoneme-dialog";
import { HeroSection } from "./_sections/hero-section";
import { NavTabsSection } from "./_sections/nav-tabs-section";

export default function IpaChartPage() {
	return (
		<main className="mx-auto max-w-7xl py-6 space-y-6 px-2 w-full">
			<HeroSection />
			<NavTabsSection />
			<PhonemeDialog />
		</main>
	);
}
