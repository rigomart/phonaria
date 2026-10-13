# `@phonaria/ui`

Shared UI primitives for Phonaria: shadcn/ui components (`base-luma` style) on Base UI and Tailwind v4,
themed by Phonaria's palette and fonts in `src/styles/globals.css`.

This package is source-imported by the TanStack Start app and has no build step.

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

Render `<Toaster />` once with the app theme, then call `toast` anywhere:

```tsx
import { Toaster, toast } from "@phonaria/ui/components/sonner";

<Toaster theme={theme} position="top-center" />;
toast.error("Playback error", { description: "Could not play the audio." });
```

## Adding and updating components

Components are shadcn/ui source in the `base-luma` style (see `components.json`). Run the CLI from
`apps/phonaria`; it writes into this package:

```bash
bunx --bun shadcn@latest add <component>
bunx --bun shadcn@latest add <component> --diff <file>   # preview upstream changes
```

The CLI rewrites the `cn` import to a bare `"cn"` module; change it back to
`@phonaria/ui/lib/utils` and do not keep the `cn` package it adds. The state variants the components
use (`data-open:` and friends) are copied into `src/styles/shadcn.css` instead of importing the shadcn
package.

## Development

From repo root:

```bash
bun run --cwd packages/ui check-types
bun run --cwd packages/ui lint
```
