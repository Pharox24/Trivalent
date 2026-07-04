# Trivalent Chemical Group — Website Design Spec

**Date:** 2026-07-05
**Status:** Approved pending user review
**Project root:** `/Users/abrahamzayed/Downloads/Chemical Company/website`

## Purpose

B2B lead-generation website for a chemical import/export trading house sourcing
from China and distributing into Egypt, the Gulf, and Africa. Primary audience:
factory procurement, distributors, and traders in those markets. The site's job
is to convert cold visitors into product inquiries while presenting an
awards-calibre design that holds up as a credibility piece.

## Brand

- **Name:** Trivalent Chemical Group ("Trivalent" as the wordmark).
  Rationale: a trivalent element forms exactly three bonds — encoding the
  company's three divisions. Abstract/technical per user preference.
- **Logo mark:** central node with three bonds radiating outward, drawn in the
  same thin line-art style as the rest of the site. SVG, inline.
- **Copy spine:** "three bonds, three divisions, one supply chain" — variations
  of this idea anchor the hero and About page.

## Visual system — "Molecular Precision"

- **Canvas:** white / light grey (#f7f8fa family). Generous whitespace, Swiss grid.
- **Accent:** deep teal (#0e6e6e family) with a darker ink color for text
  (#10151c family). Single accent color; no gradients as decoration.
- **Line-art:** thin scientific illustrations — molecular bonds, structural
  diagrams, route lines — as SVG, never raster.
- **Type:**
  - Display: IBM Plex Serif (light weights for large headlines)
  - Body/UI: IBM Plex Sans
  - Arabic: IBM Plex Sans Arabic
  - Chinese: Noto Sans SC
  - Loaded via self-hosted subsets or Google Fonts with `font-display: swap`.
- **Imagery:** licensed stock / generated imagery only for this build; real
  photos, logos, and certifications may be slotted in later. Photography is
  secondary to line-art — used inside diagram tooltips and division pages.

## Tech stack

- **Astro 5** static site. No backend.
- **Styling:** vanilla CSS with custom properties as design tokens
  (`tokens.css`); no CSS framework.
- **Animation:** GSAP + ScrollTrigger for scroll choreography; SVG path-draw
  animations for the value-chain diagram and route lines.
- **Diagram:** hand-built inline SVG + vanilla JS for hover/tap interactivity.
  No WebGL.
- **i18n:** Astro built-in i18n routing — `/en/`, `/ar/`, `/zh/`. Root `/`
  redirects to `/en/`. All copy lives in per-language content files (one
  dictionary module per language); templates are shared.
- **RTL:** Arabic build sets `dir="rtl"` on `<html>`; layout mirrors via CSS
  logical properties (`margin-inline-start`, etc.) so one stylesheet serves
  both directions. The value-chain diagram mirrors right-to-left in Arabic.
- **Deploy target:** plain static output (`dist/`), host-agnostic.

## Information architecture

Six pages × three languages = 18 routes from shared templates:

1. **Home**
2. **Oilfield & Drilling Chemicals** (`/oilfield`)
3. **PU, Coatings & Adhesives** (`/coatings`)
4. **Agro-Inputs** (`/agro`)
5. **About** (`/about`)
6. **Contact** (`/contact`)

Global nav: wordmark, three division links, About, Contact, language switcher
(EN / العربية / 中文). Footer: nav links, contact details, language switcher,
legal line.

## Homepage (approved wireframe)

Scroll order:

1. **Hero** — headline + one-line positioning (China→MENA/Africa chemical
   sourcing), thin molecular line-art background, CTA "Request Product Catalog"
   (links to Contact).
2. **Signature piece: interactive value-chain diagram** (see below).
3. **Three division cards** — Oilfield & Drilling Chemicals · PU, Coatings &
   Adhesives · Agro-Inputs; each links to its page.
4. **Why us / trade corridor** — credibility strip: China direct-mill sourcing
   relationships + existing Gulf oilfield operating history; simple animated
   CN→EG/Gulf/Africa route line.
5. **CTA / contact band** — inquiry prompt + direct contact details.
6. **Footer.**

## Signature value-chain diagram

- **Content:** feedstock → refining → three branching division paths → 
  destination markets (Egypt, Gulf, Africa). Inspired by the ICIS mindmap PDF
  but custom-drawn — not a reproduction.
- **Layout:** full-width horizontal flow on desktop; vertical top-to-bottom on
  mobile; mirrored right-to-left in Arabic.
- **Behavior:**
  - Scroll-driven: paths draw in as the section enters the viewport.
  - Hover (desktop) / tap (touch) on a node opens a small card with 2–4
    example products and a thumbnail.
  - Each division branch is clickable through to its division page.
  - Fully rendered (static, complete) without JavaScript; JS only adds
    animation and tooltips.
  - Nodes are keyboard-focusable (`tabindex`, `aria-describedby` tooltips).

## Division content

Product lists per division (placeholder copy at launch, drawn from the
company's actual sourcing focus):

- **Oilfield & Drilling Chemicals** — the established core. Weighting agents
  (barite), viscosifiers, fluid-loss additives, corrosion inhibitors,
  demulsifiers, cementing additives, completion & coiled-tubing chemicals.
  Credibility anchor: existing Gulf (Kuwait+) operating history.
- **PU, Coatings & Adhesives** — growth division, Egypt/Africa manufacturing
  focus. PU slurry for synthetic leather, shoe-sole PU systems, coatings raw
  materials (resins, titanium dioxide, pigments, solvents), industrial
  adhesives. Note: footwear/leather cluster positioning (e.g., Robbiki) may be
  referenced in copy.
- **Agro-Inputs** — opportunistic division. Glyphosate and crop-protection
  actives, sulphate of potash (SOP), water-soluble NPK / specialty
  fertilizers.
- **Exclusions (do not list):** urea/nitrogen commodities, methanol, PE/PP/
  PVC/PET/MEG, MOP potash — products the target markets already export or
  China does not export.

Each division page: hero statement, product family grid (name + short spec
line + typical applications), sourcing/QC note, inquiry CTA.

## Contact & inquiry form

- Fields: name, company, email, phone (optional), product interest (select),
  approximate quantity, destination port/country, message.
- Static-site handling: form `action` posts to a Formspree-style endpoint
  placeholder (documented constant, easy to swap); `mailto:` fallback link
  beside the form. No client data stored.
- Direct contact details (placeholder email/phone until real ones provided).

## Accessibility, performance, degradation

- All motion gated behind `prefers-reduced-motion: no-preference`.
- Site fully readable and navigable with JS disabled (diagram static, nav
  works, forms post).
- Semantic HTML, focus-visible states, WCAG AA contrast on teal/ink over
  white.
- Self-hosted/subset fonts, inline critical SVG, lazy-loaded images,
  `loading="lazy"` below the fold. Target: Lighthouse performance ≥ 90 mobile.

## Verification criteria

1. `astro build` completes clean; all 18 routes emitted.
2. Visual pass on all six EN pages (desktop + mobile widths).
3. RTL pass on Arabic home + one division page: mirrored layout, correct
   Arabic rendering, diagram mirrored.
4. Chinese typography pass (no fallback-font tofu).
5. Diagram: hover/tap tooltips work; keyboard focus reaches nodes; renders
   complete with JS disabled.
6. `prefers-reduced-motion` disables animations.
7. Lighthouse performance ≥ 90 on homepage (mobile emulation).

## Out of scope

- Real photography, logos, certifications (placeholders slotted for later).
- Backend, CMS, analytics, live form endpoint (placeholder constant only).
- SEO content beyond sensible titles/meta/OG tags per language.
- Deployment/hosting setup.
