---
title: Wendy Planner — Design System
date: 2026-08-10
type: discovery
scope: internal
version: 1.0.0
name: Wendy Planner
description: >
  A dual-surface design system for a premium wedding management platform.
  The B2B planner dashboard prioritizes clarity and efficiency;
  the B2C guest invitation surfaces prioritize romance and editorial elegance.
colors:
  # --- Surfaces ---
  surface: '#f9f8f7'
  surface-dim: '#e8e6e4'
  surface-bright: '#ffffff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f2f0'
  surface-container: '#eeeceb'
  surface-container-high: '#e8e7e5'
  surface-container-highest: '#e3e1e0'
  on-surface: '#1c1b1a'
  on-surface-variant: '#4d4635'
  inverse-surface: '#2e2c2b'
  inverse-on-surface: '#f0efee'
  outline: '#7f7663'
  outline-variant: '#d0c5af'
  surface-tint: '#735c00'
  # --- Primary — Antique Gold (champagne warmth, premium CTA) ---
  primary: '#735c00'
  on-primary: '#ffffff'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#e9c349'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  # --- Secondary — Warm Warm Ash (neutral UI chrome) ---
  secondary: '#605e5c'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2df'
  on-secondary-container: '#666462'
  secondary-fixed: '#e5e2df'
  secondary-fixed-dim: '#c9c6c3'
  on-secondary-fixed: '#1c1b1a'
  on-secondary-fixed-variant: '#484745'
  # --- Tertiary — Deep Slate Blue (editorial headings, structural weight) ---
  tertiary: '#4e6073'
  on-tertiary: '#ffffff'
  tertiary-container: '#a2b5cb'
  on-tertiary-container: '#354759'
  tertiary-fixed: '#d1e4fb'
  tertiary-fixed-dim: '#b5c8df'
  on-tertiary-fixed: '#091d2e'
  on-tertiary-fixed-variant: '#36485b'
  # --- Status (RSVP badges, guest list) ---
  status-confirmed-bg: '#dcf5e8'
  status-confirmed-text: '#1a5c35'
  status-pending-bg: '#fff4e0'
  status-pending-text: '#7c4f00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#5a3535'
  # --- Background ---
  background: '#f9f8f7'
  on-background: '#1c1b1a'
  surface-variant: '#e3e1e0'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  base: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
components:
  # --- Actions ---
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.base}"
    padding: "12px 24px"
    typography: "{typography.label-caps}"
  button-primary-hover:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    rounded: "{rounded.base}"
    padding: "11px 23px"
    typography: "{typography.label-caps}"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.on-surface}"
  # --- Forms ---
  input-field:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.base}"
    padding: "12px 16px"
    typography: "{typography.body-md}"
  input-field-focus:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
  # --- Guest RSVP status badges ---
  badge-confirmed:
    backgroundColor: "{colors.status-confirmed-bg}"
    textColor: "{colors.status-confirmed-text}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
    typography: "{typography.label-caps}"
  badge-pending:
    backgroundColor: "{colors.status-pending-bg}"
    textColor: "{colors.status-pending-text}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
    typography: "{typography.label-caps}"
  badge-declined:
    backgroundColor: "{colors.error-container}"
    textColor: "{colors.on-error-container}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
    typography: "{typography.label-caps}"
  # --- Containers ---
  card-dashboard:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  card-invitation:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "40px"
  # --- Data ---
  table-row:
    backgroundColor: "{colors.surface-container-lowest}"
    textColor: "{colors.on-surface}"
    height: 56px
    typography: "{typography.data-tabular}"
  table-row-hover:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
---

## Overview

Wendy Planner lives at the intersection of two very different emotional registers. For the Wedding Planner, it is a professional command centre: dense, reliable, fast, and always under control. For the wedding guest, it is the first sensory touchpoint of someone's most important day: warm, romantic, and full of quiet ceremony.

The design system resolves this tension through **context-aware surfaces**. The B2B planner dashboard adopts a **Modern Professional / Editorial Minimalist** register — generous whitespace, restrained colour use, and a strict typographic hierarchy that manages cognitive load across complex data. The B2C guest invitation adopts an **Emotional / Ceremonial** register — full-bleed imagery, generous vertical breathing room, serif display typography, and warm tonal layers that feel like opening a fine paper envelope.

**Brand personality:** Sophisticated, calm, organised, and trustworthy for planners. Graceful, personal, and celebratory for guests.

**Guiding principle:** Every surface serves a single audience at a time. The planner dashboard never competes for emotional attention with the invitation. The guest invitation never feels like a software product.

**Audience and constraints:** Optimised for PC and tablet. Minimum 768px viewport is assumed for all layout decisions. Mobile is not in scope for the MVP.

## Colors

The palette is anchored by **Antique Gold** as the sole emotional accent, set against a **Warm Parchment** background family. The combination evokes a handwritten invitation on fine cream paper with a gold-foil wax seal — timeless, premium, unhurried.

