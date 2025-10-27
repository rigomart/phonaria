# Shadcn Pattern Mapping Reference

Canonical mapping of UI patterns to shadcn/ui components.

## Direct Pattern Mappings

| Pattern | Shadcn Component | Import |
|---------|------------------|--------|
| tabs | Tabs, TabsList, TabsTrigger, TabsContent | @/components/ui/tabs |
| dialog | Dialog, DialogContent, DialogHeader, DialogTitle | @/components/ui/dialog |
| alert-dialog | AlertDialog, AlertDialogContent, AlertDialogHeader | @/components/ui/alert-dialog |
| sheet | Sheet, SheetContent, SheetHeader, SheetTitle | @/components/ui/sheet |
| drawer | Drawer, DrawerContent, DrawerHeader, DrawerTitle | @/components/ui/drawer |
| collapsible | Collapsible, CollapsibleTrigger, CollapsibleContent | @/components/ui/collapsible |
| accordion | Accordion, AccordionItem, AccordionTrigger, AccordionContent | @/components/ui/accordion |
| popover | Popover, PopoverTrigger, PopoverContent | @/components/ui/popover |
| hover-card | HoverCard, HoverCardTrigger, HoverCardContent | @/components/ui/hover-card |
| tooltip | Tooltip, TooltipTrigger, TooltipContent, TooltipProvider | @/components/ui/tooltip |
| dropdown-menu | DropdownMenu, DropdownMenuTrigger, DropdownMenuContent | @/components/ui/dropdown-menu |
| context-menu | ContextMenu, ContextMenuTrigger, ContextMenuContent | @/components/ui/context-menu |
| select | Select, SelectTrigger, SelectValue, SelectContent, SelectItem | @/components/ui/select |
| radio-group | RadioGroup, RadioGroupItem | @/components/ui/radio-group |
| checkbox | Checkbox | @/components/ui/checkbox |
| switch | Switch | @/components/ui/switch |
| slider | Slider | @/components/ui/slider |
| button | Button | @/components/ui/button |
| input | Input | @/components/ui/input |
| textarea | Textarea | @/components/ui/textarea |
| form | Form (with react-hook-form) | @/components/ui/form |
| card | Card, CardHeader, CardTitle, CardContent, CardFooter | @/components/ui/card |
| badge | Badge | @/components/ui/badge |
| avatar | Avatar, AvatarImage, AvatarFallback | @/components/ui/avatar |
| skeleton | Skeleton | @/components/ui/skeleton |
| progress | Progress | @/components/ui/progress |
| toast | Use sonner | @/components/ui/sonner |
| alert | Alert, AlertTitle, AlertDescription | @/components/ui/alert |
| separator | Separator | @/components/ui/separator |
| scroll-area | ScrollArea | @/components/ui/scroll-area |
| table | Table, TableHeader, TableBody, TableRow, TableCell | @/components/ui/table |

## Composite Patterns

### combobox
Combine Command + Popover:
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button>Select...</Button>
  </PopoverTrigger>
  <PopoverContent>
    <Command>
      <CommandInput />
      <CommandList>
        <CommandItem>...</CommandItem>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

### data-table
Use Table component + TanStack Table for sorting/filtering

## Layout Patterns (Custom Implementation)

| Pattern | Tailwind Implementation |
|---------|------------------------|
| columns | `grid grid-cols-2 gap-4` or `flex gap-4` |
| grid | `grid grid-cols-3 gap-4` with responsive breakpoints |
| split-view | `flex flex-col md:flex-row` with divider |
| sidebar-layout | `flex` with fixed sidebar and `flex-1` content area |
