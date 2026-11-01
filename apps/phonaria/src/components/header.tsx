import { badgeVariants } from "@phonaria/ui/components/badge";
import { Button } from "@phonaria/ui/components/button";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@phonaria/ui/components/navigation-menu";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "@phonaria/ui/components/popover";
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
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { getTools, navCurrent, soundsSections, type Tool, usePathname } from "./site-nav";
import { ThemeSwitcher } from "./theme-switcher";

const focusRing =
	"rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function Header({ flags }: { flags: AppFlags }) {
	const pathname = usePathname();
	const scrolled = useScrolled();

	return (
		<header
			className={cn(
				"sticky top-0 z-40 border-b bg-background transition-[border-color] motion-reduce:transition-none",
				scrolled ? "border-border" : "border-transparent",
			)}
		>
			<div className="mx-auto flex h-12 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
				<div className="flex shrink-0 items-center gap-2">
					<Link
						href="/"
						aria-label="Phonaria"
						className={cn("flex items-center text-foreground", focusRing)}
					>
						<Logo className="size-5" />
					</Link>
					<BetaBadge flags={flags} />
				</div>

				<MainNav flags={flags} pathname={pathname} />

				<div className="ml-auto flex items-center gap-1">
					<ThemeSwitcher />
					<MobileMenu flags={flags} />
				</div>
			</div>
		</header>
	);
}

export function betaNotice(flags: Pick<AppFlags, "speech">): string {
	return flags.speech
		? "It's still changing, and pronunciations, scores and notes can be wrong."
		: "It's still changing, and pronunciations and notes can be wrong.";
}

const ISSUES_URL = "https://github.com/rigomart/phonaria/issues";

const popoverLink =
	"rounded-sm text-foreground underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function BetaBadge({ flags }: { flags: AppFlags }) {
	const [open, setOpen] = useState(false);
	const closeOnNavigate = () => setOpen(false);
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				className={cn(
					badgeVariants({ variant: "outline" }),
					"cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground",
				)}
			>
				<span className="sr-only">About the </span>Beta
			</PopoverTrigger>
			<PopoverContent align="start" className="gap-3">
				<div className="flex flex-col gap-1">
					<PopoverTitle className="font-display text-sm font-semibold">
						Phonaria is in beta
					</PopoverTitle>
					<PopoverDescription className="text-xs sm:text-sm">
						{betaNotice(flags)}
					</PopoverDescription>
				</div>
				<div className="flex flex-col gap-1.5 text-xs sm:text-sm">
					<Link href="/credits" onClick={closeOnNavigate} className={cn("w-fit", popoverLink)}>
						Where the data comes from
					</Link>
					<a
						href={ISSUES_URL}
						target="_blank"
						rel="noopener noreferrer"
						className={cn("w-fit", popoverLink)}
					>
						Report a problem<span className="sr-only"> (opens in a new tab)</span>
					</a>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function MainNav({ flags, pathname }: { flags: AppFlags; pathname: string }) {
	const tools = getTools(flags);
	const activeTool = tools.find((tool) => tool.match(pathname));
	const { navRef, measured, indicator } = useNavIndicator<HTMLElement>(activeTool?.id ?? null);

	return (
		<NavigationMenu ref={navRef} aria-label="Main" className="hidden shrink-0 sm:flex">
			{/* Before the list, so the items paint over it. */}
			<span
				{...indicator}
				className={cn(
					indicator.className,
					"h-(--nav-h) w-(--nav-w) translate-x-(--nav-x) translate-y-(--nav-y) rounded-full bg-secondary",
				)}
			/>
			<NavigationMenuList className="gap-1">
				{tools.map((tool) => (
					<NavigationMenuItem key={tool.id}>
						<MainNavItem
							tool={tool}
							pathname={pathname}
							active={tool === activeTool}
							measured={measured}
						/>
					</NavigationMenuItem>
				))}
			</NavigationMenuList>
		</NavigationMenu>
	);
}

const shadeLikeIndicator =
	"hover:bg-secondary focus:bg-secondary data-popup-open:bg-secondary data-popup-open:hover:bg-secondary";

function MainNavItem({
	tool,
	pathname,
	active,
	measured,
}: {
	tool: Tool;
	pathname: string;
	active: boolean;
	measured: boolean;
}) {
	const className = cn(
		navigationMenuTriggerStyle(),
		"px-2 md:px-3",
		shadeLikeIndicator,
		active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
		active && !measured && "bg-secondary",
	);
	const marker = active ? { "data-nav-active": "" } : {};
	const current = navCurrent(tool, pathname);

	if (tool.id !== "sounds") {
		return (
			<NavigationMenuLink
				closeOnClick
				className={className}
				render={<Link href={tool.href} aria-current={current} {...marker} />}
			>
				{tool.label}
			</NavigationMenuLink>
		);
	}

	return (
		<>
			<NavigationMenuTrigger className={className} aria-current={current} {...marker}>
				{tool.label}
			</NavigationMenuTrigger>
			{/* Kept mounted so the links are in the server-rendered HTML for crawlers. */}
			<NavigationMenuContent keepMounted>
				<ul className="grid w-48 gap-1">
					{soundsSections.map((section) => (
						<li key={section.href}>
							<NavigationMenuLink
								active={pathname === section.href}
								closeOnClick
								className="data-active:bg-muted"
								render={<Link href={section.href} />}
							>
								{section.label}
							</NavigationMenuLink>
						</li>
					))}
				</ul>
			</NavigationMenuContent>
		</>
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
						const current = navCurrent(tool, pathname);
						return (
							<div key={tool.id} className="border-b last:border-b-0">
								<Link
									href={tool.href}
									onClick={close}
									aria-current={current}
									className={cn(
										"flex items-center gap-3 py-3 text-base",
										active ? "font-medium text-foreground" : "text-muted-foreground",
									)}
								>
									<tool.icon className="size-4" aria-hidden />
									{tool.label}
								</Link>
								{tool.id === "sounds" && (
									<div className="flex flex-wrap gap-2 pb-3 pl-7">
										{soundsSections.map((section) => (
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
