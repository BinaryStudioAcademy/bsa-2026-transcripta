# Transcripta — Claude Design Prompt Pack

This pack is the complete set of prompts for generating Transcripta's visual design in claude.ai/design ("Claude Design"), from the design system through nine screen stages.
The stages run **in order** — each later stage assumes every earlier one is finished and approved.
Stage 1 creates the "Ink & Paper" design system; Stages 2–10 generate screens on top of that published system.
Claude Design cannot see this repo or its docs, so every prompt below is self-contained: paste it as-is.
Each stage ends with a PO checklist — do not approve a stage until every box can be ticked.

## How to run

- Work in **claude.ai/design**. Model picker: **Fable 5 (High)** for every stage.
- **Stage 1** goes into **Create design system → Create here**: paste the BLURB block into the "Company name and blurb" field and the NOTES block into the "Any other notes?" field — both verbatim — then "Continue to generation".
- Every later stage is a **New design project** with the published **Transcripta** design system attached via the **Design system** chip in the composer. Never generate a screen without the chip.
- Iteration idiom: each turn yields numbered options (1a/1b/1c…). Reply "go with 1a", "combine 1a with 2c", or "more variations on 1b". Several stage prompts contain pre-written follow-up turns — paste them only after picking a variant.
- After the design system is approved: **Publish** it and **Set as org default**.
- At the end of the pack, export/download all artifacts (canvas files, styles.css, theme.json, component pages) into this repo's `design/` folder.

## Stage 1 — Design system

Create design system → Create here. Paste the two blocks below verbatim.

**BLURB** (field: "Company name and blurb"):

````text
Transcripta (BSA 2026) turns scanned handwritten archives into verified text: a user uploads a PDF, a multimodal model transcribes every page, and a human verifies each page in under ten seconds. Confirmed words feed back into the prompt as a lexicon, so accuracy grows while you work. Design direction is locked: "Ink & Paper" — archival character, warm and precise, like a well-lit reading room (paper, ink, a wax-seal accent) — yet a fast, dense, keyboard-first working tool, never a decorative museum site. The system must serve both a marketing landing page and hours-long evening verification sessions, so a full dark theme is first-class, not an afterthought.
````

**NOTES** (field: "Any other notes?"):

````text
CONTEXT. The core loop is a verification screen: scanned page image beside editable transcription text, hours-long evening sessions, target under 10 seconds per page. Every choice below serves speed and legibility.

COLOR (starting hexes; derive full OKLCH tonal ramps 100–900 per role; give every token a one-line usage note):
- Background paper #F6F1E7; raised surfaces ivory #FFFDF8; text ink #211C14; secondary text #6B6254; hairlines ~#E8E0D0. Elevation = ivory over paper plus hairlines; shadows quiet, warm, overlays only.
- Accent seal red #B23A2F — primary actions, links, focus ring, and the inline context-word highlight (the product's signature element).
- Success/confirmed: moss green #4A7C59. Warning/budget: amber #B7791F.
- Error: a distinctly cooler/darker red than the seal accent, with its own ramp. Readme rule: seal red means action, error red means failure — never the same color.

DARK THEME — required, first-class: "reading room at night". Near-black warm surfaces (never blue-grey, never pure black); the scanned page image stays light — the brightest object on screen; amber-tinted accents; hairlines turn slightly lighter than surfaces. Every component specimen renders in BOTH themes; tune for low-light comfort.

TYPE. Fraunces for display/headings/brand. Inter for UI body. JetBrains Mono with tabular numerals for ALL figures — page numbers, money, CER percentages, timestamps; a number never appears in Inter.

ICONS. Lucide only; one stroke weight; 16/20px sizes.

DENSITY & MOTION. 4px spacing scale: compact on work screens (32–36px controls), generous on landing. Crisp small radii — print, not pill. NO transition animations anywhere in the verification flow (200 ms × 300 pages = a minute of pure waiting) — state changes are instant cuts, nothing slides or fades.

INTERACTION. Keyboard-first — the mouse cannot reach the required speed. Visible focus everywhere: a 2px seal-red ring, both themes, never suppressed. States are derived, not invented: hover deepens the fill, focus adds the ring, active presses in, disabled desaturates toward paper.

CORE KIT — specify with full states, not just names: buttons (primary = seal-red fill; secondary = quiet outline on ivory; ghost; destructive = error red — each with hover/focus/active/disabled); inputs, select, textarea, radio, checkbox; tabs; chips/tags in every status color; tooltip; toast; modal/dialog with backdrop; table with themed header and hairline rows.

LAYOUT SHELLS — ship as copyable templates/ starting points; every product screen composes from one of these (this is what keeps screens consistent):
1. App shell — left sidebar ~232px on paper: brand lockup (mark tile ~26px + wordmark), nav items "Documents" and "Presets" with a clear active state, user row at the bottom (email + sign out); topbar with the page title in the display serif, right side free for chips and meters; content area below. Used by the workspace, upload, and preset screens.
2. Focus shell — for verification and ground-truth: NO sidebar; one slim full-width header plus edge-to-edge content — every pixel serves the work.
3. Centered-card shell — auth: brand lockup over a raised ivory card on the paper ground.
(The landing page uses its own generous marketing layout, no shell template needed.)

PRODUCT COMPONENTS — beyond the core kit, the system MUST include:
1. kbd keycaps — physical raised keys (not bordered text), mono labels, rest + pressed; shown beside actions ("Enter Correct · E Edit · S Skip"); "?" opens a shortcut overlay.
2. Page-strip pager with 8 page states: confirmed ✓, corrected ✎, skipped ↷, current ●, ready ▓, running ░, queued ·, error !. One specimen row shows all 8: ◄ 44✓ 45✓ 46✎ [47●] 48▓ 49▓ 50▓ 51· ► with legend "▓ ready ░ running · queued". Distinguishable by glyph/shape, not color alone; hover shows a page thumbnail.
3. Inline context-word highlight mark — seal-red tint on lexicon words inside transcription text, with tooltip; legible in both themes.
4. Budget meter — "$spent / $limit" in mono, with amber warning and hard-stop ("$10.00 / $10.00" + "Raise the limit") states.
5. Progress bars — determinate, mono captions ("dykanka-1887.pdf · 180 MB · 71%"; "page 48 of 50 · about 40 seconds"); never an endless spinner — always a reason and an approximate time.
6. Split-pane with draggable divider — scan image vs. editable text; visible grab handle; position remembered.
7. Status-distinct table rows — rows visibly styled by status; budget_stop and failed must read unmistakably different from processing/done — the states demanding user action.
8. Dropzone — "Drag a PDF here, or choose a file" / "up to 500 MB, up to 500 pages"; rest, drag-over (seal tint), file-selected, rejected states.
9. Empty and degraded state patterns — one card anatomy (headline, reason, estimate, action) covering: queue slow ("Preparing the next pages · about 40 seconds" + "Review the ready ones" / "Pause"); budget exhausted (+ raise limit); service unavailable (+ "Try again"); page failed ("Failed after 3 attempts" + "Re-read" / "Type it by hand"); plus a plain empty state.
10. Queued-actions chip — e.g. "3 unsaved actions"; informational, never blocking.

SAMPLE CONTENT — everything in English; use these strings verbatim in component demos:
- Active document: "Parish register, 1887"; cursor at page 47 of 300; budget "$0.98 / $10.00".
- Record text: "No. 15. Born on 11 January, Anna. Parents: peasant of Dykanka village, Petr Ivanenko and his lawful wife Maria, both Orthodox." — with "Dykanka" and "Ivanenko" as highlighted context words; tooltip: "from the lexicon, seen on 4 pages".
- Other list rows: "Hospital records, 1912" — done, 88/88 pages, $2.14 / $10.00; "Ledger, 1903" — budget_stop, 12/240 pages, $10.00 / $10.00.
- Money format rule, everywhere money appears: always two decimals on both numbers, spaces around the slash — "$0.98 / $10.00".

ANTI-GOALS. No generic 2024-SaaS look (cool greys, gradients, glassmorphism) — exactly what this direction exists to avoid. No pure white or pure black. No invented features. No mobile versions, no roles/teams, no account settings. The archival mood must never slow the tool down.
````

Before approving, check:

