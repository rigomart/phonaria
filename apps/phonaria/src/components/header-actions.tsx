"use client";

import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useContext,
	useState,
} from "react";
import { createPortal } from "react-dom";

const HeaderActionsNodeContext = createContext<HTMLDivElement | null>(null);
const HeaderActionsSetContext = createContext<Dispatch<
	SetStateAction<HTMLDivElement | null>
> | null>(null);

/** Lets a page render controls into the site header without owning its layout. */
export function HeaderActionsProvider({ children }: { children: ReactNode }) {
	const [node, setNode] = useState<HTMLDivElement | null>(null);
	return (
		<HeaderActionsSetContext.Provider value={setNode}>
			<HeaderActionsNodeContext.Provider value={node}>{children}</HeaderActionsNodeContext.Provider>
		</HeaderActionsSetContext.Provider>
	);
}

/** Right-hand slot in the site header. Empty until a page portals into it. */
export function HeaderActionsSlot({ className }: { className?: string }) {
	const setNode = useContext(HeaderActionsSetContext);
	if (!setNode) return null;
	return <div ref={setNode} className={className} />;
}

/** Renders into {@link HeaderActionsSlot} after the header has mounted. */
export function HeaderActions({ children }: { children: ReactNode }) {
	const node = useContext(HeaderActionsNodeContext);
	if (!node) return null;
	return createPortal(children, node);
}
