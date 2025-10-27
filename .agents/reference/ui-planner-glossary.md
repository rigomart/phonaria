# UI Planner Glossary & Pattern Reference

Shared vocabulary for UI planning outputs. Reference this file instead of redefining concepts inside individual plans.

## Layers (L1–L2)

| Layer | Meaning | Typical Content | Common Patterns | Watch-outs |
|-------|---------|-----------------|-----------------|------------|
| `L1` | Immediately visible on page load; essentials that support the primary user goal | Critical status, core inputs, navigation, primary actions, key content | Inline status, persistent headers, main forms, tabs, breadcrumbs | Avoid hiding must-do actions; keep density manageable (5–7 items per group) |
| `L2` | Hidden by default, revealed through user action; secondary detail or complex flows | Advanced filters, help content, multi-step wizards, modals, optional settings | Collapsible, accordion, popover, dialog, drawer, sheet, hover-card | Ensure triggers are clear and discoverable; maintain focus management; provide exit paths |

**Choosing Layers:**
- **L1**: Content users need immediately upon arrival
- **L2**: Content that clarifies, extends, or provides alternatives to primary task
- Default: L1 for essential tasks, L2 for optional enhancements

**Note**: Layers communicate visibility and importance. Use "Why" field to explicitly state criticality.

## Pattern Hints

Interaction patterns describing user navigation and behavior without dictating implementation.

### Progressive Disclosure & Layering

#### Expandable Content
- `collapsible` — Single section that expands/collapses; good for optional detail within a view
- `accordion` — Multiple sections where opening one typically closes others; good for FAQ, settings categories where users explore one topic at a time
- `tabs` — Mutually exclusive content areas at same hierarchy; user switches between views while maintaining context

#### Overlays & Dialogs
- `tooltip` — Brief help text on hover/focus; non-interactive, purely informational
- `hover-card` — Rich preview card on hover for links and mentions; good for showing user profiles, link previews, or additional context without clicking
- `popover` — Lightweight non-modal overlay anchored to trigger; good for small forms, quick settings, or controls that don't require blocking the page
- `dialog` — Modal window that blocks background interaction; good for forms, data entry, or focused tasks that need completion
- `alert-dialog` — Blocking confirmation dialog for critical actions; good for warnings, confirmations, or destructive actions (delete, logout); cannot be dismissed by clicking outside
- `drawer` — Panel sliding from screen edge (typically bottom on mobile, side on desktop); good for mobile-friendly forms or supplementary content
- `sheet` — Side panel sliding from left/right; good for navigation, filters, settings panels, or detail views alongside main content

#### Navigation Patterns
- `dropdown-menu` — Menu of actions/options triggered by button; good for contextual actions
- `context-menu` — Menu triggered by right-click; good for item-specific actions
- `menubar` — Horizontal menu bar (like desktop apps); good for complex applications with many top-level actions
- `navigation-menu` — Complex navigation with submenus and categories; good for site-wide navigation
- `breadcrumb` — Path showing current location in hierarchy; good for deep navigation structures

#### Multi-Step & Wizards
- `wizard` — Linear multi-step journey with progress; good for onboarding, setup, or complex forms
- `stepper` — Progress indicator showing steps; can be linear or non-linear

### Selection & Input Patterns

#### Basic Input
- `form` — Standard form with fields; good for data collection with validation
- `input-group` — Multiple related inputs; good for grouped fields like name (first/last)
- `textarea` — Multi-line text input; good for longer content

#### Selection Controls
- `select` — Single selection from dropdown list; good for < 15 options
- `combobox` — Searchable select with autocomplete (uses command + popover pattern); good for many options or when search/filtering helps discovery
- `radio-group` — Single selection with all options visible; good for 2-5 mutually exclusive options
- `checkbox` — Multiple selections or single toggle; good for opt-ins or multiple choices
- `switch` — Binary on/off toggle; good for settings or feature flags
- `toggle-group` — Multiple mutually exclusive options as buttons; good for view modes or categories
- `slider` — Numeric value selection by dragging; good for ranges or visual adjustment (volume, brightness)

#### Special Input
- `calendar` — Date selection; good for scheduling, date ranges, booking
- `input-otp` — One-time password entry; good for 2FA codes
- `color-picker` — Color selection; good for customization or design tools

### Data Display Patterns

#### Content Organization
- `card` — Contained content block; good for grouping related information
- `table` — Tabular data display; good for structured data with sorting/filtering
- `data-table` — Enhanced table with sorting, filtering, pagination; good for large datasets
- `list` — Vertical arrangement of items; good for feeds, results, or sequential content
- `separator` — Visual divider between content; good for grouping without heavy chrome

#### Dynamic Content
- `carousel` — Horizontal scrolling/sliding through items; good for image galleries or featured content
- `scroll-area` — Custom scrollable region; good for constrained content areas
- `resizable` — Panels with adjustable sizing; good for split views or customizable layouts
- `infinite-scroll` — Load more on scroll; good for long feeds or search results

### Feedback & Status Patterns

#### User Feedback
- `toast` (sonner) — Temporary notification (auto-dismiss); good for background events, confirmations, and success messages
- `banner` — Persistent alert at top/bottom; good for system status or important announcements
- `alert` — Inline contextual message; good for validation errors or informational messages
- `inline-status` — Validation or status directly with the control; good for immediate feedback

