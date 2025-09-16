"use client";

import { ChevronDown } from "lucide-react";
import { createContext, useContext } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type CollapsibleDetailCardContextValue = {
	expanded: boolean;
	onToggle: () => void;
};

const CollapsibleDetailCardContext = createContext<CollapsibleDetailCardContextValue | null>(null);

function useCollapsibleDetailCardContext() {
	const ctx = useContext(CollapsibleDetailCardContext);
	if (!ctx) throw new Error("CollapsibleDetailCard.* must be used within CollapsibleDetailCard");
	return ctx;
}

function CollapsibleDetailCard({
	expanded,
	onToggle,
	className,
	children,
}: {
	expanded: boolean;
	onToggle: () => void;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<CollapsibleDetailCardContext.Provider value={{ expanded, onToggle }}>
			<Card className={`h-fit p-0 ${className ?? ""} gap-2`}>{children}</Card>
		</CollapsibleDetailCardContext.Provider>
	);
}

function CollapsibleDetailCardHeader({
	children,
	actions,
	controlsId,
}: {
	children: React.ReactNode;
	actions?: React.ReactNode;
	controlsId?: string;
}) {
	const { expanded, onToggle } = useCollapsibleDetailCardContext();
	return (
		<CardHeader className="p-0 gap-0">
			<div className="flex items-start justify-between w-full">
				<button
					type="button"
					aria-expanded={expanded}
					aria-controls={controlsId}
					onClick={() => onToggle()}
					className="w-full text-left rounded-md cursor-pointer hover:bg-muted/70 active:bg-muted transition flex items-start justify-between p-4"
				>
					<div className="flex-1">{children}</div>
					<div className="flex items-center relative">
						<ChevronDown
							className={`h-5 w-5 absolute right-0 top-0 opacity-70 transition-transform ${expanded ? "rotate-180" : "rotate-0"}`}
						/>
					</div>
				</button>
				{actions ? <div className="px-4 pt-4">{actions}</div> : null}
			</div>
		</CardHeader>
	);
}

function CollapsibleDetailCardContent({ children, id }: { children: React.ReactNode; id: string }) {
	const { expanded } = useCollapsibleDetailCardContext();
	if (!expanded) return null;
	return (
		<CardContent className="p-0 px-4">
			<div id={id}>{children}</div>
		</CardContent>
	);
}

export { CollapsibleDetailCard, CollapsibleDetailCardHeader, CollapsibleDetailCardContent };
