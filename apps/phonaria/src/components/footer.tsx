import { Link } from "@/components/link";
import { Logo } from "./logo";

const linkClass =
	"rounded-sm transition-colors motion-reduce:transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function Footer() {
	return (
		<footer className="px-4 py-6">
			<div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
				<Logo className="size-3.5" />
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
				<span>&copy; {new Date().getFullYear()} Phonaria</span>
			</div>
		</footer>
	);
}
