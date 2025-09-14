"use client";

import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type CollapsibleDetailCardProps = {
	expanded: boolean;
	onToggle: () => void;
	header: React.ReactNode;
	actions?: React.ReactNode;
	children: React.ReactNode;
	contentId: string;
	className?: string;
};

export function CollapsibleDetailCard({
	expanded,
	onToggle,
	header,
	actions,
	children,
	contentId,
	className,
}: CollapsibleDetailCardProps) {
	return (
		<Card className={`h-fit p-0 ${className ?? ""}`}>
			<CardHeader className="p-0 gap-0">
				<div className="flex items-start justify-between w-full">
					<button
						type="button"
						aria-expanded={expanded}
						aria-controls={contentId}
						onClick={() => onToggle()}
						className="w-full text-left rounded-md cursor-pointer hover:bg-muted/70 active:bg-muted transition flex items-start justify-between p-4"
					>
						<div className="flex-1">{header}</div>
						<div className="flex items-center relative">
							<ChevronDown
								className={`h-5 w-5 absolute right-0 top-0 opacity-70 transition-transform ${expanded ? "rotate-180" : "rotate-0"}`}
							/>
						</div>
					</button>
					{actions ? <div className="px-4 pt-4">{actions}</div> : null}
				</div>
			</CardHeader>
			{expanded ? (
				<CardContent className="p-0 px-4">
					<div id={contentId}>{children}</div>
				</CardContent>
			) : null}
		</Card>
	);
}
