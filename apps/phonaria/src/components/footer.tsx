import { Link } from "@/components/link";
import type { AppFlags } from "@/lib/flags";
import { ISSUES_URL } from "@/lib/site";
import { Logo } from "./logo";

const linkClass =
	"whitespace-nowrap rounded-sm transition-colors motion-reduce:transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function Footer({ flags }: { flags: Pick<AppFlags, "about"> }) {
	return (
		<footer className="px-4 py-6">
			<div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
				<Logo className="size-3.5" />
				{flags.about && (
					<>
						<Link href="/about" className={linkClass}>
							About
						</Link>
						<span aria-hidden>·</span>
					</>
				)}
				<Link href="/credits" className={linkClass}>
					Credits
				</Link>
				<span aria-hidden>·</span>
				<a
					href="https://github.com/rigomart/phonaria"
					target="_blank"
					rel="noopener noreferrer"
					className={linkClass}
				>
					GitHub
				</a>
				<span aria-hidden>·</span>
				<a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
					Report a problem<span className="sr-only"> (opens in a new tab)</span>
				</a>
				<span aria-hidden>·</span>
				<span className="whitespace-nowrap">&copy; {new Date().getFullYear()} Phonaria</span>
			</div>
		</footer>
	);
}