#### Loading States
- `skeleton` — Loading placeholders matching content shape; good for perceived performance
- `spinner` — Loading indicator; good for short waits
- `progress` — Progress bar showing completion; good for uploads, processing, multi-step tasks

#### Status Display
- `badge` — Small status indicator or count; good for notifications, labels, or counts
- `avatar` — User/entity representation; good for profiles, comments, or presence
- `kbd` — Keyboard shortcut display; good for showing hotkeys

### Layout & Structure Patterns

#### Navigation Structure
- `sidebar` — Persistent side navigation; good for app-level navigation with many sections
- `sidebar-collapsible` — Sidebar that collapses to icons; good for maximizing content space while maintaining access

#### Utility Patterns
- `command` — Searchable list component enabling command palettes (Cmd+K), advanced search, or filterable lists; good for power users, quick navigation, or when building custom combobox-like interfaces
- `pagination` — Navigate through pages of content; good for large result sets
- `empty-state` — Display when no content exists; good for first-time users or empty results

### Teaching & Learning (specialized)
- `guided-tour` — Sequential overlays introducing interface elements; good for onboarding
- `micro-quiz` — Quick knowledge check; good for learning applications
- `comparison-view` — Side-by-side presentation; good for highlighting differences
- `contextual-hints` — Contextual tips alongside UI; good for progressive learning

## Pattern Selection Guide

### When to use Dialog vs Alert Dialog vs Drawer vs Sheet vs Popover vs Hover Card

| Pattern | Best for | Avoid when |
|---------|----------|------------|
| **Alert Dialog** | Confirmations for destructive/critical actions (delete, logout, irreversible changes) | Regular forms or data entry; user needs escape hatch |
| **Dialog** | Forms, data entry, editing tasks requiring focused completion | Critical warnings (use alert-dialog); mobile-first design (use drawer) |
| **Drawer** | Mobile-friendly forms, filters, or content panels (especially bottom drawer on mobile) | Desktop-only experience; critical blocking actions |
| **Sheet** | Side navigation, filters, settings panels, or detail views alongside main content | Content should block full attention; mobile-first design (use drawer) |
| **Popover** | Small forms (2-5 fields), quick settings, controls, or date pickers | Long forms, content requiring scrolling, critical actions |
| **Hover Card** | Rich previews for links (@mentions, usernames, external links) | Mobile interfaces (no hover); actionable content (use popover) |
| **Tooltip** | Brief non-interactive help text (keyboard shortcuts, icon labels) | Interactive content or rich formatting (use popover or hover-card) |

### When to use Select vs Combobox vs Radio vs Toggle Group

| Pattern | Best for | Avoid when |
|---------|----------|------------|
| **Select** | 5-15 options, familiar dropdown behavior | Many options (use combobox), < 5 options (use radio) |
| **Combobox** | Many options (>15), search helps discovery | Few options, selection is obvious |
| **Radio Group** | 2-5 mutually exclusive options, all visible | Many options (takes too much space) |
| **Toggle Group** | 2-5 options that are modes/views | Selection represents data input (use radio instead) |
| **Switch** | Single binary on/off setting | Multiple related options (use checkbox) |

### When to use Tabs vs Accordion vs Navigation Menu

| Pattern | Best for | Avoid when |
|---------|----------|------------|
| **Tabs** | Mutually exclusive content areas of equal importance | One section clearly more important, mobile-first |
| **Accordion** | Sequential content, FAQ, progressive disclosure | Users need to see multiple sections at once |
| **Navigation Menu** | Site-wide navigation with hierarchy | Simple linear navigation (use tabs or sidebar) |

## Accessibility Requirements

Focus on user needs and behavior, not implementation details.

### Keyboard Navigation

Describe expected keyboard behavior (Tab, Shift+Tab, Arrow keys, Enter, Space, ESC, shortcuts).

**Examples:**
- "Tab through form fields, Enter to submit"
- "Arrow keys navigate menu items, Enter selects, ESC closes"
- "Space toggles checkbox, Tab moves to next control"
- "Cmd/Ctrl+K opens command palette"

### Screen Reader Support

Note what needs announcement: dynamic updates, state changes, progress indicators, context and relationships.

**Examples:**
- "Announce validation errors immediately with field context"
- "Announce loading state and result count when search completes"
- "Communicate current step and total steps in wizard"
- "Announce toast notifications without stealing focus"

### Focus Management

Explain focus flow, trapping behavior, restoration, and indicator visibility.

**Examples:**
- "Dialog traps focus, returns to trigger button on close"
- "Drawer maintains focus within panel, ESC closes and restores focus"
- "Command palette focuses search input on open"
- "Accordion expands and moves focus to first interactive element"
- "Logical top-to-bottom, left-to-right flow through form"

### Other Considerations

Note when relevant: touch target sizing (min 44x44px), motion sensitivity, color dependency, timing requirements.

**Avoid**: ARIA attributes, HTML semantics, contrast ratios, implementation techniques.

## Naming Conventions

- Use **descriptive, user-facing language** for plan item names
- Good: "Search Filters", "Profile Editing Area", "Password Reset Form", "Command Palette"
- Avoid: "FilterPanel", "ProfileContainer", "PasswordResetComponent", "CmdK"
- **Title Case** for names: "Two-Factor Authentication Setup"
- **Natural phrases** (2-6 words): Keep names scannable and memorable
- Avoid technical jargon or implementation terms in names