- [ ] Full OKLCH tonal ramps (100–900) exist for every color role, derived from the starting hexes — paper, ivory, ink, secondary, hairline, seal red, moss green, amber, error red
- [ ] Error red is distinctly cooler/darker than seal red #B23A2F — hold swatches side by side; they must never read as the same color
- [ ] Dark theme is first-class ("reading room at night"): warm near-black surfaces, amber-tinted accents, and the scanned-page demo stays light as the brightest object
- [ ] Core kit pages exist with full state coverage: button variants (primary/secondary/ghost/destructive) each with hover/focus/active/disabled, form controls, tabs, chips in every status color, tooltip, toast, modal, themed table
- [ ] The three layout shells ship as copyable templates: app shell (sidebar with Documents/Presets nav + active state + user row, topbar with display-serif page title), focus shell (no sidebar, slim header), centered-card auth shell — and the readme says screens must compose from them
- [ ] All 10 product-specific components are in the catalogue: kbd keycaps, 8-state page-strip pager, context-word highlight mark with tooltip, budget meter, progress bars, split-pane with draggable divider, status-distinct table rows, dropzone, empty/degraded patterns, queued-actions chip
- [ ] Page-strip specimen shows the exact row ◄ 44✓ 45✓ 46✎ [47●] 48▓ 49▓ 50▓ 51· ► with legend "▓ ready ░ running · queued", and states stay distinguishable with color removed (glyph/shape carries meaning)
- [ ] Every component specimen is rendered in both light and dark theme, not just a token-table dark column
- [ ] Focus state is a visible 2px seal-red ring on every interactive element in both themes; state logic follows the derivation rule (hover deepens, active presses, disabled desaturates toward paper)
- [ ] kbd keycaps read as physical raised keys with mono labels and rest + pressed states, and a "?" shortcut overlay exists
- [ ] Degraded-state cards share one anatomy (headline, reason, estimate, action), cover all four situations plus the plain empty state, and no endless spinner appears anywhere
- [ ] Dropzone uses the copy "Drag a PDF here, or choose a file" / "up to 500 MB, up to 500 pages" with rest, drag-over, file-selected, and rejected states
- [ ] budget_stop and failed table rows read unmistakably different from processing and done at a glance
- [ ] Every color token carries a one-line usage note in the readme
- [ ] Type roles hold: Fraunces for display/headings only, Inter for UI body, JetBrains Mono with tabular numerals for every figure in every demo
- [ ] Component demos use the sample strings verbatim ("Parish register, 1887", "$0.98 / $10.00", the record text with Dykanka/Ivanenko highlighted, tooltip "from the lexicon, seen on 4 pages")
- [ ] Density reads as a working tool: compact spacing on component demos, no decorative texture behind text, no transition animations specified in verification-flow components
- [ ] Icons are Lucide; nothing in the system reads generic-2024-SaaS (no gradient blobs, no heavy drop shadows)

After approval: **Publish** the system and **Set as org default**.

## Stage 2 — Brand exploration

Run: New design project (Blank), Transcripta design system attached.

````text
Brand exploration — Transcripta logo-mark concepts

PRODUCT CONTEXT (one breath): Transcripta turns scanned handwritten archives — parish registers, ledgers, diaries — into structured text. A person uploads a PDF, a model reads every page, a human verifies fast, and every confirmed page teaches the model the document's own surnames and phrases. Brand personality: "Ink & Paper" — a well-lit reading room. Archival, warm, precise. It is a fast keyboard-first working tool, not a decorative museum site.

FIXED PALETTE & TYPE (invent no colors): use the attached design system's tokens exactly — paper background, ivory raised-tile surface, ink text, and the seal-red accent as the only accent. The system's styles.css/theme.json are the sole source of color values — never hard-code hexes. All lettering in the system's display serif — never a sans. The product reserves a distinctly cooler, darker red for error states; the brand uses only the warm seal red, so the two never read as the same color.

TASK: 3 distinct logo-mark concepts — exactly one from each motif family below, never two from the same family:
(a) SEAL/IMPRINT — wax seal, stamp, embossed impression;
(b) LETTERFORM — a ligature built from the name itself, e.g. the "Tr" or "ct" pair;
(c) INK-BECOMING-TEXT — a handwritten stroke resolving into set type.
Wordmark: "Transcripta" set in the system's display serif; a seal-red accent on part of the mark or one letter is welcome if it earns its place.

Present each concept as one card with 5 labeled rows (mono uppercase label column), all three cards side by side on one canvas:

```
┌─ 1a  Concept Name — one-line metaphor ─────────────┐
│ MARK        [large mark, ~96px]                    │
│ HORIZONTAL  [mark ~26px] Transcripta               │
│ COMPACT     [mark ~40px alone]                     │
│ FAVICON     [32px on tile] [16px on tile]          │
│ ON DARK     ███ dark row: mark + wordmark inverted │
└────────────────────────────────────────────────────┘
```

Row requirements:
- MARK: pure vector, built to work in the system's solid ink plus at most one seal-red accent.
- HORIZONTAL: the lockup exactly as it would sit at the top of a 232px app sidebar — square mark tile ~26px beside the wordmark. This is its most-seen real context.
- COMPACT: mark alone at mid size (avatar / loading state).
- FAVICON: redraw the mark simplified and bolder for 16px — do not just scale it down. Show 32px and 16px side by side, each on a filled tile (one ink-dark, one seal-red) as they'd appear in a browser tab.
- ON DARK: row background near-black and warm ("reading room at night"). Dark theme is a required half of this product — verification runs for hours in the evening — so a mark that only works on paper fails. No detail may depend on strokes that vanish on dark.

EMPHASIZE:
- 16px survival is the pass/fail bar. If the metaphor needs explaining at favicon size, simplify or discard it.
- The story to hint at: handwriting becoming structured, legible text — ink meeting order.
- Archival warmth with precision; it should feel at home next to a scanned 1887 page and next to a data table.

Sample string: wordmark "Transcripta" (exact spelling, capital T only). No taglines or any extra text on any card — the three cards must stay structurally identical so they compare fairly.

DO NOT:
- No magnifying glasses, no generic document-with-folded-corner, no chat bubbles, no sparkles or "AI" glyphs.
- No gradients, no drop shadows, no more than two flat colors per mark (ink + seal-red accent).
- No hairline details or textures that disappear at 16px.
- No colors or fonts beyond the system's fixed palette and its display serif above; no cool or dark red anywhere — the accent is the system's warm seal-red token only.

OUTPUT: exactly 3 labeled concept options — 1a, 1b, 1c — each a complete 5-row card as sketched above, on a single canvas titled "Transcripta — brand mark concepts". The variation between options must be the core motif family; keep the row structure, wordmark typography, and presentation identical across all three so they compare fairly. Give each option a short evocative name plus a one-line description of its metaphor.
````

Before approving, check:

- [ ] All three marks survive at the 16px favicon tile: redrawn bolder/simplified (not scaled down) and identifiable in a browser tab
- [ ] Horizontal lockup reads cleanly at sidebar scale (~26px mark tile) — this is the mark's most-seen real context
- [ ] Exactly one concept per motif family — seal/imprint, letterform ligature, ink-becoming-text — never two from the same family; none drifts into magnifying-glass or generic-document cliches
- [ ] Wordmark 'Transcripta' is set in the system's display serif and feels archival-warm, not generic-SaaS geometric
- [ ] On-dark rows look native, not merely inverted: no strokes or details vanish on the near-black warm background (dark theme is a required half of the product)
- [ ] Each mark works in the system's solid single-color ink; the mark's red matches the system's seal-red token and appears only as a deliberate accent; no colors outside the system's palette, and nothing uses a cooler/darker red that could collide with the error color
- [ ] No sparkles, AI glyphs, gradients, or drop shadows anywhere; every mark is flat vector with at most two colors
- [ ] The ink-becoming-text concept visibly carries the product story — handwriting becoming ordered, structured text
- [ ] No card carries a tagline or extra text; all three cards are structurally identical so the side-by-side comparison is fair

## Stage 3 — Landing page

Run: New design project, system attached.

````text
TRANSCRIPTA — PUBLIC LANDING PAGE. Desktop web, generous spacing (this is the marketing page, not the dense work tool). The attached Ink & Paper design system governs all tokens — display serif for headings, UI sans for body, mono with tabular numerals for ALL figures, seal-red accent for primary actions/links/highlights. Do not invent new colors.

Product context (all you need): Transcripta transcribes scanned handwritten documents. Upload a PDF, a multimodal model reads every page, a human verifies each page fast with the keyboard. The trick: verified pages feed back into the prompt as hints (a "lexicon"), so accuracy grows while you work — zero preparation, no model training.

Tone: confident, archival, precise. Zero startup hype — no gradient blobs, no fake logos/testimonials/pricing, no exclamation marks.

Page structure, top to bottom:

1) HERO
```
[ Transcripta ]        How it works · Document types · [ Sign up ]
[ H1 + subhead + 2 CTAs ]   |   [ verification-screen glimpse ]
```
H1: "Millions of handwritten pages. Nobody types them up." Subhead: "Transcripta reads scanned handwriting with zero preparation — and its accuracy grows while you work." Primary seal-red CTA "Start transcribing"; ghost CTA "See how it works". The glimpse is a framed miniature verification screen, composed exactly as specified here — this spec is the source of truth: header strip "Parish register, 1887 · ●●●○○○○○○○ · 47 / 300 · $0.98 / $10.00" (the dots are mini progress markers; all figures in mono); left half a ruled-paper scan pane with faded cursive; right half the transcription "No. 15. Born on 11 January, Anna. Parents: peasant of Dykanka village, Petr Ivanenko and his lawful wife Maria, both Orthodox." with Dykanka and Ivanenko carrying the system's seal-red context-word highlight mark — the mark alone signals them, no extra punctuation or brackets around the words; below, kbd keycaps "Enter correct · E edit · S skip". This miniature is the product's signature image — accurate to the strings given here, not lorem.

2) THE PROBLEM. Intro line verbatim: "There are millions of pages of handwritten archives that nobody has digitised, because:" Three columns: "Typing by hand — 3–5 minutes per page. 500 pages = a week of work." / "Ordinary OCR — cannot read handwriting at all." / "Specialised HTR — you must label dozens of hours of material first, to train the model." Prominent payoff line: "Transcripta offers a third way: zero preparation, and accuracy that grows while you work."

