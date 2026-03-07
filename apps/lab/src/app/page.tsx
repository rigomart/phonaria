import { ThemeSwitcher } from "@/components/theme-switcher";

export default function HomePage() {
	return (
		<div className="flex flex-1 items-center justify-center">
			<div className="text-center space-y-4">
				<h1 className="text-4xl font-bold tracking-tight">Phonaria Lab</h1>
				<p className="text-muted-foreground text-lg">Experimental workspace</p>
				<div className="flex justify-center">
					<ThemeSwitcher />
				</div>
			</div>
		</div>
	);
}
