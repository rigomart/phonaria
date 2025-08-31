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
	return (
		<Tooltip delayDuration={150}>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent side={side} align={align} className="max-w-xs text-xs leading-snug">
				<div className="space-y-1">
					<div className="font-medium text-[11px] uppercase tracking-wide">{category}</div>
					<div className="font-semibold text-sm">{label}</div>
					<p className="text-current/80">{short}</p>
					{airflow ? <p className="text-[11px]">Airflow: {airflow}</p> : null}
				</div>
			</TooltipContent>
		</Tooltip>
	);
}
