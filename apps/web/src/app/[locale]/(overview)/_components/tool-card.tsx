import { ArrowRight } from "lucide-react";
import Link from "next/link";

type ToolCardProps = {
	title: string;
	description: string;
	href: string;
	icon?: React.ReactNode;
	preview?: React.ReactNode;
};

export function ToolCard({ title, description, href, icon, preview }: ToolCardProps) {
	return (
		<Link
			href={href}
			className="
				group relative flex flex-col w-full h-full
				rounded-xl border bg-background-soft shadow-sm
				hover:border-primary/20 hover:bg-accent/50
				transition-all duration-200 ease-out
				focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
			"
		>
			<div className="flex items-start p-2 sm:p-4 gap-3">
				{icon && (
					<div className="shrink-0 flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary mt-0.5">
						{icon}
					</div>
				)}

				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between gap-2">
						<h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
							{title}
						</h3>
						<ArrowRight className="size-4 text-muted-foreground/50 transition-transform group-hover:text-primary" />
					</div>

					<p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
						{description}
					</p>
				</div>
			</div>

			{preview && (
				<div className="mt-auto border-t border-border/40 bg-muted/20 p-4 rounded-b-lg flex-1 flex flex-col min-h-0">
					<div className="flex-1 flex flex-col min-h-0">{preview}</div>
				</div>
			)}
		</Link>
	);
}
