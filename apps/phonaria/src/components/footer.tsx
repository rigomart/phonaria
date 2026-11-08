import { Link } from "@/components/link";
import type { AppFlags } from "@/lib/flags";
import { ISSUES_URL } from "@/lib/site";
import { Logo } from "./logo";

const linkClass =
	"whitespace-nowrap rounded-sm transition-colors motion-reduce:transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Phones get none: the row wraps there, and a dot would end a line. */
function Separator() {
	return (
		<span aria-hidden className="hidden sm:inline">
			·
		</span>
	);
}

export function Footer({ flags }: { flags: Pick<AppFlags, "about"> }) {
	return (
		<footer className="px-4 py-6">
			<div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:gap-x-3">
				<Logo className="size-3.5" />
				{flags.about && (
					<>
						<Link href="/about" className={linkClass}>
							About
						</Link>
						<Separator />
					</>
				)}
				<Link href="/credits" className={linkClass}>
					Credits
				</Link>
				<Separator />
				<a
					href="https://github.com/rigomart/phonaria"
					target="_blank"
					rel="noopener noreferrer"
					className={linkClass}
				>
					GitHub
				</a>
				<Separator />
				<a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
					Report a problem<span className="sr-only"> (opens in a new tab)</span>
				</a>
				<Separator />
				<span className="whitespace-nowrap">&copy; {new Date().getFullYear()} Phonaria</span>
			</div>
		</footer>
	);
}
