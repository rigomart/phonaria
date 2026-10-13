"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { Button } from "@phonaria/ui/components/button";
import { cn } from "@phonaria/ui/lib/utils";
import { XIcon } from "lucide-react";

/**
 * Bottom or right-side sheet with swipe-to-dismiss, built on Base UI's Drawer and
 * styled like `sheet.tsx`. Not vendored from shadcn/ui, whose drawer depends on vaul.
 */
function Drawer({ ...props }: DrawerPrimitive.Root.Props) {
	return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
	return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
	return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerContent({
	className,
	children,
	side = "bottom",
	showBackdrop = true,
	...props
}: DrawerPrimitive.Popup.Props & {
	/** Pair `right` with `swipeDirection="right"` on the root. */
	side?: "bottom" | "right";
	/** Off for a non-modal drawer, so the page behind stays usable. */
	showBackdrop?: boolean;
}) {
	return (
		<DrawerPrimitive.Portal>
			{showBackdrop && (
				<DrawerPrimitive.Backdrop
					data-slot="drawer-overlay"
					className="fixed inset-0 z-50 min-h-dvh bg-black opacity-[calc(0.3*(1-var(--drawer-swipe-progress)))] transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none supports-[-webkit-touch-callout:none]:absolute"
				/>
			)}
			<DrawerPrimitive.Viewport
				data-side={side}
				className="pointer-events-none fixed inset-0 z-50 flex data-[side=bottom]:items-end data-[side=bottom]:justify-center data-[side=right]:items-stretch data-[side=right]:justify-end"
			>
				<DrawerPrimitive.Popup
					data-slot="drawer-content"
					data-side={side}
					className={cn(
						"pointer-events-auto flex flex-col bg-popover text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/5 outline-none transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-ending-style:duration-[calc(var(--drawer-swipe-strength)*300ms)] motion-reduce:transition-none dark:ring-foreground/10",
						"data-[side=bottom]:max-h-[85dvh] data-[side=bottom]:w-full data-[side=bottom]:rounded-t-3xl data-[side=bottom]:pb-[env(safe-area-inset-bottom,0px)] data-[side=bottom]:[transform:translateY(var(--drawer-swipe-movement-y))] data-[side=bottom]:data-ending-style:[transform:translateY(calc(100%+2px))] data-[side=bottom]:data-starting-style:[transform:translateY(calc(100%+2px))]",
						"data-[side=right]:h-full data-[side=right]:w-80 data-[side=right]:max-w-[calc(100vw-3rem)] data-[side=right]:rounded-l-3xl data-[side=right]:[transform:translateX(var(--drawer-swipe-movement-x))] data-[side=right]:data-ending-style:[transform:translateX(calc(100%+2px))] data-[side=right]:data-starting-style:[transform:translateX(calc(100%+2px))]",
						className,
					)}
					{...props}
				>
					{side === "bottom" ? (
						<div
							aria-hidden="true"
							className="mx-auto mt-2.5 mb-1 h-1 w-10 shrink-0 rounded-full bg-border"
						/>
					) : (
						<div className="flex shrink-0 justify-end px-3 pt-3">
							<DrawerPrimitive.Close
								data-slot="drawer-close"
								render={<Button variant="ghost" size="icon-sm" className="bg-secondary" />}
							>
								<XIcon />
								<span className="sr-only">Close</span>
							</DrawerPrimitive.Close>
						</div>
					)}
					{children}
				</DrawerPrimitive.Popup>
			</DrawerPrimitive.Viewport>
		</DrawerPrimitive.Portal>
	);
}

/** Scrolling body. Text inside can be selected without starting a swipe. */
function DrawerBody({ className, ...props }: DrawerPrimitive.Content.Props) {
	return (
		<DrawerPrimitive.Content
			data-slot="drawer-body"
			className={cn(
				"min-h-0 flex-1 touch-auto overflow-y-auto overscroll-contain px-4 pb-4",
				className,
			)}
			{...props}
		/>
	);
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
	return (
		<DrawerPrimitive.Title
			data-slot="drawer-title"
			className={cn("text-base font-medium text-foreground", className)}
			{...props}
		/>
	);
}

function DrawerDescription({ className, ...props }: DrawerPrimitive.Description.Props) {
	return (
		<DrawerPrimitive.Description
			data-slot="drawer-description"
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Drawer,
	DrawerTrigger,
	DrawerClose,
	DrawerContent,
	DrawerBody,
	DrawerTitle,
	DrawerDescription,
};
