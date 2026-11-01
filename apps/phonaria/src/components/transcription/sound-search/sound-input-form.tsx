import { Button } from "@phonaria/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupButton } from "@phonaria/ui/components/input-group";
import { Popover, PopoverContent } from "@phonaria/ui/components/popover";
import { ChevronDown, Delete, SendHorizontal, X } from "lucide-react";
import { type ReactNode, useId, useRef, useState } from "react";
import { soundsToIpa } from "@/lib/sound-search/search";
import { cn } from "@/lib/utils";
import { SoundKeys } from "./sound-keys";
import { useSoundSearch } from "./use-sound-search";

/** On /search each pick already updates the results, so the search button just closes the keys. */
export function SoundInputForm({ leading }: { leading: ReactNode }) {
	const { sounds, removeLast, clear, submit, live } = useSoundSearch();
	const opensOnResults = sounds.length > 0;
	const [open, setOpen] = useState(!opensOnResults);
	const rowRef = useRef<HTMLDivElement>(null);
	const fieldRef = useRef<HTMLDivElement>(null);
	const panelId = useId();

	const hasSounds = sounds.length > 0;

	const search = () => {
		if (!hasSounds) return;
		setOpen(false);
		if (!live) submit();
	};

	const handleFieldKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" && hasSounds) {
			event.preventDefault();
			search();
		} else if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			setOpen(true);
		} else if (event.key === "Backspace") {
			event.preventDefault();
			removeLast();
		} else if (event.key === "Escape" && !open && hasSounds) {
			clear();
		}
	};

	return (
		<Popover
			open={open}
			onOpenChange={(next, details) => {
				// The field and the chevron open and toggle it themselves. Pressing
				// either, or moving focus to it, must not close it first, or the click
				// that follows would open it again.
				const event = details.event;
				const inRow = (node: EventTarget | null | undefined) =>
					node instanceof Node && !!rowRef.current?.contains(node);
				if (
					!next &&
					((details.reason === "outside-press" && inRow(event?.target)) ||
						(details.reason === "focus-out" &&
							event instanceof FocusEvent &&
							inRow(event.relatedTarget)))
				) {
					return;
				}
				setOpen(next);
			}}
		>
			<div ref={rowRef} className="flex w-full flex-row gap-2">
				<InputGroup className="h-10 flex-1">
					<InputGroupAddon align="inline-start">{leading}</InputGroupAddon>
					<div
						ref={fieldRef}
						role="combobox"
						tabIndex={0}
						aria-label="Sounds to find"
						aria-expanded={open}
						aria-haspopup="dialog"
						aria-controls={panelId}
						data-slot="input-group-control"
						onClick={() => setOpen(true)}
						onKeyDown={handleFieldKeyDown}
						className="flex h-full min-w-0 flex-1 cursor-text items-center overflow-x-auto pl-1.5 text-base outline-none"
					>
						{hasSounds ? (
							<span className="whitespace-nowrap">
								<span className="text-muted-foreground">/</span>
								{soundsToIpa(sounds)}
								<span className="text-muted-foreground">/</span>
							</span>
						) : (
							<span className="truncate text-muted-foreground md:text-sm">
								Pick the sounds you heard...
							</span>
						)}
					</div>
					<InputGroupAddon align="inline-end">
						{hasSounds ? (
							<>
								<InputGroupButton
									size="icon-xs"
									aria-label="Remove the last sound"
									onClick={removeLast}
								>
									<Delete />
								</InputGroupButton>
								<InputGroupButton size="icon-xs" aria-label="Clear sounds" onClick={clear}>
									<X />
								</InputGroupButton>
							</>
						) : null}
						<InputGroupButton
							size="icon-xs"
							aria-label={open ? "Hide sound keys" : "Show sound keys"}
							aria-expanded={open}
							onClick={() => setOpen(!open)}
						>
							<ChevronDown className={cn("transition-transform", open && "rotate-180")} />
						</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>
				<Button
					type="button"
					size="icon-lg"
					aria-label="Find words"
					aria-disabled={!hasSounds}
					onClick={search}
					className="aria-disabled:cursor-default aria-disabled:opacity-50 aria-disabled:hover:bg-primary aria-disabled:active:translate-y-0"
				>
					<SendHorizontal />
				</Button>
			</div>

			<PopoverContent
				anchor={rowRef}
				align="start"
				sideOffset={6}
				collisionAvoidance={{ side: "none" }}
				id={panelId}
				finalFocus={fieldRef}
				aria-label="Sound keys"
				onKeyDown={(event) => {
					if (event.key === "Backspace") {
						event.preventDefault();
						removeLast();
					}
				}}
				className="w-(--anchor-width) max-w-(--available-width) gap-0 p-2"
			>
				<SoundKeys onDone={() => setOpen(false)} />
			</PopoverContent>
		</Popover>
	);
}