- **Primary — Antique Gold (`#735c00`):** Reserved exclusively for interactive calls-to-action (primary buttons, active tabs, focus rings, progress indicators). Its scarcity is the source of its power. Using it on decorative elements dilutes its signal.
- **Primary-Container — Champagne Gold (`#d4af37`):** The warm, lighter sibling. Used for hover states on primary buttons and as the accent fill on invitation decorative dividers. Never used as text background — it fails WCAG AA at small sizes.
- **Secondary — Warm Ash (`#605e5c`):** The system's neutral workhorse. Used for secondary labels, de-emphasised metadata, disabled states, and divider lines. Keeps the dashboard calm without introducing visual noise.
- **Tertiary — Deep Slate Blue (`#4e6073`):** The editorial anchor. Preferred for large headline text in invitation modules, section titles in the planner sidebar, and primary navigation labels. It reads as sophisticated and intentional rather than cold.
- **Surface family (Warm Parchment `#f9f8f7` → White `#ffffff`):** A tonal gradient from the overall page background down to the smallest content card. The barely-there warm gray wash prevents the harshness of a pure white interface while maintaining a refined, paper-like warmth.
- **Status colours (RSVP badges):** Warm desaturated sage (`#dff0e7` / `#1f4a30`) for Confirmed, warm parchment-amber (`#f5edd8` / `#6b4400`) for Pending, and muted warm rose (`#eddfdd` / `#5a3535`) for Declined. All three are pulled from the same warm parchment family so they harmonise with the gold palette rather than reading as clinical traffic-light colours.

## Typography

Two fonts divide the system's responsibilities with deliberate clarity.

- **Playfair Display (display, headlines):** A high-contrast transitional serif that carries centuries of association with elegance and ceremony — think engraved stationery, editorial mastheads, and fine print. It is used for every headline that belongs to the storytelling layer: invitation module titles, the couple's names in display contexts, the wedding date in large format, and page-level section titles in the planner. Its optical weight commands attention without aggression.
- **Inter (body, UI, data):** An exceptionally legible sans-serif designed for screens. Its high x-height and open apertures make it the correct choice for every information-dense context: guest list rows, form labels, dashboard navigation, metadata, and status indicators. It never competes with Playfair Display — it supports it.
- **i18n:** Both families provide full coverage of the Latin Extended character set, ensuring that Spanish accented characters (á, é, í, ó, ú, ñ, ü) render correctly and consistently across all locales.
- **Tabular data:** The `data-tabular` token activates proportional figures and consistent column alignment in guest list tables. Never use a display or body variant in tabular cells.

## Layout

The system employs two distinct layout modes mapped directly to its two audiences.

**Dashboard — Fixed Grid:**
- 12-column grid, 1280px maximum container width, 24px gutters.
- A persistent left sidebar (240px) contains primary navigation; the remaining 1040px is the work area.
- All component heights are multiples of the 8px unit (40px button height, 56px table row height, 48px input height). This rigour creates visual rhythm that makes dense data easier to scan.

**Invitation — Fluid Editorial:**
- Single-column, centred, capped at 760px for readable line lengths in prose modules.
- Full-bleed sections (e.g., hero, location map, gallery) break out of the 760px column and extend edge-to-edge.
- Vertical padding between modules: 80px on desktop, 48px on mobile (when mobile layout is added in a future iteration).
- The invitation is intentionally spacious. Whitespace communicates that the event being celebrated is worth the pause.

**Shared principles:**
- 40px horizontal margin on desktop, 16px on mobile.
- Navigation and sidebar elements never appear on guest-facing invitation pages.

## Elevation & Depth

Depth is communicated through **tonal surface shifts** rather than heavy shadows. Heavy drop shadows would undermine the airy, paper-like quality of the palette.

- **Layer 0 — Page background:** `surface` (`#f9f8f7`). The base canvas.
  - **Layer 1 — Content cards and panels:** `surface-container-lowest` (`#ffffff`). A clean white card sits slightly above the warm gray background with a barely-perceptible surface change.
  - **Layer 2 — Raised or highlighted panels:** `surface-container-low` (`#f3f2f0`). Used for sidebar items, secondary info panels, and invitation module alternating backgrounds.
- **Shadow:** A single global shadow token — `0px 2px 12px rgba(18, 30, 31, 0.06)` — applied only to cards and modal dialogs. It is soft, ambient, and directionally neutral, like light diffused through sheer fabric.
- **Interactive hover lift:** On hoverable cards, the shadow deepens to `0px 4px 20px rgba(18, 30, 31, 0.10)` and the border transitions from `outline-variant` to a `1px solid primary-container` gold line. The transition duration is 150ms ease-out.

## Shapes

The shape language is **Softly Rounded**. Sharp corners would read as harsh and utilitarian; excessively round shapes would feel infantile. The current scale targets the sweet spot: professional restraint that remains warm.