3) HOW IT WORKS — six numbered steps in a row: 1 "Upload a PDF of a 300-page parish register" · 2 "Pick the preset '19th-century parish register' — or create your own" (docs-verbatim landing copy; the app's built-in preset list shows this as "Parish register") · 3 "A minute later, see the first transcribed pages" · 4 "Go through the pages: [Enter] — correct, or edit the text and [Enter]" (render Enter as a kbd keycap) · 5 "Notice that from page 50 onwards corrections are far rarer" · 6 "Export the result to CSV". Step 5 is visually emphasized (seal-red number, larger card) with the annotation: "Step 5 is exactly what the project exists for." Under the steps, a mono stat pair: "~50 minutes of human time" vs "20 hours typing by hand" (same 300 pages).

4) THE LOOP. Three-node diagram with arrows: "You confirm a page → the word enters the lexicon → the model reads the next pages better." Caption: "No model training. The lexicon is a plain list of words — open it, fix it, carry it to the next document." Supporting line: "By page 50 the model already knows this document contains the surname 'Ivanenko', the village 'Dykanka' and the phrase 'born and baptised'. So it stops inventing 'Ivanchenko'."

5) DOCUMENT TYPES. Intro: "The system is not tied to a genre." Six compact cards, each "type — what supplies the context": Parish registers & census revisions — parish surnames, village names, set formulas / Medical records & case histories — diagnoses, drug names, the doctor's abbreviations / Diaries & letters — names of relatives, places, forms of address / Ledgers & contracts — company names, legal formulas, units of measurement / Lab journals & lecture notes — terms, formulas, the author's abbreviations / School registers & meeting minutes — surnames, job titles, department names.

