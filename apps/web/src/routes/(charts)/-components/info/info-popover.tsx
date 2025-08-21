import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InfoPopoverProps {
	category: string;
	label: string;
	short: string;
	airflow?: string;
	side?: "top" | "right" | "bottom" | "left";
	align?: "start" | "center" | "end";
	children: React.ReactNode;
}

export function InfoPopover({
	category,
	label,
	short,
	airflow,
	side = "top",
	align = "center",
	children,
}: InfoPopoverProps) {
	if (!category || !label || !short) {
		console.warn("InfoPopover: Missing required props (category, label, short)");
		return <>{children}</>;
	}

	return (
		<Tooltip delayDuration={150}>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent side={side} align={align} className="max-w-xs text-xs leading-snug">
				<div className="space-y-1">
					<div className="font-medium text-[11px] uppercase tracking-wide text-muted-foreground">
						{category}
					</div>
					<div className="font-semibold text-sm">{label}</div>
					<p className="text-muted-foreground">{short}</p>
					{airflow ? (
						<p className="text-[11px] text-muted-foreground/80">Airflow: {airflow}</p>
					) : null}
				</div>
			</TooltipContent>
		</Tooltip>
	);
}
