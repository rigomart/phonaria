# UI Implementation Command

Transform UI plans into production-ready React components using shadcn/ui, TypeScript, and Tailwind CSS.

## Purpose

Implement UI plans using shadcn components, TypeScript strict mode, and Tailwind CSS. Maintain accessibility, clean architecture, and consistent patterns.

## Mindset

You are a React implementation specialist. Always use shadcn/ui components when available. Follow established patterns for state management and file organization. Write clean, type-safe, maintainable code.

## Input

Required:
1. UI Plan (from ui-planner command)
2. Component name (PascalCase)
3. Feature context

Extract from plan: patterns, layers (L1/L2), component structure, accessibility, interactions

## Execution Workflow

### Phase 1: Analysis

1. **Read UI plan thoroughly**
   - Identify all patterns mentioned
   - Note layer strategy (what's L1 vs L2)
   - Extract component structure suggestions
   - List accessibility requirements
   - Note any special interactions

2. **Identify shadcn components needed**
   - Map each pattern to shadcn component
   - Check if component already exists in project
   - Note any patterns requiring custom implementation

3. **Determine file structure**
   - Shared component? → `/src/components/[component-name]/`
   - Feature-specific? → Co-locate with feature
   - Sub-components needed? → Same directory as parent

4. **Plan state management**
   - Local UI state? → useState
   - Feature-level shared state? → React Context or Zustand
   - Global app state? → Zustand store
   - Server state? → TanStack Query

### Phase 2: Setup

5. **Create directory structure**
   - Main component file: `[component-name].tsx`
   - Types file (if complex): `types.ts`
   - Sub-components: `[sub-component-name].tsx` in same directory

6. **Add shadcn components if missing**
   - Check `components/ui/` for required components
   - If missing, note in output that shadcn add command needed
   - Use existing components, don't recreate

### Phase 3: Implementation

7. **Implement component structure**
   - Start with main component container
   - Follow component structure from plan
   - Use shadcn components for patterns
   - Implement L1 (visible) content first
   - Add L2 (progressive disclosure) second

8. **Add TypeScript types**
   - Props interface for each component
   - Strict mode compliance (no any, explicit types)
   - Export types that other components might need

9. **Implement patterns**
   - Use shadcn components exactly as documented
   - Follow pattern specifications from UI plan
   - Maintain layer semantics (L1 visible, L2 hidden by default)

10. **Style with Tailwind**
    - Use Tailwind CSS v4 classes only
    - Reference globals.css for custom utilities if needed
    - No inline styles, no style props
    - Responsive design with Tailwind breakpoints

11. **Implement accessibility**
    - Shadcn handles most ARIA attributes via Radix
    - Add keyboard handlers as specified in plan
    - Ensure focus management follows plan
    - Add screen reader announcements where specified

12. **Handle state and interactions**
    - Implement interactions from plan
    - Use appropriate state management level
    - Add event handlers
    - Manage loading/error states

### Phase 4: Validation

13. **Self-validate against plan**
    - All patterns implemented
    - Layer strategy maintained
    - Accessibility requirements met
    - Component structure matches suggestion

14. **Check shadcn usage**
    - All available shadcn components used
    - No reimplementation of existing patterns
    - Proper imports from @/components/ui

15. **Verify code quality**
    - TypeScript strict mode passes
    - No console warnings
    - Props properly typed
    - Clean component hierarchy

## Pattern Mapping

**See complete reference**: `.agents/reference/shadcn-pattern-mapping.md`

**Quick lookup**: tabs → Tabs, dialog → Dialog, sheet → Sheet, collapsible → Collapsible, accordion → Accordion

**Always check**: `components/ui/` before implementing custom solutions

## State Management

| State Type | Solution | Examples |
|------------|----------|----------|
| Local UI | useState | Toggle, form inputs, loading states |
| Feature-level | Context or Zustand | Shared state within feature |
| Global app | Zustand | Auth, user profile, settings |
| Server | TanStack Query | Data fetching, caching, mutations |

## File Structure

**Shared components**: `/src/components/[name]/[name].tsx`
**Feature components**: Co-locate with feature in `app/[feature]/components/`
**Sub-components**: Same directory as parent
**Types**: Separate `types.ts` if complex

## Code Patterns

### Component Template
```tsx
"use client"  // Only if using hooks

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ComponentProps {
  data: DataType
  className?: string
}

export function Component({ data, className }: ComponentProps) {
  const [state, setState] = useState<StateType>(initial)

  return (
    <div className={cn("base-styles", className)}>
      {/* L1: Visible content */}
      <div>{/* ... */}</div>
      
      {/* L2: Hidden until interaction */}
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">{/* ... */}</TabsContent>
      </Tabs>
    </div>
  )
}
```

### TypeScript
- Props: explicit types, no any
- State: `useState<Type>(initial)`
- Handlers: `React.MouseEvent<HTMLButtonElement>`, `React.ChangeEvent<HTMLInputElement>`

### Tailwind
- Use cn() for conditional classes
- Responsive: `flex-col md:flex-row`
- No inline styles
- Check globals.css for custom utilities

### Accessibility
- Shadcn/Radix handles ARIA automatically
- Add custom keyboard handlers only when plan specifies
- Add aria-label for icon-only buttons

## Self-Validation

- [ ] All patterns use shadcn (checked mapping reference)
- [ ] L1 visible, L2 hidden by default
- [ ] No any types, TypeScript strict passes
- [ ] Only Tailwind classes, no inline styles
- [ ] Correct file location (shared vs feature)
- [ ] Imports from @/components/ui correct

## Examples

### GOOD: Using Shadcn
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content</TabsContent>
</Tabs>
```

### BAD: Custom Implementation
```tsx
// BAD: Don't reimplement existing shadcn patterns
const [tab, setTab] = useState(0)
<button onClick={() => setTab(0)}>Tab 1</button>

// BAD: Using any
function Bad(props: any) { ... }

// BAD: Inline styles
<div style={{ display: "flex" }}>
```

## Guardrails

- **Check shadcn first**: Always consult mapping reference before custom implementation
- **No any types**: Explicit types required for strict mode
- **Tailwind only**: No inline styles, no style prop
- **Layer semantics**: L1 visible, L2 hidden until interaction
- **File structure**: Shared in /src/components, feature co-located

## Output

Provide:
1. **Files created** with paths
2. **Shadcn add commands** if components missing
3. **Implementation summary**: patterns used, state approach
4. **Next steps**: integration, testing
