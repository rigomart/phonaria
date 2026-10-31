// Prototype: every logo direction side by side. Not linked from the app.
import { createFileRoute } from "@tanstack/react-router";
import { CurrentLogo, VariantLogo } from "@/components/logo";
import { CURRENT_LOGO_ID, LOGO_VARIANTS } from "@/components/logo-variants";

export const Route = createFileRoute("/logo-lab")({
	head: () => ({
		meta: [
			{ title: "Logo directions · Phonaria" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: LogoLab,
});

const SIZES = ["size-4", "size-8", "size-16"];

const rows = [
	{
		id: CURRENT_LOGO_ID,
		name: "Current",
		description: "The shipped mark: skewed brackets fused with a double slash.",
		render: (className: string) => <CurrentLogo className={className} />,
	},
	...LOGO_VARIANTS.map((variant) => ({
		id: variant.id,
		name: variant.name,
		description: variant.description,
		render: (className: string) => <VariantLogo variant={variant} className={className} />,
	})),
];

function LogoLab() {
	return (
		<main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
			<h1 className="font-display text-2xl font-semibold">Logo directions</h1>
			<p className="mt-2 text-muted-foreground">
				Pick one to see it in the header, footer and tab icon for this session. Use the theme
				switcher to check both themes.
			</p>
			<ul className="mt-8 divide-y border-y">
				{rows.map((row) => (
					<li key={row.id} className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
						<div>
							<h2 className="font-semibold">{row.name}</h2>
							<p className="mt-1 text-sm text-muted-foreground">{row.description}</p>
							<div className="mt-4 flex items-center gap-2 text-foreground">
								{row.render("size-5")}
								<span className="font-display text-base font-semibold">Phonaria</span>
							</div>
							<a
								href={`/?logo=${row.id}`}
								className="mt-3 inline-block text-sm underline underline-offset-4"
							>
								Use in the app
							</a>
						</div>
						<div className="flex items-end gap-6 text-foreground">
							{SIZES.map((size) => (
								<span key={size}>{row.render(size)}</span>
							))}
						</div>
					</li>
				))}
			</ul>
		</main>
	);
}
