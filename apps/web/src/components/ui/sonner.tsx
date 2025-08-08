import type { ToasterProps } from "sonner";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const theme = (props.theme ?? "system") as ToasterProps["theme"];

	return (
		<Sonner
			theme={theme}
			className="toaster group"
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
