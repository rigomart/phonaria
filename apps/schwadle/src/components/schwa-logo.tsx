import { cn } from "@/lib/utils";

type SchwaLogoProps = {
	className?: string;
};

export function SchwaLogo({ className }: SchwaLogoProps) {
	return (
		<div
			className={cn(
				"flex items-center justify-center rounded-2xl bg-foreground text-background",
				className,
			)}
		>
			<span className="select-none font-serif leading-none" style={{ fontSize: "0.65em" }}>
				&#x259;
			</span>
		</div>
	);
}