6) CTA BAND + FOOTER. Band on the dark ink surface (the dark theme's near-black warm tone): light-text heading "Your first page transcribes in about a minute.", seal-red button "Sign up" popping against the dark ground, fine print in secondary text: "Up to 500 MB and 500 pages per document." Minimal footer: wordmark + tagline "Turning scanned handwriting into structured text."

DO NOT: no stock photos, 3D renders, or gradient-mesh 2024-SaaS styling; no fake testimonials, customer logos, star ratings, or pricing; no features beyond the above (no teams, mobile, API sections); no large seal-red background fills — it is an accent only; error-red must not appear anywhere on this page; no lorem ipsum.

Artboards: (A) the full landing page, light theme, ~1440px wide — single canonical version for everything below the hero. For the HERO ONLY, give 3 labeled variants (1a/1b/1c) varying the composition of the verification glimpse: 1a side-by-side (copy left, framed split-screen miniature right, as sketched); 1b full-width framed app window beneath a centered H1; 1c a tight close-up crop showing just the transcription line with its two highlighted words and the keycap row. Copy and all other sections stay identical across variants. Do not render a dark theme in this turn.

[PO note — planned follow-up turn, paste after picking a variant: "Go with 1x. Now re-render that hero in the system's dark theme ('reading room at night') — the scan miniature stays light and becomes the brightest object on screen."]
````

Before approving, check:

- [ ] Hero glimpse shows real verification anatomy — header strip reads 'Parish register, 1887 · ●●●○○○○○○○ · 47 / 300 · $0.98 / $10.00' with figures in mono, split scan/text panes, kbd keycap row — not a generic screenshot placeholder
- [ ] Dykanka and Ivanenko carry the system's seal-red context-word highlight mark, with no ‹ › or other stray punctuation rendered around them in the transcription text
- [ ] Seal red appears only as accent (CTAs, links, highlights, step-5 emphasis); no large red fills, and error-red is absent from the page
- [ ] Step 5 of 'How it works' is unmistakably emphasized and carries the verbatim line 'Step 5 is exactly what the project exists for.'
- [ ] Problem section reads as three honest alternatives with the 'third way' payoff line; zero hype vocabulary anywhere on the page
- [ ] Every figure (3–5 min, 47/300, $0.98/$10.00, ~50 min vs 20 hours, 500 MB/500 pages) is set in mono tabular numerals
- [ ] Loop diagram says 'No model training… a plain list of words' and does not visually imply retraining or a black box
- [ ] Document types are exactly the six doc-listed pairs (type + what supplies the context) with nothing invented
- [ ] CTA band sits on the dark ink surface with light text and the seal-red button as the pop — not a seal-red band
- [ ] Turn 1 delivers only the light landing plus the 3 hero variants — no dark artboard; the dark hero ('reading room at night', scan miniature the brightest object) is requested via the planned follow-up line after a variant is chosen

## Stage 4 — Sign in / Sign up

Run: New design project, system attached.

````text
Design the Sign in / Sign up screens for Transcripta — a web tool that transcribes scanned handwritten archives (parish registers, ledgers, diaries). This is the front door to a dense, keyboard-first working tool, and it is the ONE place where the brand may breathe: paper ground, the mark, generous spacing, the system's display serif for the heading. Everything past this door is compact and utilitarian — so keep this screen calm, warm, and quiet. Auth is deliberately minimal: email + password only. No SSO, no roles, no teams.

THE MARK
Use the seal mark from the attached design system's brand assets. If the system carries no finished mark, draw the one from the brand direction: a circular wax-seal monogram "T", single-color, simple enough to hold up at 24px. Do not invent a different logo.

LAYOUT (canonical — the design system's centered-card shell)
A single centered column on the paper background. Brand lockup above a raised ivory card:

```
            (paper ground)
        [seal mark]  Transcripta        ← display-serif wordmark
   Turning scanned handwriting into
          structured text               ← secondary text, small
  ┌──────── raised ivory card ────────┐
  │  Sign in                          │  ← display-serif heading
  │  Email                            │
  │  [ maria@archive.org           ]  │
  │  Password                         │
  │  [ ••••••••                    ]  │
  │  [          Sign in            ]  │  ← seal-red primary, full width
  │  No account yet? Create one       │  ← switch link, seal-red
  └───────────────────────────────────┘
```

Card max-width ~400px. Inputs full-width, comfortable height, visible focus ring (this product is keyboard-first everywhere — Tab order: email → password → submit; Enter submits from any field). No header nav, no footer clutter — at most a single muted line under the card: "Transcripta · BSA 2026".

EXACT CONTENT STRINGS (English, use verbatim)
- Sign in: heading "Sign in"; labels "Email", "Password"; button "Sign in"; switch link "No account yet? Create one".
- Sign up: heading "Create your account"; labels "Email", "Password"; helper under password "At least 8 characters."; button "Create account"; switch link "Already have an account? Sign in".
- Sample filled email: maria@archive.org.
- Errors — field-level, message directly under the offending input, input border in ERROR red: sign-in error "Wrong email or password." (under the password field); sign-up email error "Enter a valid email address."

THIS TURN — TWO VARIANTS OF ONE ARTBOARD, NOTHING ELSE
Render only Sign in — default state, email filled, password field showing the focus ring (focused state visible) — as 2 labeled variants, varying a single aspect: the brand-moment composition. (A) lockup stacked above the card as sketched; (B) the same mark rendered large and very faint (watermark-like, an embossed seal) in the paper ground behind/beside the card, with a smaller wordmark above the heading inside the card. Everything else (card anatomy, strings, states) identical. Do not render any other artboards this turn.

WHAT TO EMPHASIZE
- The quiet brand moment: paper texture/tone of the ground vs the brighter ivory card is the whole composition. Resist decorating further.
- Seal-red accent appears ONLY on the primary button and the switch link. Errors use the system's error red — distinctly cooler/darker — so error and brand never read as the same color.
- Sign in and Sign up share one skeleton; switching via the link swaps heading, helper, button label, and link text — nothing jumps or reflows.
- Visible focus everywhere; the focused input should look deliberate, not like a browser default.

DO NOT
- No SSO / social buttons, no "Forgot password?", no "Remember me", no terms-of-service checkboxes — none of these exist in the product.
- No split-screen marketing panel, testimonials, illustrations, or feature bullets.
- No transition animations, no mobile artboards.
- No lorem ipsum; only the strings above.

FOLLOW-UP TURN (after picking A or B, paste this verbatim with {A|B} filled in):
"Keep composition {A|B} exactly as approved; no layout changes. Render three more artboards on it: (1) Sign up — default, empty fields, helper text visible. (2) Sign in — error state: fields filled, 'Wrong email or password.' under the password field, error styling on that field only; the rest of the screen unchanged. (3) Sign in — dark theme ('reading room at night'): warm near-black surfaces, the card still reads as the raised surface. The primary button uses the system's dark-theme variant of seal red — if it fails contrast on the button, lighten it rather than switching hue; all other accented elements (the switch link) follow the system's amber-tinted dark accents."
````

Before approving, check:

- [ ] Seal-red appears only on the primary button and switch link; the field-level error uses a visibly cooler/darker red — hold the two side by side and confirm they never read as the same color
- [ ] The mark is the design system's seal mark (or, if the system has none, the described circular wax-seal 'T' monogram) — not a freshly invented logo; variant B uses the SAME mark as variant A, only rendered faint and large
- [ ] Turn discipline held: turn 1 produced only artboard 1 as variants A and B; Sign up, error, and dark artboards appear only in the follow-up turn, on the picked composition, with no layout drift
- [ ] The brand moment stays quiet: mark + display-serif wordmark + one tagline on paper ground — no marketing panel, illustrations, or feature copy crept in
- [ ] Error is truly field-level: message sits under the offending input with error styling on that field only, not a page banner or toast
- [ ] Focus state on the focused input is a deliberate visible ring (keyboard-first system), not a default browser outline; Tab order email → password → submit is plausible from the layout
- [ ] Sign in and Sign up are the same skeleton — switching would swap only heading/helper/button/link text with no layout jump
- [ ] Dark artboard reads as 'reading room at night': warm near-black ground, card still the raised surface; the primary button is the system's dark-theme seal-red variant (lightened if contrast demands, never hue-shifted to amber), while the switch link follows the amber-tinted dark accents
- [ ] All strings match the prompt verbatim in English ("Wrong email or password.", "No account yet? Create one", etc.) — no lorem, no invented UI (SSO, forgot-password, remember-me, ToS)
- [ ] Type roles honored: the display serif only for wordmark/headings, the UI sans for labels/inputs/links

## Stage 5 — Workspace — document list

Run: New design project, system attached.

````text
Design the **Workspace — Document list** screen for Transcripta (use the attached Transcripta design system for all tokens; reference roles by intent only).

**What this screen is.** The home of the working app: a dense table of the user's documents. It answers one question fast — "which document needs me right now?" — and one click resumes work exactly where the user left off. Deliberately plain; the drama lives in the two statuses where a document has stopped moving.

**Layout**

```
+--------------------------------------------------------------------+
| Documents                                    [+ New document]      |
+--------------------------------------------------------------------+
| Title                  | Status       | Progress | Spent           |
|------------------------|--------------|----------|-----------------|
| Parish register, 1887  | Processing   | 47 / 300 | $0.98 / $10.00  |
| Hospital records, 1912 | Done         | 88 / 88  | $2.14 / $10.00  |
| Ledger, 1903           | Budget limit | 12 / 240 | $10.00 / $10.00 |
| Letters, 1904          | Failed       | 3 / 120  | $0.04 / $10.00  |
+--------------------------------------------------------------------+
```

- App shell: compose on the design system's app-shell template — left sidebar (brand lockup, nav "Documents" active with "Presets" below, user row at the bottom), topbar with the page title; the sketch above shows the content area only.
- Page header: "Documents" (display serif), right-aligned primary button "+ New document" (seal-red accent, Lucide `plus`).
- Columns exactly: Title / Status / Progress / Spent. Progress and Spent in mono figures, right-aligned, tabular so columns of numbers line up. Money format rule, applied everywhere: always two decimals on both numbers, spaces around the slash — "$0.98 / $10.00". Progress may carry a slim inline bar under or beside the fraction.
- Status as compact chips showing display labels — never raw enum tokens on screen: `processing` → "Processing" (neutral/ink; its activity cue is static — a Lucide `loader-2` glyph at rest or the in-progress fill of the inline bar, no motion); `done` → "Done" (moss-green, calm, recessed); `budget_stop` → "Budget limit" (amber warning); `failed` → "Failed" (error red — the cooler/darker red, never the seal accent). The system's full document-status enum also includes draft / ingesting / ready / paused; these artboards scope to the four statuses above by PO decision — if any other status ever appears in this table, it renders as a quiet neutral chip with no action.
- **The key requirement:** Budget limit and Failed are the two states where the document is not moving and the user must act. They must read as "act on me" at a glance — visibly louder than Processing/Done (e.g. row tint + inline affordance). Budget limit carries action "Raise the limit" (no helper text — the Spent column already reads $10.00 / $10.00; do not duplicate the figure). Failed carries no document-level button — instead an inline link-styled hint "Open to re-read failed pages" (the row click opens verification, where the per-page re-read button lives). Done and Processing rows carry no buttons.
- Whole row is clickable and keyboard-focusable (visible focus ring). On hover/focus of the Processing row, show the resume hint: "Resumes at page 47" (mono figure) — a row click opens verification at the saved cursor page, never page 1. Annotate this on the artboard.
- Compact working-tool density: rows around 44–48 px, hairline separators, generous only in the header.

**Sample content — use these strings verbatim** (see table above): "Parish register, 1887", "Hospital records, 1912", "Ledger, 1903", "Letters, 1904"; fractions "47 / 300", "88 / 88", "12 / 240", "3 / 120"; money "$0.98 / $10.00", "$2.14 / $10.00", "$10.00 / $10.00", "$0.04 / $10.00".

**Artboards this turn**

1. **Canonical list (light)** — the four rows above, with the hover/focus resume hint annotated on the Processing row.
2. **Empty first-run state** — no table; a quiet centered invitation on the paper background: heading "No documents yet", line "Upload a PDF and start verifying in about a minute.", meta "up to 500 MB · up to 500 pages", primary CTA "+ New document". Warm, not a giant illustration. Variant-independent — produce once.

**Emphasize:** instant scannability of status; the actionable-vs-moving contrast; mono alignment of figures; visible keyboard focus.

**DO NOT:** no search, filters, sort controls, checkboxes, bulk actions, or pagination (not in scope); no seal-red on the Failed state; no raw enum text ("budget_stop") on screen; no card grid — this is a table; no roles/avatars/team chrome; no mobile layout; no animation of any kind (the Processing cue stays static).

**Variants:** give me 2–3 labeled variants (A/B/C) that differ ONLY in how the actionable rows (Budget limit, Failed) demand attention — e.g. A: status chip + inline affordance; B: full-row warning tint with the affordance at row end; C: a thin colored left edge-bar + persistent affordance. Keep everything else identical across variants. Do NOT produce the dark theme yet.

---
FOLLOW-UP (paste as the next turn after choosing a variant): "Go with <A/B/C>. Now produce the dark-theme canonical list on that variant — reading-room-at-night surfaces; all four status colors distinguishable; Budget limit and Failed rows still the loudest elements on screen."
````

Before approving, check:

- [ ] Budget limit and Failed rows read as 'act on me' at a glance — visibly louder than Processing/Done, with 'Raise the limit' and 'Open to re-read failed pages' discoverable without hover; NO invented document-level 'Retry' button appears anywhere
- [ ] Status chips show display labels (Processing / Done / Budget limit / Failed) — no raw enum tokens like 'budget_stop' rendered on screen
- [ ] Failed uses the cooler/darker error red, clearly distinct from the seal-red accent on '+ New document' — the two reds never look like the same color
- [ ] Done row is calm and recessed; it does not compete with the actionable rows for attention
- [ ] Every money figure uses one format — two decimals on both numbers, spaces around the slash ('$0.98 / $10.00') — and all figures are mono with tabular numerals, aligning vertically down the Progress and Spent columns; the Budget limit row does NOT duplicate the spent figure next to its action
- [ ] Processing's activity cue is static (glyph at rest or bar fill) — no spinner, pulse, or motion of any kind
- [ ] Row hover/focus shows the 'Resumes at page 47' hint and a visible keyboard focus ring — the resume-at-cursor behavior is communicated, not silent
- [ ] Empty first-run state leads directly to upload (CTA + 500 MB / 500 pages limits copy) and stays warm/quiet, not a generic illustration block
- [ ] Turn 1 delivers only the light canonical list variants A/B/C plus the empty state; the dark theme is generated in the follow-up turn AFTER the PO picks a variant, and it keeps all four status colors distinguishable with the actionable rows still loudest
- [ ] Density is working-tool compact (a real table, ~44-48 px rows, hairlines) — no 2024-SaaS card grid, no invented search/filter/pagination chrome

## Stage 6 — Upload

Run: New design project, system attached.

````text
Design the Upload screen ("New document") for Transcripta — a web app that transcribes scanned handwritten documents. The attached Transcripta design system governs all tokens, type, icons, and both themes — follow it exactly. Two per-screen rules on top of it: error text uses the system's cooler error red, never the seal-red accent; every figure (MB, %, page and size limits) is set in mono tabular numerals.

PRODUCT INTENT. This screen is deliberately plain: one screen, one path, no branching. The user picks a file and a preset, watches one progress bar, presses one button, and leaves. Accepted inputs are PDFs and image archives. Two rules define it: (1) size/type validation happens BEFORE upload, on the file description alone — a 2 GB file is rejected in a second, not after twenty minutes of uploading; the only two instant server rejections are "file too large" and "unsupported type"; (2) the progress bar tracks the browser's direct PUT to storage (S3) — our server never sees the bytes, so the browser's own upload event is the only progress source.

LAYOUT. Compose on the design system's app-shell template: left sidebar (brand lockup; nav: Documents active, Presets below; user row at the bottom), topbar with page title "New document". Main column, generous width, centered:

┌──────────────────────────────────────────────┐
│  [file-up icon, Lucide]                      │
│  Drag a PDF here, or choose a file           │
│  up to 500 MB, up to 500 pages               │
└──────────────────────────────────────────────┘
Title: [ Parish register of Dykanka, 1887 ]
Preset: [ Parish register ▾ ]   new preset
──────────────────────────────────────────────
dykanka-1887.pdf · 180 MB  ▓▓▓▓▓▓▓░░░  71%
uploading straight to storage · about a minute left
                         [ Start processing ]

Elements: dropzone ("choose a file" is a real focusable control, keyboard-reachable, visible focus ring); Title text input, prefilled from the filename, editable; Preset select (options: Parish register, Medical record, Diary, Ledger) with a quiet "new preset" text link beside it — a link, not a second button; annotate: "new preset" navigates to the Preset editor screen (not a modal), and after saving the user returns here with the new preset selected; file row with file icon, name, size, progress bar and percent (all figures in mono tabular numerals); "Start processing" as the single seal-red primary button, disabled until upload completes. Pressing it navigates to the document page — no waiting happens on this screen.

ARTBOARDS TO PRODUCE (light theme unless noted):
1. Idle — empty dropzone, preset "Parish register" selected, no file row, Start processing disabled.
2. Drag-over — dropzone hot: hairline border turns seal-red with a faint seal tint. Restrained, no scaling theatrics.
3. Rejected before upload — file row "archive-full-scans.pdf · 2.1 GB" with error text "Too large — the limit is 500 MB. Nothing was uploaded." in the cool error red; a second smaller example "notes.docx — Unsupported type. PDFs and image archives only." Both errors must read as instant: no progress bar ever appeared.
4. Uploading — exactly the sketch above: "dykanka-1887.pdf · 180 MB", bar at 71%, sub-line "uploading straight to storage · about a minute left", Start processing disabled.
5. Uploaded, ready — same row, bar full, meta "180 MB · uploaded", Start processing enabled (the one seal-red element that now visibly demands the click).
6. Dark theme — artboard 4 restated in the system's dark theme; error red must remain clearly distinct from the accent.

EMPHASIZE: the honesty of the two rules — copy and states must make "rejected before any transfer" and "browser-to-storage progress" legible to a non-technical user; the plainness of the page (this is the antechamber, the verification screen is the cathedral); mono figures for MB and %; a single accent-colored action per state.

DO NOT: no multi-file queue, no folder upload, no upload history, no title-less flow; no spinner anywhere — every wait state has a bar and a number; no processing/ingest UI on this screen (that lives on the document page, which is out of scope for this pack); no budget meter in the topbar — budget is per-document and no document exists yet on this screen; no seal red on error text; no transition animations; no mobile layout; no generic drop-shadow SaaS card styling.

Produce exactly the six artboards above — artboard 4 is the canonical composition; the others are state deltas of it. No variants needed — this screen has exactly one path by design; put the effort into state fidelity, not alternatives.
````

Before approving, check:

- [ ] Rejection artboard reads as pre-upload: copy says nothing was transferred, no progress bar is present, and the 2.1 GB example appears with an instant error, not a failed upload
- [ ] Type rejection copy is type-neutral: 'notes.docx' is rejected as unsupported type with PDFs and image archives named as accepted — no PDF-only claim anywhere in error copy
- [ ] Error text uses the cooler error red and can never be confused with the seal-red accent on the same screen
- [ ] Progress row is explicitly framed as browser-to-storage transfer ('uploading straight to storage') and all figures (180 MB, 71%, 500 MB, 500 pages) are in mono tabular numerals
- [ ] One path, no branching: single dropzone, single file row, single primary button; page feels deliberately plainer than the verification screen, with no invented features (no multi-file, no history, no ingest progress)
- [ ] 'Start processing' is the only seal-red primary, disabled until upload completes and visibly demanding action once the file is uploaded
- [ ] 'new preset' is a quiet link next to the preset select, not a competing button; preset options match the four built-in presets
- [ ] Keyboard path holds: 'choose a file' is a focusable control with a visible focus ring in both themes
- [ ] Dark artboard uses the attached system's dark theme as-is (no re-invented palette in the output), and the error/seal red distinction survives the theme switch
- [ ] Exactly six artboards delivered, with artboard 4 as the canonical composition — no duplicate seventh 'canonical screen'

## Stage 7 — Verification screen (hero)

Run: New design project, system attached. This is the product's hero screen — spend the most care here.

````text
Design the **verification screen** for Transcripta — a web app that transcribes scanned handwritten documents. A human verifies a machine transcription page by page; the headline number is seconds per page, target **under 10** — every extra second costs 5 minutes on a 300-page document. Everything on this screen exists to make that fast: keyboard-first, dense, zero animation. Desktop only. Use the attached design system throughout (seal-red accent for the context-word mark and primary actions, mono tabular figures for every number, kbd keycap component, 8-state page-strip pager, queued-actions chip).

**This stage is three turns in one chat. Paste Turn 1, decide the variant ("go with A/B/C"), then paste Turns 2 and 3.** The DO-NOT list at the end binds all three turns.

━━ TURN 1 — canonical dark artboard + variants of the signature element ━━

**Layout — the design system's focus shell: no sidebar, the header and three zones below are the entire chrome; split-pane with a draggable divider (visible grip; annotate "position remembered" — dense cursive needs more image room, sprawling text needs more text room):**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Parish register, 1887  ●●●○○○○○○○  47 / 300  $0.98 / $10.00  [3 unsaved] │
├───────────────────────────────╥──────────────────────────────────────────┤
│                               ║  No. 15. Born on 11 January, Anna.       │
│     PAGE IMAGE (the scan)     ║  Parents: peasant of ‹Dykanka› village,  │
│   wheel — zoom · drag — pan   ║  Petr ‹Ivanenko› and his lawful wife     │
│   [zoom] [contrast] [A− A+]   ║  Maria, both Orthodox.                   │
│                               ║  ‹word› — suggested by the context       │
├───────────────────────────────╨──────────────────────────────────────────┤
│  [✓ Correct ⏎]  [✎ Edit E]  [↷ Skip S]     ← previous · Ctrl+Z undo ·    │
│  ◄ 44✓ 45↷ 46✎ [47●] 48▓ 49▓ 50▓ 51· ►     ▓ ready ░ running · queued    │
└──────────────────────────────────────────────────────────────────────────┘
```

**Header bar:** title "Parish register, 1887" in the display face; mini progress dots "●●●○○○○○○○"; "47 / 300"; budget "$0.98 / $10.00" — all figures mono tabular. Right side: queued-actions chip "3 unsaved actions" — visible, quiet, **non-blocking** (never a modal or toast).

**Left zone — the page image. The source of truth.** The largest, most dominant zone. **Draw the scan:** a warm aged-paper rectangle, faint ruled lines, several rows of illegible cursive strokes, an ink blot or two — never an empty image placeholder or a generic photo icon. Corner hints "wheel — zoom · drag — pan"; small toolbar: zoom, image-contrast control (faded ink), font-size A−/A+ for the text pane (verifiers have different eyesight).

**Right zone — the transcription.** Sample text exactly: "No. 15. Born on 11 January, Anna. Parents: peasant of Dykanka village, Petr Ivanenko and his lawful wife Maria, both Orthodox." — with **Dykanka** and **Ivanenko** carrying the context-word highlight mark (seal-red tint). This is the product's signature element and its defence against context poisoning: highlighted words are the verifier's scan-first checklist — check these first, skim the rest. Show the tooltip open on "Dykanka": "from the lexicon, seen on 4 pages". Pane footer legend: "‹word› — suggested by the context". Note on the sketch: the ‹ › around Dykanka/Ivanenko in the layout sketch stand for the highlight mark — render the tint only, no brackets around the words in the pane text; the ‹ › appear literally only in the legend line.

**Bottom zone.** Action bar: [✓ Correct] [✎ Edit] [↷ Skip], each with a kbd keycap (Enter, E, S); muted hint line "← previous · Ctrl+Z undo · Space zoom · ? shortcuts". Show a visible keyboard focus ring on [✓ Correct]. Page strip: ◄ 44 45 46 [47] 48 49 50 51 ► with marks ✓ ↷ ✎ ● ▓ ▓ ▓ · — page 45 carries the skipped mark ↷ (its record was illegible). Full 8-state vocabulary: ✓ confirmed, ✎ corrected, ↷ skipped, ● current, ▓ ready, ░ running, · queued, ! error; legend "▓ ready ░ running · queued". Show hover on page 45 with a small scan-thumbnail popover (clicking jumps to that page).

**Theme: dark** — this screen's natural home (long evening sessions): near-black warm surfaces; the drawn scan stays light and is the **brightest object on screen**. Tooltip open, chip visible, strip hover shown.

**Emphasize:** working-tool density (compact spacing); mono for every figure; keycaps as a first-class component; the seal-red mark must pop just enough to scan as a list without shouting; focus always visible.

**Variants:** the layout is fixed by the product — one canonical layout. Give 2–3 labeled variants (A/B/C) varying ONLY the context-word highlight treatment and right-pane text presentation — e.g. A: soft seal tint behind the word; B: tinted underline that strengthens on hover/tooltip; C: tint plus hairline outline. This is the one place worth exploring; keep everything else identical across variants.

━━ TURN 2 — paste after "go with A/B/C" ━━

Using the chosen highlight treatment and the same shell as the approved artboard (header, panes, action bar, strip unchanged unless noted), produce three artboards:
1. **Light theme** — same screen.
2. **Edit mode** — right pane becomes a textarea holding the record text, caret visible; keycap hints "Ctrl+Enter save · Esc cancel"; action bar swaps to those two actions.
3. **Shortcuts overlay** (opened with ?): centered panel of keycap → action pairs: Enter/→ Correct, next · ← Previous · E Edit · S Skip · Ctrl+Z Undo · Space Zoom · ? this list.

━━ TURN 3 — the four degraded states, one calm-card pattern ━━

Same shell as the approved dark artboard; the header keeps "Parish register, 1887 · 47 / 300 · $0.98 / $10.00" except where noted. Four artboards sharing one calm-card pattern — every wait states a reason plus a time or an action:
1. **Queue slower than the human:** card "Preparing the next pages" / progress bar "preparing pages 48–50 · about 40 seconds" / "Recognition is slower than your verification." / buttons [Review the ready ones] [Pause]. The header still reads "47 / 300" — 48–50 is the recognition batch running ahead, not a new total. In the strip, pages 48–50 show ░ (being recognised) instead of ▓. An honest wait, never a spinner.
2. **Budget exhausted:** card "Spent $10.00 of $10.00" (the money format rule — $, two decimals — applies here too) with primary action "Raise the limit"; header budget reads "$10.00 / $10.00" in warning amber. This state must visually demand action.
3. **Model unavailable:** "Service unavailable" + [Try again].
4. **Page failed:** "Failed after 3 attempts" + [Re-read] [Type it by hand]; that page shows the ! error mark in the strip.

**DO NOT (all three turns):** no transition animations anywhere, even implied in annotations (200 ms × 300 pages = a minute of pure waiting); no mobile version; no invented features (no confidence scores, comments, chat, avatars, collaboration); never use seal red for errors — errors use the cooler, darker error red; no blocking modals or toasts for the offline state; no bare spinners in degraded states; no paper texture behind the transcription text — legibility over decoration.
````

Before approving, check:

- [ ] Context words (Dykanka, Ivanenko) read as a scan-first checklist — findable in under a second, seal-red tint, tooltip text exactly 'from the lexicon, seen on 4 pages'
- [ ] No literal ‹ › rendered around Dykanka/Ivanenko in the pane text — the sketch's brackets are notation for the tint mark; ‹ › appear only in the legend line '‹word› — suggested by the context'
- [ ] Image pane is unmistakably the dominant zone and the scan is actually drawn as an 1887 register page (aged paper, ruled lines, cursive strokes, ink blot) — never an empty image placeholder; in the dark artboards it is the brightest object on screen
- [ ] Every figure (47 / 300, $0.98 / $10.00, strip numbers, 'about 40 seconds') is set in mono with tabular numerals
- [ ] All 8 strip marks render where assigned: ↷ on page 45 in every canonical strip, ░ on pages 48–50 in the queue-slow artboard, ! on the page-failed artboard; marks distinguishable at a glance and the page-45 hover thumbnail is present
- [ ] kbd keycaps render as a real component (not plain text) on Correct/Edit/Skip and in the shortcuts overlay, and a visible focus ring appears in the canonical shot
- [ ] Each degraded artboard states a reason plus a time or next action (no bare spinner); the queue-slow header still reads 47 / 300 while the card says 'preparing pages 48–50'; the budget_stop card reads 'Spent $10.00 of $10.00' (matching Stage 5's helper text and the $-prefixed header) and visually demands action in amber, and error red is clearly distinct from seal red
- [ ] '3 unsaved actions' chip is visible but clearly non-blocking — sits in the chrome, not a modal or toast
- [ ] Turn 1 variant decision made ('go with A/B/C') before pasting Turns 2–3, and Turns 2–3 reuse the approved shell without layout drift
- [ ] Nothing invented and nothing animated: no confidence %, comments, or collaboration UI; density reads as a fast working tool, not a decorative museum page

## Stage 8 — Preset editor

Run: New design project, system attached.

````text
Design the **Preset editor** screen for Transcripta (use the attached Transcripta design system — reference tokens by intent only: paper background, ivory cards, ink text, seal-red primary accent, mono figures, display-serif headings, sans UI body, Lucide icons). This is a compact working-tool form, not a marketing page: dense spacing, visible focus rings, keyboard-friendly.

**Product logic (must be legible in the UI).** A preset holds three parts, but only two are human-edited: **instructions** (a plain textarea) and a **seed glossary** (a word list where each row has a kind dropdown plus add/remove). The third part, the **output schema**, comes with the chosen base template and is NOT editable in the MVP — no field builder, no raw JSON. The app ships four built-in presets to base a new one on: Parish register, Medical record, Diary, Ledger. Presets are **immutable**: saving changes always creates a new version — the UI must say this plainly, otherwise a user who edits a preset mid-document will not understand why already-processed pages did not change.

**App shell.** Compose on the design system's app-shell template — sidebar with "Presets" active, topbar with the page title; the sketch below is the content column only.

**Layout sketch:**

```
New preset                          [chip: based on · Parish register]
┌──────────────────────────────────────────────────────────────┐
│ Based on:  [ Parish register ▾ ]   ← the output schema comes │
│ Name:      [ Dykanka, 1880s ]           from here            │
│ Instructions for the model                                   │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ This is a page from a late 19th-century parish register. │ │
│ │ Cursive, faded ink. Preserve the original spelling —     │ │
│ │ do not modernise it.                                     │ │
│ └──────────────────────────────────────────────────────────┘ │
│ Seed glossary — known names and phrases                      │
│   to help the first pages                     [+ add word]   │
│   [ surname      ▾ ]  Ivanenko             ×                 │
│   [ place        ▾ ]  Dykanka              ×                 │
│   [ formula      ▾ ]  born and baptised    ×                 │
│   [ abbreviation ▾ ]  peas. = peasant      ×                 │
│ Output fields (from the template, not editable)              │
│   record_no · date · given_name · surname · place · notes    │
│ ⓘ immutability notice        [ Cancel ]  [ Save preset ]     │
└──────────────────────────────────────────────────────────────┘
```

**Exact content strings:** page title "New preset"; "Based on" value "Parish register" (its open state lists Parish register, Medical record, Diary, Ledger); Name "Dykanka, 1880s"; the instructions text above, verbatim; glossary section label "Seed glossary — known names and phrases to help the first pages" with "[+ add word]"; the four glossary rows above, verbatim; the kind dropdown's open state lists person name, surname, place, term, formula, abbreviation, other; output-field chips `record_no · date · given_name · surname · place · notes` in mono, with caption "from the template, not editable" and a small lock icon; immutability notice: "Presets are immutable — saving creates a new version. Pages already processed keep the version they were read with; only pages processed from now on use the new one."; primary button "Save preset" (seal-red).

**Material character (intent language, from the attached system):** glossary rows sit on hairline rules like ledger lines, not in heavy bordered input boxes; the locked output-fields block reads like an impressed stamp or printer's plate — ivory-on-ivory, lock icon, mono chips — clearly not a form surface; the display serif only for the page title and section labels, the UI sans for everything else.

**Emphasize:** (1) the visual contrast between the two editable sections and the sealed output-fields block; (2) "Based on:" as the visible *source* of those output fields; (3) the immutability notice calm but unmissable, near the save action; (4) glossary rows as fast, scannable, keyboard-addable list items.

**This turn, produce only:** the canonical filled screen as **2 labeled variants (A/B) that differ only in how the read-only schema + immutability message are treated** (e.g. A: inline sealed footer block with notice beside Save; B: locked side/summary panel with the notice as a quiet banner under the header). Keep layout and strings otherwise identical. On each variant also show the kind dropdown open on the second glossary row, listing the kinds above.

**Follow-up prompts (do NOT render now — the PO pastes these after "go with A/B"):**
1. "Same screen pre-filled as editing an existing preset: title 'Dykanka, 1880s', primary button 'Save as new version', immutability notice present, and the 'Based on' control read-only — a static value with the same lock treatment as the output fields, since the base template cannot change after creation."
2. "Dark-theme rendering of the canonical state (reading-room-at-night surfaces from the system): all sections, notice and locked block present, visible focus states."

**DO NOT:** add a schema/field builder, raw JSON textarea, or any affordance implying output fields are editable; add preset sharing, libraries, tags, or roles; use seal-red for the lock/read-only treatment or for anything except the primary action and accents; use lorem ipsum; use transition-heavy or decorative layouts — this is a five-minute utility form.
````

Before approving, check:

- [ ] Output fields read as sealed/non-editable at a glance — an impressed-stamp ivory-on-ivory block with mono chips, lock icon and the caption 'from the template, not editable', no input-like affordance
- [ ] Immutability notice uses the docs-faithful wording — 'Pages already processed keep the version they were read with; only pages processed from now on use the new one' — placed near the save action
- [ ] 'Based on: Parish register' visibly reads as the source of the output schema, and its open state lists exactly the four built-ins (Parish register, Medical record, Diary, Ledger)
- [ ] Seed glossary shows the four sample rows including 'abbreviation ▾ peas. = peasant', with working add (+ add word) and remove (×); the open kind dropdown lists person name, surname, place, term, formula, abbreviation, other
- [ ] Glossary rows sit on hairline ledger-line rules (not heavy bordered cards); the display serif only on the page title and section labels, figures and field names in mono
- [ ] All sample strings match verbatim, including the glossary caption 'known names and phrases to help the first pages' — no garbled or invented microcopy
- [ ] Only instructions and glossary look editable — no field builder, JSON, tags, sharing, or other invented features anywhere; seal-red appears only on the primary action/accents, never on lock or read-only elements
- [ ] Turn discipline held: first generation is canonical A/B (plus open kind dropdown) only; edit-existing (title 'Dykanka, 1880s', button 'Save as new version', 'Based on' rendered read-only with the lock treatment) and the dark theme come via the pasted follow-up prompts
- [ ] Dark artboard, when produced, keeps full parity (all sections, notice, locked block) with warm near-black surfaces and visible focus states

## Stage 9 — Export dialog

Run: New design project (system attached) or a small separate project — operator's choice. The dialog overlays the document page (not the Workspace document list), and no other stage in this pack designs that page, so the prompt below specifies the minimal backdrop chrome itself.

````text
Design the EXPORT DIALOG for Transcripta — a web app that transcribes scanned handwritten documents and has a human verify the model's reading page by page. Use the attached Transcripta design system for all tokens; reference roles by intent only (seal-red primary accent, amber warning role, mono figures, ivory raised surface, display-serif headings, sans UI body, Lucide icons). The system's styles.css/theme.json are the sole source of color values — never hard-code hexes.

This stage is a DIALOG, not a screen. It opens over the document page for "Parish register, 1887" (dim the page behind it; the backdrop only needs to hint at a document header — title only, no progress or budget figures, so the backdrop cannot contradict the dialog's "12 of 300" warning — do not design the full page). Density: compact working tool, generous enough padding to feel like a well-lit reading room, never a marketing modal.

Layout (follow this sketch):

┌────────────────────────────────────────────┐
│ Export "Parish register, 1887"             │
│                                            │
│ Format                                     │
│ ( ) JSON    (•) CSV    ( ) TXT             │
│                                            │
│ ⚠ 12 of 300 pages are still unverified.    │
│   They will be exported as the model read  │
│   them, unchecked.                         │
│                                            │
│                    [ Cancel ]  [ Export ]  │
└────────────────────────────────────────────┘

Exact content strings (English, verbatim):
- Title: Export "Parish register, 1887"
- Format label: "Format" with three radios: JSON / CSV / TXT. CSV pre-selected. No sublabels, no extra formats, no other options — this dialog has exactly one decision plus one warning.
- Warning: "12 of 300 pages are still unverified. They will be exported as the model read them, unchecked."
- Buttons: [ Cancel ] (quiet secondary) and [ Export ] (seal-red primary).

What to emphasize — the warning IS the product decision here. Export is allowed at any time (an interrupted job is a normal reason to export), but the user must not be able to reach the Export button without having read that part of the file never passed a human. Give the warning real visual weight: amber warning role (icon + tinted block or rule — your call), positioned between the format choice and the buttons so the eye crosses it on the way to Export. It must read as caution, not error: clearly amber, never the seal-red used on the Export button, never the cooler error red. All figures ("12 of 300") in mono tabular numerals. Keyboard-first: visible focus rings on radios and both buttons; show kbd hints "Esc Cancel" and "Enter Export" as small keycaps in the footer if it stays quiet.

Behavior to communicate visually: Export is a background job. Clicking Export closes the dialog immediately — no in-dialog spinner, no progress state inside the dialog. The finished file later arrives as a download link on the document page.

THIS TURN, produce ONLY the default artboard (light theme, CSV selected), as 2 labeled variants that differ ONLY in the warning's form and prominence:
- A: full-width amber-tinted block with icon.
- B: leaner amber left-rule callout sitting tight above the buttons.
Everything else — layout, strings, buttons, radios — stays identical across variants. Do not render any other states yet; I will pick a variant first.

DO NOT:
- Do not add page-range pickers, field selectors, DOCX/TEI options, email/share, or scheduling — JSON/CSV/TXT is the entire scope.
- Do not soften or bury the warning (no small grey footnote), and do not style it in any red.
- Do not add a progress bar or spinner inside the dialog — the job is background by design.
- Do not use transition animations; no decorative illustration.

Context (binding): Transcripta's direction is "Ink & Paper" — archival character, warm and precise: paper, ink, a wax-seal accent; a well-lit reading room that remains a fast, dense, keyboard-first working tool. Use the system's roles by name: paper background, ivory raised surface, ink text, seal-red primary, amber warning, and a cooler error red that must never read as the seal accent. Dark theme is part of the system ("reading room at night": warm near-black surfaces, amber-tinted accents). Visible focus everywhere; the kbd keycap is a first-class component. Only the elements specified above appear — invent nothing.

TURN 2 — paste after choosing a variant ("go with A" / "go with B"):
"Using the chosen warning treatment, add these artboards, one moment in time per artboard:
2. Keyboard focus — same dialog, focus ring visibly on the Export button.
3a. Just after Export — dialog gone, a minimal document page visible. Draw only this much of the page (it is not designed anywhere else — keep it schematic): a header with the title 'Parish register, 1887' in the display face on the paper background, no progress figures, and an otherwise quiet content area. Over it, a quiet toast/chip: 'Export started. The file will appear on this page when it's ready.' No ready link anywhere yet.
3b. Later, when ready — the same minimal document page (same schematic header, no progress figures), toast gone, a small link row: 'parish-register-1887.csv · ready — Download' (mono for the filename). 3a and 3b are different moments — the toast and the ready row never appear together.
4. Dark theme — default state on warm near-black surfaces; warning stays legible with an amber-tinted treatment."
````

Before approving, check:

- [ ] The unverified-pages warning is the visual center of the dialog — the eye must cross it on the way to the Export button; it cannot be read as a footnote.
- [ ] Warning is amber (warning role), clearly distinct from both the seal-red Export button and the cooler error red — three different reds/oranges never blur together.
- [ ] Figures ('12 of 300', '$'-free counts, filename row) are set in mono tabular numerals per the system rule.
- [ ] Export is the single seal-red primary; Cancel is quiet secondary; visible focus rings on radios and buttons, with Esc/Enter keycap hints present.
- [ ] Post-export sequence honestly reads as a background job: dialog closed instantly, no in-dialog spinner, and the two moments are separate artboards — 3a shows only the 'Export started' toast, 3b shows only the ready download link row; toast and ready row never coexist on one page.
- [ ] Dark theme artboard keeps the dialog on warm near-black surfaces with the warning still legible (amber-tinted, not muddy).
- [ ] Scope discipline: exactly JSON/CSV/TXT radios, CSV pre-selected, and no invented options (page ranges, DOCX, sharing, scheduling).
- [ ] Dialog sits over a dimmed document page at compact working-tool density; strings match the docs verbatim, including the title Export "Parish register, 1887". The dimmed backdrop (and the 3a/3b document page) carries no progress or budget figures that could contradict the 12-of-300 warning.
- [ ] Turn discipline: Turn 1 yields only the default artboard as variants A/B (warning treatment is the sole difference); state artboards 2/3a/3b/4 are requested only in Turn 2, after the PO has chosen a variant — the model never picks the winner itself.
- [ ] The paste is fully self-contained and design-model-facing: no repo or scratchpad file paths, no Claude Design mechanics or model-picker instructions, no deliverable/prompt-pack framing, and the docs-relative anti-goal is rephrased as 'only the elements specified above — invent nothing'.
- [ ] No raw hex values anywhere in the paste — colors are named by role only (paper background, ivory raised surface, seal-red primary, amber warning, cooler error red), with the attached system's styles.css/theme.json as the sole source of values.

## Stage 9b — Document page

Run: New design project, system attached. Added after PO review: Export (Stage 9) opens from this page and the download link arrives here, but no stage designed it; docs mention it only twice (post-ingest progress home; export-link landing). This closes the navigation gap and gives Ground-truth mode its entry point.

````text
Design the DOCUMENT PAGE for Transcripta (use the attached Transcripta design system; reference tokens by intent only). This page is the antechamber of one document — the verification screen is the cathedral. It has exactly three jobs: show processing progress after upload/ingest, resume verification at the saved cursor, and host export (the dialog opens from here; the finished file lands here). Deliberately compact — one column, no drama.

LAYOUT. Compose on the Transcripta App Shell (sidebar: Documents active; topbar right side holds only the theme toggle). Content column: title "Parish register, 1887" (display serif) with an overflow menu (⋯) beside it containing exactly one item: "Ground-truth mode"; meta line in mono: preset "Parish register" · budget "$0.98 / $10.00". Progress block: determinate bar with caption "212 of 300 pages transcribed · 47 verified" (all figures mono; never a spinner). Primary CTA seal-red "Continue verifying" with sub-hint "resumes at page 47"; secondary quiet button "Export…" (opens the export dialog — do not render the dialog here). Exports area below: when a file is ready, a small link row "parish-register-1887.csv · ready — Download" (mono filename); when an export was just started, a quiet toast "Export started. The file will appear on this page when it's ready." — toast and ready row never appear together.

STATES (as a prop): processing (canonical above); done (bar full, caption "300 of 300 pages transcribed · 300 verified", CTA label "Review pages"); budget-stop (amber calm card "Spent $10.00 of $10.00" + "Raise the limit", header budget in amber); failed-pages (inline error-red line "3 pages failed — open to re-read them" linking into verification). Theme toggle covers dark.

GROUND TRUTH RESULTS (conditional card, prop groundTruth: none / has-results): when at least one blind-typed page exists, a fourth quiet card appears — header "GROUND TRUTH" with "8 of 300 pages typed blind"; body "CER 3.2% — measured against your blind-typed pages." (figures mono; CER is the product's headline quality metric); quiet link "Type more pages" opening Ground-truth mode (same destination as the overflow item). With groundTruth=none the card is absent — the overflow menu stays the only entry.

DO NOT: no page-thumbnail grids, no activity history, no sharing, no editing of title or preset here, no second budget meter in the topbar, no spinners, no toasts other than the export toast, no invented features. Produce the canonical processing state plus the three state variants and show the overflow menu open in one artboard.
````

Before approving, check:

- [ ] The page reads as an antechamber: three jobs only (progress, resume, export) — nothing invented
- [ ] "Continue verifying" resumes at the cursor ("resumes at page 47" in mono), never page 1
- [ ] Export… opens the Stage 9 dialog (not re-rendered here); toast and Download row are separate moments
- [ ] Overflow menu contains exactly "Ground-truth mode" — the mode's only entry point
- [ ] budget-stop and failed-pages states reuse the system's degraded-state card anatomy and colors
- [ ] Figures all mono; no spinner anywhere; topbar carries no extra budget meter

## Stage 10 — Ground-truth mode

Run: Iteration inside the Verification project (mode variant) or separate small project.

````text
Design the GROUND-TRUTH MODE screen for Transcripta, a web app for transcribing scanned handwritten documents. Use the attached Transcripta design system for all tokens (paper/ivory surfaces, ink text, seal-red accent, mono figures, kbd keycaps).

WHAT THIS MODE IS. To measure real accuracy (CER, Character Error Rate), a human must transcribe a page completely blind. If they see the model's version first, they agree with most of it — mistakes included — and the measurement shows nothing. So this mode hides the model's output entirely: image left, EMPTY input right. It is reached from the document menu only, never from the main verification flow.

BASELINE TO DIVERGE FROM. You have not seen the normal verification screen; for reference, it has a light paper header on ivory (document title, mini progress dots, "47 / 300", budget meter "$0.98 / $10.00"), a [✓ Correct] [✎ Edit] [↷ Skip] button row, a page-strip pager along the bottom, and seal-red context-word highlights in the text. Ground-truth mode must invert that chrome — dark ink frame, none of those elements — so the two screens can never be confused at a glance, even in a small thumbnail or from across the room.

LAYOUT (one screen, on the design system's focus shell — no sidebar; split-pane):

```
┌──────────────────────────────────────────────────────────┐
│ ██ GROUND-TRUTH MODE — the model's output is hidden  ██  │  ← inverted/marked chrome
│ Parish register, 1887                     Page 47 of 300 │
├──────────────────────────────┬───────────────────────────┤
│                              │  Your transcription       │
│   [scanned page image]       │  ┌─────────────────────┐  │
│   large, dominant            │  │ (empty input field) │  │
│                              │  │                     │  │
│   wheel — zoom · drag — pan  │  └─────────────────────┘  │
├──────────────────────────────┴───────────────────────────┤
│ [Ctrl+Enter] Save and next   [Esc] Exit ground-truth mode│
└──────────────────────────────────────────────────────────┘
```

ELEMENTS:
- Full-width banner, exact copy: "GROUND-TRUTH MODE — the model's output is hidden". The banner is part of an inverted chrome treatment (e.g. ink-dark header on the light theme) so the frame itself signals the mode, not just a label.
- Sub-line under the banner: "Type what you read on the scan. Seeing the model's version would bias you — ground truth is typed blind."
- Header row: document title "Parish register, 1887" (display serif) and "Page 47 of 300" in mono figures.
- Left pane: the scanned page, large and dominant, with the hint line "wheel — zoom · drag — pan".
- Right pane: label "Your transcription" above a large empty textarea, placeholder "Type exactly what you see on the scan…". Visible focus ring; comfortable reading-size type.
- Footer: kbd keycaps "Ctrl+Enter — Save and next", "Esc — Exit ground-truth mode".

STRICTLY ABSENT (this is the point of the mode): no model text, no seal-red context-word highlights, no "suggested by the context" legend, no lexicon panel, no confirm/skip actions, and none of the baseline furniture (meter, dots, page strip, button row).

EMPHASIZE: the unmistakable mode chrome; the emptiness of the input as a deliberate, honest state (not a broken/loading state); the image as the sole source of truth; keyboard-first affordances; zero decoration or animation — this is a measurement instrument.

DO NOT: show any model output, ghost text, or autocomplete in the input; use seal-red highlight marks anywhere; make the empty input look like an error or skeleton state; reuse the baseline verification header described above; add transition animations; mock the document page or its menu — the entry point (a "Ground-truth mode" item in the document's overflow menu) is out of scope for this screen.

THIS TURN, produce ONLY artboard 1 — canonical state: empty input, focus in the textarea, light theme — as 2–3 labeled variants (1a/1b/1c) varying ONE aspect: the chrome treatment that makes the mode unmistakable. 1a inverted ink-dark header band; 1b full ink frame around the entire viewport; 1c banner plus a hatched/stamped border motif. Everything else stays identical across variants.

FOLLOW-UP TURN (PO: after picking a winner, paste this as the next message, filling in 1x): "Go with 1x. Now produce artboards 2 and 3 in that exact chrome, one canonical version each:
2. In-progress: user has typed plain unstyled text — 'No. 15. Born on 11 January, Anna. Parents: peasant of Dykanka village, Petr Iva' with a text cursor. No highlights of any kind.
3. Dark theme: near-black warm chrome, the scanned page stays light and is the brightest object on screen; the mode marking must still read as clearly different from the normal dark verification screen, which keeps its meter, dots and page strip."
````

Before approving, check:

- [ ] Turn 1 output is ONLY artboard 1 as variants 1a/1b/1c differing solely in the chrome treatment; artboards 2–3 appear only after the 'Go with 1x' follow-up and match the chosen chrome exactly.
- [ ] The banner reads exactly 'GROUND-TRUTH MODE — the model's output is hidden' and the chrome visibly inverts the described baseline (paper header, progress dots, budget meter, button row, page strip) — passes a squint/thumbnail test with no possible confusion.
- [ ] The input is truly empty in the canonical artboard: no model text, no ghost/placeholder that resembles a transcription, and the in-progress artboard (follow-up turn) shows plain text with zero context-word highlights.
- [ ] No verification-flow furniture leaked in: no Correct/Edit/Skip buttons, no page strip, no lexicon panel, no budget meter, no progress dots.
- [ ] The empty textarea reads as a deliberate ready state (clear focus ring, placeholder, label), not as a loading skeleton or error.
- [ ] The scanned image is large and dominant with 'wheel — zoom · drag — pan' hints, since it is the only source of truth on this screen.
- [ ] Dark theme artboard (follow-up turn) keeps the scan as the brightest object and the mode chrome still reads as distinct from the normal dark verification screen (which keeps meter, dots and strip).
- [ ] No document page or overflow menu is mocked anywhere — the 'Ground-truth mode' menu entry point is out of scope for this pack, so no invented menu items appear.
- [ ] Keyboard affordances use the system's kbd keycap component (Ctrl+Enter save-and-next, Esc exit) and page figures ('Page 47 of 300') are in mono.

## Artifacts (exported 2026-08-22)

All stages were executed and PO-approved; project archives are unzipped alongside this file. Live projects (editable via each project's chat; the design system is published as the org default):

| Folder | Stage | Live project |
| --- | --- | --- |
| `design-system/` | 1 — Ink & Paper system (tokens, core kit, 3 shells, product components) | https://claude.ai/design/p/fa1864d6-1ebd-41ed-96b4-f72276642b99 |
| `brand/` | 2 — "Nib" mark (final + archived explorations) | https://claude.ai/design/p/88bc9205-1684-4da2-8b58-87d77257b54e |
| `landing/` | 3 — landing (hero 1a canonical + variants archive) | https://claude.ai/design/p/35c5ee47-3327-4acb-b046-7d82b7b69238 |
| `auth/` | 4 — sign in/up (brandMoment B, interactive props) | https://claude.ai/design/p/613042d8-a9f3-450c-8c8a-ace94eaa275f |
| `workspace/` | 5 — document list (variant A + archive) | https://claude.ai/design/p/a1ba8ad9-61ee-4f2d-a82d-d81f7f2fc803 |
| `upload/` | 6 — new document (5 screen states) | https://claude.ai/design/p/a7674cb3-2c0d-49d8-8e60-7650e02e7222 |
| `verification/` | 7 — hero screen (highlight C, degraded states) | https://claude.ai/design/p/54224198-fed8-4442-a740-53d559288d07 |
| `preset-editor/` | 8 — new/edit preset (variant A, editMode) | https://claude.ai/design/p/500875ac-151a-43cb-8c5f-043d170b15d8 |
| `export-dialog/` | 9 — export dialog (2a warning, post-export moments) | https://claude.ai/design/p/a62f00ef-95f5-4050-8457-f589ef4e20f6 |
| `document-page/` | 9b — document page (jobs cards + CER ground-truth card) | https://claude.ai/design/p/b541e1be-cedc-4558-b0ee-2b39a7812c90 |
| `ground-truth/` | 10 — blind typing mode (1a chrome, theme-polarity inversion) | https://claude.ai/design/p/6224e32d-f446-4f31-a3f1-d45f70fef6b3 |

Each folder holds the project's `*.dc.html` canvases (open in any browser), `support.js`, and `_ds/` — a snapshot of the design system the screens were built against.

## After the pack

- If not done already: **Publish** the design system and **Set as org default**, so every future design project in the org attaches Transcripta tokens by default.
- Export/download all artifacts — canvas files for each stage, plus the system's styles.css, theme.json, and component catalogue — into this repo's `design/` folder.
- Once React components exist in the repo, the design system can be re-derived at best fidelity via the **"Create using Claude Code"** path, which builds the system from the actual component code instead of prompts.
