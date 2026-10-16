"use client";

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { cn } from "@phonaria/ui/lib/utils";

// shadcn has no Autocomplete. These parts follow its base-luma Combobox
// styles so the popup matches the other menus.

const Autocomplete = AutocompletePrimitive.Root;

const AutocompleteInput = AutocompletePrimitive.Input;

function AutocompleteContent({
	className,
	side = "bottom",
	sideOffset = 6,
	align = "start",
	alignOffset = 0,
	anchor,
	collisionAvoidance,
	...props
}: AutocompletePrimitive.Popup.Props &
	Pick<
		AutocompletePrimitive.Positioner.Props,
		"side" | "align" | "sideOffset" | "alignOffset" | "anchor" | "collisionAvoidance"
	>) {
	return (
		<AutocompletePrimitive.Portal>
			<AutocompletePrimitive.Positioner
				side={side}
				sideOffset={sideOffset}
				align={align}
				alignOffset={alignOffset}
				anchor={anchor}
				collisionAvoidance={collisionAvoidance}
				className="isolate z-50"
			>
				<AutocompletePrimitive.Popup
					data-slot="autocomplete-content"
					className={cn(
						"flex max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) flex-col overflow-hidden rounded-3xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 dark:ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
						className,
					)}
					{...props}
				/>
			</AutocompletePrimitive.Positioner>
		</AutocompletePrimitive.Portal>
	);
}

function AutocompleteList({ className, ...props }: AutocompletePrimitive.List.Props) {
	return (
		<AutocompletePrimitive.List
			data-slot="autocomplete-list"
			className={cn(
				"min-h-0 flex-1 scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 data-empty:p-0",
				className,
			)}
			{...props}
		/>
	);
}

function AutocompleteItem({ className, ...props }: AutocompletePrimitive.Item.Props) {
	return (
		<AutocompletePrimitive.Item
			data-slot="autocomplete-item"
			className={cn(
				"relative flex w-full cursor-default items-center gap-2.5 rounded-2xl px-3 py-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		/>
	);
}

export { Autocomplete, AutocompleteInput, AutocompleteContent, AutocompleteList, AutocompleteItem };
