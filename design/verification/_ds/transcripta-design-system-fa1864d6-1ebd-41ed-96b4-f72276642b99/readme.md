# Transcripta Design System — "Ink & Paper"

Transcripta (BSA 2026) turns scanned handwritten archives into verified text: upload a PDF, a multimodal model transcribes every page, a human verifies each page in under ten seconds. Confirmed words feed back into the prompt as a lexicon, so accuracy grows while you work. The system serves two surfaces: a marketing **landing page** and the **product app** (workspace, upload, presets, auth, and the core verification screen — scan beside editable text, hours-long evening sessions).

Direction is locked: **archival character, warm and precise — a well-lit reading room** (paper, ink, a wax-seal accent) — yet a fast, dense, keyboard-first working tool, never a decorative museum site. A full dark theme ("reading room at night") is first-class.

**Sources:** built from the founder's written brief only (pasted in chat). No Figma, codebase, logo files, or font binaries were provided.

## Content fundamentals
- Plain, matter-of-fact English; sentence case everywhere, including buttons ("Raise the limit", "Review the ready ones"). No exclamation marks, no emoji.
- Speaks to "you"; the product explains itself in full sentences: every wait states a reason and an approximate time ("Preparing the next pages · about 40 seconds") — never a bare spinner.
- Figures are precise and honest: "$0.98 / $10.00" (always two decimals on both numbers, spaces around the slash), "page 47 of 300", "88/88 pages".
- Document names read like catalog entries: "Parish register, 1887", "Hospital records, 1912", "Ledger, 1903".
- Status enum names (processing, done, budget_stop, failed) stay in code only; user-facing chips show display labels: "Processing", "Done", "Budget limit", "Failed".
- Canonical demo strings (use verbatim): the record "No. 15. Born on 11 January, Anna. Parents: peasant of Dykanka village, Petr Ivanenko and his lawful wife Maria, both Orthodox." with "Dykanka" and "Ivanenko" as context words, tooltip "from the lexicon, seen on 4 pages"; dropzone "Drag a PDF here, or choose a file" / "up to 500 MB, up to 500 pages".

