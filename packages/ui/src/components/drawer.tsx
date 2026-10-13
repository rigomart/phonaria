"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { cn } from "@phonaria/ui/lib/utils";

/**
 * Bottom sheet with swipe-to-dismiss, built on Base UI's Drawer and styled like
 * `sheet.tsx`. Not vendored from shadcn/ui, whose drawer depends on vaul.
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

function DrawerContent({ className, children, ...props }: DrawerPrimitive.Popup.Props) {
	return (
		<DrawerPrimitive.Portal>
			<DrawerPrimitive.Backdrop
				data-slot="drawer-overlay"
				className="fixed inset-0 z-50 min-h-dvh bg-black opacity-[calc(0.3*(1-var(--drawer-swipe-progress)))] transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none supports-[-webkit-touch-callout:none]:absolute"
			/>
			<DrawerPrimitive.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
				<DrawerPrimitive.Popup
					data-slot="drawer-content"
					className={cn(
						"flex max-h-[85dvh] w-full flex-col rounded-t-3xl bg-popover pb-[env(safe-area-inset-bottom,0px)] text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/5 outline-none [transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-ending-style:[transform:translateY(calc(100%+2px))] data-starting-style:[transform:translateY(calc(100%+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*300ms)] motion-reduce:transition-none dark:ring-foreground/10",
						className,
					)}
					{...props}
				>
					<div
						aria-hidden="true"
						className="mx-auto mt-2.5 mb-1 h-1 w-10 shrink-0 rounded-full bg-border"
					/>
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
