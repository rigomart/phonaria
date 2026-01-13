"use client";

import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

function NavigationMenu({ className, children, ...props }: NavigationMenuPrimitive.Root.Props) {
	return (
		<NavigationMenuPrimitive.Root
			className={cn(
				"group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
				className,
			)}
			data-slot="navigation-menu"
			{...props}
		>
			{children}
		</NavigationMenuPrimitive.Root>
	);
}

function NavigationMenuList({ className, ...props }: NavigationMenuPrimitive.List.Props) {
	return (
		<NavigationMenuPrimitive.List
			className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
			data-slot="navigation-menu-list"
			{...props}
		/>
	);
}

function NavigationMenuItem({ className, ...props }: NavigationMenuPrimitive.Item.Props) {
	return (
		<NavigationMenuPrimitive.Item
			className={cn("relative", className)}
			data-slot="navigation-menu-item"
			{...props}
		/>
	);
}

function NavigationMenuTrigger({
	className,
	children,
	...props
}: NavigationMenuPrimitive.Trigger.Props) {
	return (
		<NavigationMenuPrimitive.Trigger
			className={cn(
				"inline-flex h-9 w-max items-center justify-center gap-1 rounded-lg px-3 text-base font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-64 data-popup-open:bg-accent data-popup-open:text-accent-foreground sm:h-8 sm:text-sm",
				className,
			)}
			data-slot="navigation-menu-trigger"
			{...props}
		>
			{children}
			<ChevronDownIcon
				aria-hidden="true"
				className="size-3.5 transition-transform duration-200 data-popup-open:rotate-180 sm:size-3"
			/>
		</NavigationMenuPrimitive.Trigger>
	);
}

function NavigationMenuContent({ className, ...props }: NavigationMenuPrimitive.Content.Props) {
	return (
		<NavigationMenuPrimitive.Content
			className={cn(
				"h-full w-full p-1 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0",
				className,
			)}
			data-slot="navigation-menu-content"
			{...props}
		/>
	);
}

function NavigationMenuPositioner({
	className,
	children,
	sideOffset = 4,
	...props
}: NavigationMenuPrimitive.Positioner.Props) {
	return (
		<NavigationMenuPrimitive.Portal>
			<NavigationMenuPrimitive.Positioner
				className={cn(
					"z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] data-instant:transition-none",
					className,
				)}
				collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
				data-slot="navigation-menu-positioner"
				sideOffset={sideOffset}
				{...props}
			>
				{children}
			</NavigationMenuPrimitive.Positioner>
		</NavigationMenuPrimitive.Portal>
	);
}

function NavigationMenuPopup({
	className,
	children,
	...props
}: NavigationMenuPrimitive.Popup.Props) {
	return (
		<NavigationMenuPrimitive.Popup
			className={cn(
				"relative flex h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-lg border bg-popover bg-clip-padding shadow-lg outline-none transition-[scale,opacity] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0 dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]",
				className,
			)}
			data-slot="navigation-menu-popup"
			{...props}
		>
			{children}
			<NavigationMenuViewport />
		</NavigationMenuPrimitive.Popup>
	);
}

function NavigationMenuViewport({ className, ...props }: NavigationMenuPrimitive.Viewport.Props) {
	return (
		<NavigationMenuPrimitive.Viewport
			className={cn("relative size-full overflow-hidden", className)}
			data-slot="navigation-menu-viewport"
			{...props}
		/>
	);
}

function NavigationMenuLink({ className, ...props }: NavigationMenuPrimitive.Link.Props) {
	return (
		<NavigationMenuPrimitive.Link
			className={cn(
				"flex cursor-pointer select-none flex-col gap-0.5 rounded-sm px-2 py-1.5 text-base outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-active:bg-accent data-active:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-64 sm:text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			data-slot="navigation-menu-link"
			{...props}
		/>
	);
}

function NavigationMenuArrow({ className, ...props }: NavigationMenuPrimitive.Arrow.Props) {
	return (
		<NavigationMenuPrimitive.Arrow
			className={cn(
				"flex transition-[left] duration-200 data-side-bottom:top-[-8px] data-side-left:right-[-13px] data-side-left:rotate-90 data-side-right:left-[-13px] data-side-right:-rotate-90 data-side-top:bottom-[-8px] data-side-top:rotate-180",
				className,
			)}
			data-slot="navigation-menu-arrow"
			{...props}
		>
			<ArrowSvg />
		</NavigationMenuPrimitive.Arrow>
	);
}

function ArrowSvg(props: React.ComponentProps<"svg">) {
	return (
		<svg aria-hidden="true" fill="none" height="10" viewBox="0 0 20 10" width="20" {...props}>
			<path
				className="fill-popover"
				d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
			/>
			<path
				className="fill-border dark:fill-none"
				d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
			/>
			<path
				className="dark:fill-border"
				d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
			/>
		</svg>
	);
}

export {
	NavigationMenu,
	NavigationMenuArrow,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuPopup,
	NavigationMenuPositioner,
	NavigationMenuTrigger,
	NavigationMenuViewport,
};