## Visual foundations
- **Color.** Warm neutral ramp from ivory `--paper-100` to ink `--paper-900`; page ground is paper `--paper-200`. Never pure white, pure black, or cool grey. Accent is seal red `--seal-500` (#B23A2F). **Seal red means action** (primary buttons, links, focus ring, lexicon marks); **error red (`--err-*`, a cooler, darker carmine) means failure** — never the same color. Moss green = confirmed/success; amber = budget/warning. Full OKLCH ramps 100–900 per role in `tokens/colors.css`, each with a usage note.
- **Dark theme.** `[data-theme="dark"]` on any container. Warm near-black surfaces (hue ~75, never blue-grey), hairlines slightly lighter than surfaces, amber-tinted accents, warm off-white text. The scanned page stays light — the brightest object on screen.
- **Type.** Fraunces for display/headings/brand; Inter for UI body (13px dense default); JetBrains Mono with tabular numerals for ALL figures — page numbers, money, percentages, timestamps. A number never appears in Inter.
- **Spacing & density.** 4px scale. Work screens are compact: 28/32/36px controls; landing is generous (44px CTAs, wide margins).
- **Radii & elevation.** Crisp print-like radii: 2–6px, 6px is the maximum. Elevation = ivory over paper plus 1px hairlines; shadows are quiet, warm, and used on overlays only (tooltip, toast, dialog). No gradients, no glassmorphism, no blur.
- **Motion.** None. State changes are instant cuts — nothing slides or fades (`transition: none` is the default; 200ms × 300 pages is a minute of waiting). The only motion is the user's own scrolling/dragging.
- **States, derived not invented.** Hover deepens the fill; focus adds a 2px seal ring (`--ring`, both themes, never suppressed); active presses in (1px translate); disabled desaturates toward paper (opacity .5 + desaturate).
- **Backgrounds & imagery.** Flat paper grounds; no photos, textures, or illustrations were provided — the scan pane in demos is a labelled placeholder. Ask the user for real scans/imagery.
- **Links.** Seal-toned with a soft underline; hover darkens (see `css/base.css`).
- **Keyboard-first.** Every action shows its key as a physical `Kbd` keycap ("Enter Correct · E Edit · S Skip"); "?" opens a shortcut overlay.

## Iconography
- **No icon assets were provided.** The system is deliberately glyph-first: status and page states use typographic glyphs, distinguishable by shape, never color alone — ✓ confirmed, ✎ corrected, ↷ skipped, ● current, ▓ ready, ░ running, · queued, ! error, ▾ select caret, ◄ ► pager arrows. No emoji, ever.
- When a true icon is needed, use **Lucide only** (CDN: `https://unpkg.com/lucide@latest` + `lucide.createIcons()`, or inline copied Lucide SVGs), one stroke weight, at 16px (dense UI) or 20px, `stroke: currentColor`. This is a flagged substitution-by-policy — no icon files existed to copy.
- **The mark is "Nib"** (approved): a broad-nib calligraphic T in system ink with one seal-red drop low-right of the stem — two flat colors, no gradients. Full drawing `assets/logo.svg`; bolder small-size redraw `assets/logo-small.svg` for ≤20px (favicons, tiles) — use the redraw, never scale the full mark down. On seal tiles render it monochrome paper-100; in dark theme ink becomes #F3EDE1 and the drop seal-400. Lockup: 26px seal tile + Fraunces 600 wordmark (see `guidelines/wordmark.html`). Do not draw a logo.

## Money rule
Everywhere money appears: two decimals on both numbers, spaces around the slash — `$0.98 / $10.00` — in JetBrains Mono. The `BudgetMeter` component enforces it.

## Index
- `styles.css` — global entry (imports everything below). Consumers link this one file.
- `tokens/` — `fonts.css` (Google Fonts CDN), `colors.css` (ramps + light semantics), `colors-dark.css`, `typography.css`, `spacing.css`.
- `css/` — `base.css` (element defaults, focus ring, selection), `components.css` (all `tx-` component classes).
- `guidelines/` — foundation specimen cards (colors, type, spacing, brand rules).
- `components/` — the React kit, one card per group:
  - buttons/: **Button**, **Kbd**, **KbdHints**
  - forms/: **Input**, **Textarea**, **Select**, **Checkbox**, **Radio**
  - navigation/: **Tabs**, **PageStrip** (8 page states)
  - feedback/: **Chip**, **Tooltip**, **Toast**, **ProgressBar**, **BudgetMeter**, **QueuedChip**, **StateCard**
  - overlay/: **Dialog**
  - data/: **Table** (status-tinted rows)
  - verification/: **ContextMark** (the signature lexicon highlight), **SplitPane** (draggable, remembered), **Dropzone**
- `templates/` — copyable layout shells: `app-shell/` "Transcripta App Shell" (sidebar + topbar), `focus-shell/` "Transcripta Focus Shell" (verification, no sidebar), `auth-card/` "Transcripta Centered-Card Shell" (centered card).
- `ui_kits/app/` — interactive click-through: Documents, Presets, Upload, Verification, Auth, night-mode toggle.
- `ui_kits/landing/` — marketing page with hero, how-it-works, night-reading strip.
- `thumbnail.html`, `SKILL.md`.

## Intentional additions
The brief defined the full inventory (core kit + 10 product components); the only additions are `KbdHints` (row layout for keycap hints, required by the "shown beside actions" spec) and `QueuedChip` as its own component rather than a Chip variant, so its "never blocking" copy rule travels with it.

## Anti-goals
No generic 2024-SaaS look: no cool greys, gradients, glassmorphism, pill radii, emoji, spinners, or transition animations. No pure white/black. No mobile layouts, roles/teams, or account settings. The archival mood must never slow the tool down.
