"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { cn } from "@phonaria/ui/lib/utils";
import type * as React from "react";

function Drawer<Payload>({ ...props }: DrawerPrimitive.Root.Props<Payload>) {
	return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger<Payload>({ ...props }: DrawerPrimitive.Trigger.Props<Payload>) {
	return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

/** Links one `Drawer` to triggers rendered elsewhere, each passing its own payload. */
const createDrawerHandle = DrawerPrimitive.createHandle;

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
	return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) {
	return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerOverlay({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
	return (
		<DrawerPrimitive.Backdrop
			data-slot="drawer-overlay"
			className={cn(
				"fixed inset-0 z-50 bg-black/30 opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0",
				className,
			)}
			{...props}
		/>
	);
}

/*
 * Each side follows the finger while swiping (`--drawer-swipe-movement-*`).
 * A bottom drawer also rests at its snap point: it slides down by
 * `--drawer-snap-point-offset`, and the same amount of bottom padding keeps
 * its content box inside the screen, so the visible part can scroll to its end.
 */
const sideClasses = {
	bottom:
		"inset-x-0 bottom-0 max-h-11/12 rounded-t-3xl [transform:translateY(calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))] pb-[max(0px,calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))] data-ending-style:pb-0 data-starting-style:pb-0 data-ending-style:[transform:translateY(100%)] data-starting-style:[transform:translateY(100%)]",
	right:
		"inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm [transform:translateX(var(--drawer-swipe-movement-x))] data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:[transform:translateX(2.5rem)] data-starting-style:[transform:translateX(2.5rem)]",
} as const;

function DrawerContent({
	className,
	children,
	side = "bottom",
	showOverlay = true,
	...props
}: DrawerPrimitive.Popup.Props & {
	side?: keyof typeof sideClasses;
	showOverlay?: boolean;
}) {
	return (
		<DrawerPortal>
			{showOverlay && <DrawerOverlay />}
			<DrawerPrimitive.Viewport
				data-slot="drawer-viewport"
				className="pointer-events-none fixed inset-0 z-50"
			>
				<DrawerPrimitive.Popup
					data-slot="drawer-content"
					data-side={side}
					className={cn(
						"pointer-events-auto fixed flex flex-col bg-popover text-sm text-popover-foreground shadow-xl outline-none transition-[transform,opacity,padding] duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-swiping:duration-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]",
						sideClasses[side],
						className,
					)}
					{...props}
				>
					{children}
				</DrawerPrimitive.Popup>
			</DrawerPrimitive.Viewport>
		</DrawerPortal>
	);
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-header"
			className={cn("flex flex-col gap-1.5 p-4", className)}
			{...props}
		/>
	);
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-footer"
			className={cn("mt-auto flex flex-col gap-2 p-4", className)}
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
	createDrawerHandle,
	Drawer,
	DrawerTrigger,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerFooter,
	DrawerTitle,
	DrawerDescription,
};