- **`rounded.sm` (4px):** Checkboxes, small inline chips, table cell icons.
- **`rounded.base` (8px):** All interactive controls — buttons, input fields, select dropdowns, toggle switches. This is the system's default interactive radius.
- **`rounded.md` (12px):** Secondary cards, tooltip containers, dropdown menus.
- **`rounded.lg` (16px):** Primary dashboard cards, photo thumbnails, the wedding summary panel.
- **`rounded.xl` (24px):** Invitation module containers and full-bleed photo frames on the guest invitation. Larger radii on these surfaces soften the "app" feeling and lean into the paper/stationery metaphor.
- **`rounded.full` (9999px):** RSVP status badges, avatar bubbles, progress pill tracks. Full-pill shapes distinguish status indicators from content containers at a glance.

## Components

### Primary Button
Gold background (`primary`), white text (`on-primary`), `rounded.base` radius, uppercase `label-caps` typography. No gradients, no shadows on the button itself. The solid gold surface already communicates interactivity. On hover: background transitions to `primary-container` with `on-primary-container` text in 100ms.

### Secondary Button
Transparent background with a `1px solid primary` border, `primary` text, same radius and typography as primary. On hover: background fills with `secondary-container`. Use when two actions of unequal importance appear together — the gold button always wins the hierarchy.

### Input Fields
`surface-container-lowest` background, `1px solid outline-variant` border, `rounded.base`. Label in `label-caps` sits above the input with 4px spacing. Placeholder text uses `secondary`. Focus state: border becomes `1px solid primary` with a `0 0 0 3px rgba(115, 92, 0, 0.12)` outer glow. Error state: border becomes `error`, helper text appears in `error` below the field.

### RSVP Status Badges
Pill-shaped (`rounded.full`) with the three status variants — Confirmed (sage/green), Pending (amber), Declined (rose). The low-opacity background and high-contrast text ensure readability while keeping the colour loud enough to scan a 200-row guest list at speed. Always pair a status badge with the guest name; never display it in isolation.

### Guest List Table Row
56px row height, `data-tabular` typography for all cell content, `1px solid outline-variant` bottom border. On hover, the row background transitions to `surface-container-low`. Selection state uses a `2px solid primary-container` left accent border. Action icons (edit, delete) appear on row hover only — they are hidden at rest to reduce visual noise in large lists.

### Dashboard Card
`surface-container-lowest` background, `rounded.lg` radius, `24px` padding, ambient shadow. Cards always carry a single clear title in `headline-sm` and one primary data point. Avoid mixing unrelated metrics in a single card.

### Invitation Module Container
`surface-container-low` background, `rounded.xl` radius, `40px` padding. Used as the wrapper for each invitation section (Story, Location, Schedule, etc.). Background alternates between `surface-container-low` and `surface-container-lowest` for visual rhythm across consecutive modules.

### Progress Tracker / Countdown
A thin 4px gold bar (`primary-container`) on a `secondary-container` track. Used for wedding-day countdowns in the invitation and for task-completion indicators in the planner dashboard. Pair with a numeric readout in `headline-sm` (Playfair Display) to give it emotional weight.

## Do's and Don'ts

### Do's

- **Do** use `display-lg` / `headline-md` (Playfair Display) for the couple's names and the wedding date on all guest-facing surfaces. This is the single most important typographic moment in the product.
- **Do** use `primary` Gold as the sole accent colour for interactive elements in the dashboard. Its scarcity is deliberate.
- **Do** provide 80px or more of vertical breathing room between invitation modules on desktop. Space = ceremony.
- **Do** use the full-pill `rounded.full` shape exclusively for status badges and avatar chips — reserving the shape for these elements makes them instantly scannable in dense tables.
- **Do** write all UI labels, error messages, and navigation items in `label-caps` (Inter, 12px, 600 weight, tracked). This typographic signature unifies the dashboard chrome and clearly separates UI chrome from content.
- **Do** maintain the `data-tabular` token in all table cells with numeric or date content. Proportional figures cause column misalignment that degrades trust in data accuracy.
- **Do** support English and Spanish in every UI string from day one. All `i18n` keys must be provided for both locales before a component ships.

### Don'ts

- **Don't** use `primary` Gold on decorative shapes, dividers, or illustration fills. Overuse destroys the contrast budget and cheapens the premium signal.
- **Don't** render Playfair Display below 20px. Its high-contrast stroke design degrades at small sizes; switch to Inter (`body-sm` or `label-caps`) for any text smaller than that.
- **Don't** use full-bleed images on the planner dashboard. Full-bleed imagery belongs exclusively to the guest invitation surfaces. The dashboard must remain a calm, distraction-free work environment.
- **Don't** apply the ambient card shadow to inline table rows, form fields, or navigation items. Shadow is reserved for floating surfaces (cards, modals, dropdowns) that exist above the page plane.
- **Don't** use more than two type sizes on a single card or panel. Choose one primary size for the data point and one secondary size for the label; introduce a third only when the design review explicitly approves it.
- **Don't** ship a UI string without its Spanish equivalent. The bilingual requirement is an architectural constraint, not an afterthought — untranslated strings are treated as bugs.
- **Don't** use red (`error`) for any RSVP-related status other than Declined / error states. Red carries an alarming connotation that is jarring in a celebratory context. Use the muted rose `error-container` for the declined badge background instead.