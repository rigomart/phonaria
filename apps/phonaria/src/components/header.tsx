import { Button } from "@phonaria/ui/components/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@phonaria/ui/components/sheet";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "@/components/link";
import { useNavIndicator } from "@/hooks/use-nav-indicator";
import { useScrolled } from "@/hooks/use-scrolled";
import type { AppFlags } from "@/lib/flags";
import { IPA_CHART_INDEX_PATH } from "@/lib/ipa-chart-metadata";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { chartSections, getTools, usePathname } from "./site-nav";
import { ThemeSwitcher } from "./theme-switcher";

const focusRing =
	"rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function Header({ flags }: { flags: AppFlags }) {
	const pathname = usePathname();
	const scrolled = useScrolled();
	const onChart = pathname.startsWith(IPA_CHART_INDEX_PATH);

	return (
		<header
			className={cn(
				"sticky top-0 z-40 border-b bg-background transition-[border-color] motion-reduce:transition-none",
				scrolled || onChart ? "border-border" : "border-transparent",
			)}
		>
			<div className="mx-auto flex h-12 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
				<Link
					href="/"
					aria-label="Phonaria"
					className={cn("flex items-center text-foreground", focusRing)}
				>
					<Logo className="size-5" />
				</Link>

				<MainNav flags={flags} pathname={pathname} />

				<div className="ml-auto flex items-center gap-1">
					<ThemeSwitcher />
					<MobileMenu flags={flags} />
				</div>
			</div>

			{onChart && <ChartNav pathname={pathname} />}
		</header>
	);
}

function MainNav({ flags, pathname }: { flags: AppFlags; pathname: string }) {
	const tools = getTools(flags);
	const activeTool = tools.find((tool) => tool.match(pathname));
	const { navRef, measured, indicator } = useNavIndicator<HTMLElement>(activeTool?.id ?? null);

	return (
		<nav
			ref={navRef}
			aria-label="Main"
			className="relative hidden h-full shrink-0 items-stretch gap-5 text-sm whitespace-nowrap sm:flex"
		>
			{tools.map((tool) => {
				const active = tool === activeTool;
				return (
					<Link
						key={tool.id}
						href={tool.href}
						aria-current={active ? "page" : undefined}
						className={cn(
							"relative flex items-center transition-colors motion-reduce:transition-none",
							focusRing,
							active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
							active &&
								!measured &&
								"after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-foreground",
						)}
					>
						{tool.label}
					</Link>
				);
			})}
			<span
				{...indicator}
				className={cn(
					indicator.className,
					"top-auto -bottom-px h-0.5 w-(--nav-w) translate-x-(--nav-x) rounded-full bg-foreground",
				)}
			/>
		</nav>
	);
}

function ChartNav({ pathname }: { pathname: string }) {
	const activeSection = chartSections.find((section) => section.href === pathname);
	const { navRef, measured, indicator } = useNavIndicator<HTMLElement>(activeSection?.href ?? null);

	return (
		<div className="border-t">
			<nav
				ref={navRef}
				aria-label="IPA Chart"
				className="relative mx-auto flex w-full max-w-6xl gap-1 px-4 py-2 text-sm sm:px-6"
			>
				{/* Before the links, so they paint over it. */}
				<span
					{...indicator}
					className={cn(
						indicator.className,
						"h-(--nav-h) w-(--nav-w) translate-x-(--nav-x) translate-y-(--nav-y) rounded-full bg-secondary",
					)}
				/>
				{chartSections.map((section) => {
					const active = section === activeSection;
					return (
						<Link
							key={section.href}
							href={section.href}
							aria-current={active ? "page" : undefined}
							className={cn(
								"relative rounded-full px-3 py-1 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
								active && !measured && "bg-secondary",
							)}
						>
							{section.label}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}

function MobileMenu({ flags }: { flags: AppFlags }) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const close = () => setOpen(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				render={
					<Button
						variant="ghost"
						size="icon-sm"
						className="text-muted-foreground hover:text-foreground sm:hidden"
						aria-label="Open menu"
					/>
				}
			>
				<MenuIcon aria-hidden />
			</SheetTrigger>
			<SheetContent side="top">
				<SheetHeader>
					<SheetTitle>Menu</SheetTitle>
				</SheetHeader>
				<nav aria-label="Main" className="flex flex-col px-4 pb-6">
					{getTools(flags).map((tool) => {
						const active = tool.match(pathname);
						return (
							<div key={tool.id} className="border-b last:border-b-0">
								<Link
									href={tool.href}
									onClick={close}
									aria-current={active ? "page" : undefined}
									className={cn(
										"flex items-center gap-3 py-3 text-base",
										active ? "font-medium text-foreground" : "text-muted-foreground",
									)}
								>
									<tool.icon className="size-4" aria-hidden />
									{tool.label}
								</Link>
								{tool.id === "ipa-chart" && (
									<div className="flex gap-2 pb-3 pl-7">
										{chartSections.map((section) => (
											<Link
												key={section.href}
												href={section.href}
												onClick={close}
												aria-current={pathname === section.href ? "page" : undefined}
												className={cn(
													"rounded-full border px-3 py-1 text-sm",
													pathname === section.href
														? "bg-secondary text-foreground"
														: "text-muted-foreground",
												)}
											>
												{section.label}
											</Link>
										))}
									</div>
								)}
							</div>
						);
					})}
				</nav>
			</SheetContent>
		</Sheet>
	);
}
