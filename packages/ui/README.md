# `@phonaria/ui`

Shared UI primitives for Phonaria (Base UI + Tailwind v4).

This package is intentionally **source-imported** (no build step). Next.js apps should enable
`transpilePackages` for `@phonaria/ui`.

## Imports

- Styles: `@phonaria/ui/globals.css`
- Components: `@phonaria/ui/components/<name>`
- Lib utilities: `@phonaria/ui/lib/<name>`
- Hooks: `@phonaria/ui/hooks/<name>`

Example:

```ts
import { Button } from "@phonaria/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@phonaria/ui/components/popover";
```

## Base UI pattern notes

Many components are built on `@base-ui/react` and use Base UI’s `render` prop instead of Radix’s
`asChild`.

Example:

```tsx
<Popover>
  <PopoverTrigger render={<Button variant="outline" />}>Open</PopoverTrigger>
  <PopoverContent>…</PopoverContent>
</Popover>
```

## Toasts

Add providers once (typically in your app-level client `Providers` component):

```tsx
import { AnchoredToastProvider, ToastProvider } from "@phonaria/ui/components/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider position="top-center">
      <AnchoredToastProvider>{children}</AnchoredToastProvider>
    </ToastProvider>
  );
}
```

Use the managers to show notifications:

```ts
import { anchoredToastManager, toastManager } from "@phonaria/ui/components/toast";

toastManager.add({ title: "Saved", type: "success" });
anchoredToastManager.add({
  title: "Copied!",
  positionerProps: { anchor: someElement },
  data: { tooltipStyle: true },
});
```

## Development

From repo root:

```bash
bun --cwd packages/ui check-types
bun --cwd packages/ui lint
```
