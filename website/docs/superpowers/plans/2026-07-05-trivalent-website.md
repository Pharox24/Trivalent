# Trivalent Chemical Group Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the trilingual (EN/AR/ZH) Astro 5 static site for Trivalent Chemical Group per the approved spec at `docs/superpowers/specs/2026-07-05-trivalent-website-design.md`.

**Architecture:** Six shared page templates under a dynamic `[lang]` route emit 18 static routes. All copy lives in three parallel dictionary modules with a build-time parity check. Motion (Lenis + GSAP + SplitText), the OGL hero shader, and the SVG value-chain diagram are progressive-enhancement layers over a fully static, JS-free-readable site.

**Tech Stack:** Astro 5, vanilla CSS design tokens, GSAP (ScrollTrigger, SplitText), Lenis, OGL, hand-built inline SVG. No Tailwind, no backend.

**Project root for all paths below:** `/Users/abrahamzayed/Downloads/Chemical Company/website`

---

### Task 1: Scaffold Astro project + design tokens

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Create: `src/pages/index.astro` (root redirect stub)

- [ ] **Step 1: Write config files**

`package.json`:
```json
{
  "name": "trivalent-site",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "node scripts/check-i18n.mjs && astro build",
    "preview": "astro preview",
    "test": "node scripts/check-i18n.mjs"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "gsap": "^3.12.0",
    "lenis": "^1.1.0",
    "ogl": "^1.0.0"
  }
}
```

`astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://trivalent-chemical.com',
  trailingSlash: 'ignore',
});
```

`tsconfig.json`:
```json
{ "extends": "astro/tsconfigs/base" }
```

`.gitignore`:
```
node_modules/
dist/
.astro/
.superpowers/
```

- [ ] **Step 2: Write `src/styles/tokens.css`** — the design system source of truth:

```css
:root {
  /* Molecular Precision palette */
  --paper: #f7f8fa;
  --paper-raised: #ffffff;
  --ink: #10151c;
  --ink-soft: #5b6773;
  --teal: #0d6b6b;
  --teal-deep: #094f4f;
  --teal-wash: #e3efef;
  --line: #d9dee5;

  /* Fluid type scale (clamp between 380px and 1440px viewports) */
  --step--1: clamp(0.78rem, 0.74rem + 0.18vw, 0.89rem);
  --step-0: clamp(0.94rem, 0.88rem + 0.25vw, 1.06rem);
  --step-1: clamp(1.17rem, 1.08rem + 0.39vw, 1.42rem);
  --step-2: clamp(1.46rem, 1.31rem + 0.63vw, 1.89rem);
  --step-3: clamp(1.83rem, 1.58rem + 1.03vw, 2.52rem);
  --step-4: clamp(2.29rem, 1.9rem + 1.65vw, 3.36rem);
  --step-5: clamp(2.86rem, 2.26rem + 2.6vw, 4.48rem);
  --step-6: clamp(3.58rem, 2.66rem + 4vw, 5.96rem);

  /* Space scale */
  --space-2xs: clamp(0.25rem, 0.23rem + 0.1vw, 0.31rem);
  --space-xs: clamp(0.5rem, 0.46rem + 0.19vw, 0.63rem);
  --space-s: clamp(0.75rem, 0.69rem + 0.28vw, 0.94rem);
  --space-m: clamp(1.13rem, 1.04rem + 0.42vw, 1.41rem);
  --space-l: clamp(1.5rem, 1.38rem + 0.56vw, 1.88rem);
  --space-xl: clamp(2.25rem, 2.06rem + 0.85vw, 2.81rem);
  --space-2xl: clamp(3rem, 2.75rem + 1.13vw, 3.75rem);
  --space-3xl: clamp(4.5rem, 4.13rem + 1.69vw, 5.63rem);
  --space-4xl: clamp(6rem, 5.5rem + 2.25vw, 7.5rem);

  /* Type families — set per-language on <html> in Base.astro */
  --font-display: 'IBM Plex Serif', 'Noto Sans SC', serif;
  --font-body: 'IBM Plex Sans', 'IBM Plex Sans Arabic', 'Noto Sans SC', sans-serif;

  /* Motion */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);
  --dur-s: 0.35s;
  --dur-m: 0.7s;
  --dur-l: 1.2s;

  --container: 84rem;
  --gutter: clamp(1.25rem, 4vw, 3rem);
}
```

- [ ] **Step 3: Write `src/styles/global.css`** — reset, base typography, utilities:

```css
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; margin: 0; }

html { scroll-behavior: smooth; }
html.lenis { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto; }

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--step-0);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 { font-family: var(--font-display); font-weight: 300; line-height: 1.12; letter-spacing: -0.015em; }
h1 { font-size: var(--step-6); }
h2 { font-size: var(--step-4); }
h3 { font-size: var(--step-2); }
strong { font-weight: 600; }

a { color: inherit; }
img, svg { display: block; max-width: 100%; }
button { font: inherit; cursor: pointer; }

:focus-visible { outline: 2px solid var(--teal); outline-offset: 3px; }

.container { max-width: var(--container); margin-inline: auto; padding-inline: var(--gutter); }

.label {
  font-size: var(--step--1);
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--teal);
}
html[lang='ar'] .label, html[lang='zh'] .label { letter-spacing: 0.1em; }

.section { padding-block: var(--space-4xl); }

/* Animated link underline */
.u-link { text-decoration: none; background: linear-gradient(currentColor, currentColor) no-repeat 0 100% / 0 1px; transition: background-size var(--dur-s) var(--ease-out-expo); }
.u-link:hover { background-size: 100% 1px; }
html[dir='rtl'] .u-link { background-position: 100% 100%; }

/* Reveal defaults (JS enhances; static without) */
[data-reveal], [data-split] { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 4: Write stub `src/pages/index.astro`** (root → `/en/` redirect):

```astro
---
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=/en/" />
    <link rel="canonical" href="/en/" />
    <title>Trivalent Chemical Group</title>
  </head>
  <body><a href="/en/">Trivalent Chemical Group — continue</a></body>
</html>
```

- [ ] **Step 5: Install and verify build**

Run: `cd "/Users/abrahamzayed/Downloads/Chemical Company/website" && npm install`
Then create a placeholder `scripts/check-i18n.mjs` containing `process.exit(0)` (real version in Task 2), then:
Run: `npm run build`
Expected: build completes, `dist/index.html` exists.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore src scripts
git commit -m "feat: scaffold Astro project with Molecular Precision design tokens"
```

---

### Task 2: Trilingual i18n dictionaries + parity check

**Files:**
- Create: `src/i18n/en.ts`, `src/i18n/ar.ts`, `src/i18n/zh.ts`, `src/i18n/index.ts`
- Replace: `scripts/check-i18n.mjs` (real implementation)

- [ ] **Step 1: Write `src/i18n/index.ts`:**

```ts
import { en } from './en';
import { ar } from './ar';
import { zh } from './zh';

export const langs = ['en', 'ar', 'zh'] as const;
export type Lang = (typeof langs)[number];
export type Dict = typeof en;

const dicts: Record<Lang, Dict> = { en, ar, zh };

export const t = (lang: Lang): Dict => dicts[lang];
export const dirFor = (lang: Lang): 'ltr' | 'rtl' => (lang === 'ar' ? 'rtl' : 'ltr');
export const pathFor = (lang: Lang, slug = '') => `/${lang}/${slug}${slug ? '/' : ''}`;
export const langLabel: Record<Lang, string> = { en: 'EN', ar: 'العربية', zh: '中文' };
```

- [ ] **Step 2: Write `src/i18n/en.ts`** — the master dictionary. Complete EN copy (nav, footer, home hero/diagram/divisions/corridor/cta, three division pages with product families, about, contact incl. form labels, meta titles/descriptions per page). Structure:

```ts
export const en = {
  meta: {
    home: { title: 'Trivalent Chemical Group — Chemical sourcing, China to MENA & Africa', desc: 'B2B chemical import and distribution: oilfield chemicals, PU & coatings raw materials, and agro-inputs, sourced direct from Chinese mills and delivered to Egypt, the Gulf, and Africa.' },
    oilfield: { title: 'Oilfield & Drilling Chemicals — Trivalent', desc: 'Barite, viscosifiers, fluid-loss additives, and completion chemicals with an established Gulf operating record.' },
    coatings: { title: 'PU, Coatings & Adhesives — Trivalent', desc: 'Polyurethane systems for synthetic leather and footwear, coatings raw materials, and industrial adhesives for Egyptian and African manufacturers.' },
    agro: { title: 'Agro-Inputs — Trivalent', desc: 'Glyphosate, sulphate of potash, and water-soluble fertilizers for MENA and African agriculture.' },
    about: { title: 'About — Trivalent Chemical Group', desc: 'Three bonds, three divisions, one supply chain between China and the markets of Egypt, the Gulf, and Africa.' },
    contact: { title: 'Contact — Trivalent Chemical Group', desc: 'Request a product catalog or a quotation. Tell us the product, quantity, and destination port.' },
  },
  nav: { oilfield: 'Oilfield', coatings: 'Coatings', agro: 'Agro', about: 'About', contact: 'Contact', catalog: 'Request Catalog' },
  hero: {
    kicker: 'Precision chemical sourcing · China → MENA · Africa',
    line1: 'Engineered supply,',
    line2: 'molecule to market.',
    sub: 'Trivalent imports industrial chemicals in bulk from audited Chinese mills and distributes them direct to factories across Egypt, the Gulf, and Africa.',
    cta: 'Request Product Catalog',
    scroll: 'Scroll',
  },
  diagram: {
    kicker: 'The value chain',
    title: 'From feedstock to your factory gate.',
    sub: 'Every product we trade sits on a chain we can trace. Hover any node to see what moves through it.',
    nodes: { /* per-node labels + tooltip product lists — see Task 7 data module */ },
  },
  divisions: {
    kicker: 'Three divisions',
    title: 'Three bonds. One supply chain.',
    items: {
      oilfield: { name: 'Oilfield & Drilling Chemicals', blurb: 'The established core: drilling-fluid and completion chemistry with a working Gulf operating record.', cta: 'Explore division' },
      coatings: { name: 'PU, Coatings & Adhesives', blurb: 'Polyurethane systems and coatings raw materials for the factories making Egypt and Africa’s leather, footwear, and finishes.', cta: 'Explore division' },
      agro: { name: 'Agro-Inputs', blurb: 'Crop-protection actives and specialty fertilizers, registered and delivered where the growth is.', cta: 'Explore division' },
    },
  },
  corridor: { /* kicker, title, three proof points (direct-mill sourcing, Gulf record, corridor logistics), route city labels */ },
  cta: { title: 'Tell us the product, the tonnage, and the port.', sub: 'We answer with a landed price.', button: 'Start an inquiry' },
  oilfieldPage: { /* hero statement, intro, products[] (name, spec, applications), sourcingNote, cta */ },
  coatingsPage: { /* same shape */ },
  agroPage: { /* same shape */ },
  aboutPage: { /* story, name meaning, sourcing model, corridor, values */ },
  contactPage: { /* title, intro, form: {name, company, email, phone, product, quantity, destination, message, submit}, direct contact block, mailto label */ },
  footer: { tagline: 'Chemical import & distribution — China to MENA and Africa.', rights: '© 2026 Trivalent Chemical Group. All rights reserved.', lang: 'Language' },
} as const;
```

Write every section marked with a comment above IN FULL at implementation time — final copy, no lorem ipsum. Division product families come from the spec's Division content section (oilfield: barite/viscosifiers/fluid-loss/corrosion inhibitors/demulsifiers/cementing/completion & coiled-tubing; coatings: PU slurry/shoe-sole systems/resins/TiO₂/pigments/adhesives; agro: glyphosate/SOP/water-soluble NPK/micronutrients). Respect the spec's exclusion list (no urea, methanol, PE/PP/PVC/PET/MEG, MOP).

- [ ] **Step 3: Write `src/i18n/ar.ts` and `src/i18n/zh.ts`** — complete translations of every key. Arabic: formal MSA business register (e.g. hero line: «إمدادٌ مُهندَس، من الجزيء إلى السوق.»; nav: «حقول النفط / الطلاءات / الزراعة / من نحن / اتصل بنا»). Chinese: simplified, trade register (e.g. hero: «精工供应，从分子到市场。»; nav: «油田化学品 / 涂料与胶粘 / 农化 / 关于我们 / 联系我们»). Same object shape as `en.ts`, typed `: Dict`.

- [ ] **Step 4: Write real `scripts/check-i18n.mjs`:**

```js
import { en } from '../src/i18n/en.ts';
import { ar } from '../src/i18n/ar.ts';
import { zh } from '../src/i18n/zh.ts';

const keyPaths = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? keyPaths(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  );

const base = new Set(keyPaths(en));
let failed = false;
for (const [name, dict] of [['ar', ar], ['zh', zh]]) {
  const keys = new Set(keyPaths(dict));
  const missing = [...base].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !base.has(k));
  if (missing.length || extra.length) {
    failed = true;
    console.error(`[i18n] ${name}: missing=${missing.join(',') || '-'} extra=${extra.join(',') || '-'}`);
  }
}
if (failed) process.exit(1);
console.log('[i18n] all dictionaries in parity');
```

Note: run via `node --experimental-strip-types` if plain `node` can't import `.ts` (add to the `test` script if needed; Node 23+ strips types natively).

- [ ] **Step 5: Run parity check — verify it fails on a deliberately missing key, then passes**

Run: `npm test` with one AR key temporarily removed → expect exit 1 listing the key. Restore key, run again → expect `[i18n] all dictionaries in parity`.

- [ ] **Step 6: Commit**

```bash
git add src/i18n scripts/check-i18n.mjs
git commit -m "feat: trilingual EN/AR/ZH dictionaries with build-time parity check"
```

---

### Task 3: Base layout, nav, footer, logo

**Files:**
- Create: `src/layouts/Base.astro`, `src/components/Logo.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`

- [ ] **Step 1: `src/components/Logo.astro`** — inline SVG wordmark: central node + three bonds at 120° spacing + "TRIVALENT" in Plex Sans 600 tracking-wide. Mark:

```html
<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
  <g stroke="var(--teal)" stroke-width="1.6" fill="none">
    <line x1="16" y1="16" x2="16" y2="4" />
    <line x1="16" y1="16" x2="5.6" y2="22" />
    <line x1="16" y1="16" x2="26.4" y2="22" />
  </g>
  <circle cx="16" cy="16" r="3.2" fill="var(--teal)" />
  <circle cx="16" cy="4" r="2.2" fill="var(--ink)" />
  <circle cx="5.6" cy="22" r="2.2" fill="var(--ink)" />
  <circle cx="26.4" cy="22" r="2.2" fill="var(--ink)" />
</svg>
```

- [ ] **Step 2: `src/components/Nav.astro`** — props `{ lang, current }`. Fixed header, paper background with backdrop blur on scroll, logo links to `pathFor(lang)`, links from `t(lang).nav` (three divisions, About, Contact), language switcher (three `<a>` to same slug in other langs, current one `aria-current`), "Request Catalog" as teal button. Mobile: hamburger → full-screen overlay menu (details/summary or button + dialog, works without JS via CSS `:target` fallback or plain anchor list visible in no-JS).

- [ ] **Step 3: `src/components/Footer.astro`** — props `{ lang }`. Dark ink background inversion (ink bg, paper text): logo, tagline, nav links, language switcher, contact email, rights line.

- [ ] **Step 4: `src/layouts/Base.astro`** — props `{ lang, slug, title, desc }`:

```astro
---
import { ClientRouter } from 'astro:transitions';
import { dirFor, langs, pathFor, type Lang } from '../i18n';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';
const { lang, slug = '', title, desc } = Astro.props as { lang: Lang; slug?: string; title: string; desc: string };
const fontHref = {
  en: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,300;0,400;1,300&family=IBM+Plex+Sans:wght@400;500;600&display=swap',
  ar: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@300;400&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap',
  zh: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@300;400&family=IBM+Plex+Sans:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&display=swap',
}[lang];
---
<!doctype html>
<html lang={lang} dir={dirFor(lang)}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={desc} />
    {langs.map((l) => <link rel="alternate" hreflang={l} href={pathFor(l, slug)} />)}
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href={fontHref} />
    <ClientRouter />
  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>
    <Nav lang={lang} current={slug} />
    <main id="main"><slot /></main>
    <Footer lang={lang} />
    <script src="../scripts/app.ts"></script>
  </body>
</html>
```

Arabic pages set `--font-display: 'IBM Plex Sans Arabic'` override on `html[lang='ar']` (Plex Serif has no Arabic); Chinese sets Noto fallback order. Add `public/favicon.svg` (the logo mark).

- [ ] **Step 5: Verify + commit**

Temporary: point `src/pages/index.astro`'s redirect target page at a stub using Base (full pages come in Task 4). Run `npm run build` → clean.

```bash
git add src/layouts src/components public/favicon.svg
git commit -m "feat: base layout with trilingual fonts, nav, footer, logo"
```

---

### Task 4: Page routes (18 static routes)

**Files:**
- Create: `src/pages/[lang]/index.astro`, `[lang]/oilfield.astro`, `[lang]/coatings.astro`, `[lang]/agro.astro`, `[lang]/about.astro`, `[lang]/contact.astro`

- [ ] **Step 1:** Each page exports the same `getStaticPaths`:

```astro
---
import Base from '../../layouts/Base.astro';
import { langs, t, type Lang } from '../../i18n';
export function getStaticPaths() { return langs.map((lang) => ({ params: { lang } })); }
const lang = Astro.params.lang as Lang;
const dict = t(lang);
---
<Base lang={lang} slug="" title={dict.meta.home.title} desc={dict.meta.home.desc}>
  <!-- section components fill in over Tasks 6–12 -->
</Base>
```

Stub each of the six with its correct `slug` + meta. Home sections land Tasks 6–9; division/about/contact content Tasks 10–12.

- [ ] **Step 2: Verify route emission**

Run: `npm run build && find dist -name 'index.html' | sort`
Expected: 19 files — root redirect + `{en,ar,zh} × {/, oilfield, coatings, agro, about, contact}`.

- [ ] **Step 3: Commit** — `git commit -m "feat: 18 trilingual static routes from six shared templates"`

---

### Task 5: Motion foundation (Lenis + GSAP + SplitText, view-transition safe)

**Files:**
- Create: `src/scripts/app.ts`, `src/scripts/motion.ts`

- [ ] **Step 1: `src/scripts/motion.ts`:**

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const prefersReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = () => matchMedia('(pointer: coarse)').matches;

let lenis: Lenis | null = null;

export function initMotion() {
  if (prefersReduced()) return;

  if (!isTouch() && !lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis!.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Masked line-by-line headline reveals
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Simple fade-up reveals
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 28, opacity: 0, duration: 0.9, ease: 'power3.out',
      delay: Number(el.dataset.revealDelay ?? 0),
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });
}

export function destroyMotion() {
  ScrollTrigger.getAll().forEach((st) => st.kill());
}
```

- [ ] **Step 2: `src/scripts/app.ts`** — lifecycle wiring (this is the file Base.astro loads):

```ts
import { initMotion, destroyMotion } from './motion';

document.addEventListener('astro:page-load', () => initMotion());
document.addEventListener('astro:before-swap', () => destroyMotion());
```

(`astro:page-load` also fires on initial load, so no separate DOMContentLoaded needed.)

- [ ] **Step 3: Verify** — `npm run build` clean; then `npm run dev`, add `data-split` to a stub heading, confirm masked line reveal on load and that navigating between two pages and back still animates (no double-fire, no dead triggers).

- [ ] **Step 4: Commit** — `git commit -m "feat: motion foundation — Lenis, ScrollTrigger, SplitText, VT-safe lifecycle"`

---

### Task 6: Homepage hero + OGL shader backdrop

**Files:**
- Create: `src/components/Hero.astro`, `src/scripts/shader.ts`

- [ ] **Step 1: `src/components/Hero.astro`** — full-viewport section: kicker label, two-line `<h1 data-split>` display headline, sub paragraph, primary CTA button (`data-magnetic`, links to contact page), scroll hint. Behind the text: a `<canvas class="hero-canvas">` (absolute, inset 0, `aria-hidden`) AND a static molecular line-art SVG (thin teal bonds/nodes scattered on the grid, the no-JS/no-WebGL fallback). Canvas sits above SVG; on shader failure the canvas is removed, revealing the SVG.

- [ ] **Step 2: `src/scripts/shader.ts`** — OGL fullscreen-triangle fragment shader: paper-white base, extremely faint teal caustic refraction (2-octave value-noise fbm warped by time + mouse position, ~6% max tint), `mix` toward `--teal-wash`. Gate: skip entirely under `prefers-reduced-motion` or when `renderer.gl` fails; try/catch removes canvas on error. Pause rendering via `IntersectionObserver` when hero off-screen. Init/destroy hooked into the same `astro:page-load`/`astro:before-swap` events in `app.ts` (only runs when `.hero-canvas` exists on the page).

Fragment shader core:

```glsl
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  float a=fract(sin(dot(i,vec2(127.1,311.7)))*43758.5);
  float b=fract(sin(dot(i+vec2(1,0),vec2(127.1,311.7)))*43758.5);
  float c=fract(sin(dot(i+vec2(0,1),vec2(127.1,311.7)))*43758.5);
  float d=fract(sin(dot(i+vec2(1,1),vec2(127.1,311.7)))*43758.5);
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=uv*3.0; p+= (uMouse-0.5)*0.35;
  float v=n(p+uTime*0.06)+0.5*n(p*2.3-uTime*0.04);
  float caustic=smoothstep(0.62,0.98,v);
  vec3 col=mix(vec3(0.969,0.973,0.980), vec3(0.890,0.937,0.937), caustic*0.65);
  gl_FragColor=vec4(col,1.0);}
```

- [ ] **Step 3: Verify** — dev server: shader visible as faint moving tint, mouse subtly shifts it; block WebGL (devtools) → SVG fallback shows; reduced-motion emulation → no canvas. Build clean.

- [ ] **Step 4: Commit** — `git commit -m "feat: hero with SplitText headline and OGL caustic backdrop with SVG fallback"`

---

### Task 7: Value-chain diagram — data + static SVG

**Files:**
- Create: `src/data/valuechain.ts`, `src/components/ValueChainDiagram.astro`

- [ ] **Step 1: `src/data/valuechain.ts`** — single source of truth; positions for desktop (1200×560 viewBox) and mobile vertical (420×980):

```ts
export type VCNode = {
  id: string;               // i18n key under diagram.nodes
  tier: 'feedstock' | 'process' | 'division' | 'market';
  x: number; y: number;     // desktop coords
  mx: number; my: number;   // mobile vertical coords
  href?: 'oilfield' | 'coatings' | 'agro'; // division nodes link out
};
export const nodes: VCNode[] = [
  { id: 'hydrocarbons', tier: 'feedstock', x: 90,  y: 200, mx: 210, my: 70 },
  { id: 'minerals',     tier: 'feedstock', x: 90,  y: 360, mx: 210, my: 170 },
  { id: 'refining',     tier: 'process',   x: 400, y: 200, mx: 210, my: 300 },
  { id: 'synthesis',    tier: 'process',   x: 400, y: 360, mx: 210, my: 400 },
  { id: 'oilfield',     tier: 'division',  x: 720, y: 120, mx: 210, my: 540, href: 'oilfield' },
  { id: 'coatings',     tier: 'division',  x: 720, y: 280, mx: 210, my: 640, href: 'coatings' },
  { id: 'agro',         tier: 'division',  x: 720, y: 440, mx: 210, my: 740, href: 'agro' },
  { id: 'egypt',        tier: 'market',    x: 1080, y: 140, mx: 110, my: 900 },
  { id: 'gulf',         tier: 'market',    x: 1080, y: 280, mx: 210, my: 920 },
  { id: 'africa',       tier: 'market',    x: 1080, y: 420, mx: 310, my: 900 },
];
export const edges: [string, string][] = [
  ['hydrocarbons', 'refining'], ['hydrocarbons', 'synthesis'], ['minerals', 'synthesis'],
  ['refining', 'oilfield'], ['refining', 'coatings'],
  ['synthesis', 'oilfield'], ['synthesis', 'coatings'], ['synthesis', 'agro'],
  ['oilfield', 'egypt'], ['oilfield', 'gulf'],
  ['coatings', 'egypt'], ['coatings', 'africa'],
  ['agro', 'egypt'], ['agro', 'gulf'], ['agro', 'africa'],
];
```

Add matching `diagram.nodes` entries to all three dictionaries: each node `{ label, products: string[] }` (2–4 example products; markets list ports instead — Alexandria/Ain Sokhna, Kuwait/Jebel Ali, Lagos/Mombasa). Run `npm test` for parity.

- [ ] **Step 2: `src/components/ValueChainDiagram.astro`** — props `{ lang }`. Renders section header (kicker/title/sub from dict) + `<svg>`:
- Edges: cubic beziers `M x1,y1 C midX,y1 midX,y2 x2,y2` with `pathLength="1"`, class `vc-edge`, thin `var(--line)` stroke, teal on connected-node hover.
- Nodes: `<g class="vc-node" data-node={id} tabindex="0" role="button" aria-expanded="false">` — circle (tier-styled: feedstock hollow, process double-ring, division filled teal, market ink) + label `<text>`. Division nodes wrapped in `<a href={pathFor(lang, node.href)}>`.
- RTL: `const X = (x: number) => isRTL ? 1200 - x : x;` applied to every x coordinate and bezier control point at build time; text-anchor flips end↔start.
- Mobile: same component emits a second `<svg class="vc-svg--mobile">` using `mx/my` (vertical flow); CSS shows one per breakpoint (`@media (max-width: 720px)`).
- Tooltip container: one empty `<div class="vc-tip" role="tooltip" hidden>` sibling; each node gets `aria-describedby="vc-tip"` when open (Task 8).
- No-JS: full diagram visible statically (edges drawn, all labels legible).

- [ ] **Step 3: Verify** — build clean; EN desktop and mobile widths render both orientations correctly; AR page mirrors (feedstock on right); division nodes navigate.

- [ ] **Step 4: Commit** — `git commit -m "feat: value-chain diagram — data module and static SVG, RTL-mirrored, dual orientation"`

---

### Task 8: Diagram interactivity + scroll draw

**Files:**
- Create: `src/scripts/diagram.ts`
- Modify: `src/scripts/app.ts` (init/destroy hooks), `src/components/ValueChainDiagram.astro` (serialize tooltip data)

- [ ] **Step 1:** Serialize per-node tooltip content into the DOM: `<script type="application/json" id="vc-data">{JSON.stringify(tooltipData)}</script>` inside the component (localized at build).

- [ ] **Step 2: `src/scripts/diagram.ts`:**
- Scroll draw: `gsap.from('.vc-edge', { strokeDashoffset: 1 })` — set `stroke-dasharray: 1; stroke-dashoffset: 1` via CSS (using `pathLength=1`), animate to 0 with `scrollTrigger: { trigger: '.vc-section', start: 'top 70%', end: 'top 20%', scrub: 1 }`, staggered by tier order; node groups pop in (`scale: 0 → 1`, `transformOrigin: center`) at their tier's moment. Under reduced-motion: skip (CSS keeps everything visible by default — the dash styles are applied only by JS before animating).
- Tooltips: on `mouseenter`/`focus`/`click` of `.vc-node` → fill `.vc-tip` with `<strong>{label}</strong><ul>…products…</ul>`, position near node (flip if near viewport edge), unhide; `mouseleave`/`blur`/`Escape` hides; `aria-expanded` synced. Tap on touch toggles.
- Cursor hint: nodes set `data-cursor="expand"` (consumed by Task 13's custom cursor).
- Export `initDiagram()/destroyDiagram()`; wire into `app.ts` lifecycle (guard: only when `.vc-section` exists).

- [ ] **Step 3: Verify** — scrolling draws edges tier by tier; hover/focus/tap tooltips work incl. keyboard Tab + Escape; JS disabled → diagram fully visible; reduced-motion → no draw animation, tooltips still work. Build clean.

- [ ] **Step 4: Commit** — `git commit -m "feat: scroll-drawn value-chain flow with accessible node tooltips"`

---

### Task 9: Homepage — division cards, corridor strip, CTA band

**Files:**
- Create: `src/components/DivisionCards.astro`, `src/components/CorridorStrip.astro`, `src/components/CtaBand.astro`
- Modify: `src/pages/[lang]/index.astro` (assemble all home sections in wireframe order)

- [ ] **Step 1: `DivisionCards.astro`** — three cards on the Swiss grid (1fr 1fr 1fr desktop, stack mobile): oversized index numeral (01/02/03 in Plex Serif 300, teal), division name h3, blurb, "Explore division" u-link with arrow that translates on hover (logical direction — flips in RTL). Card: paper-raised bg, 1px line border, hover lifts 4px + border→teal, `data-reveal` staggered.

- [ ] **Step 2: `CorridorStrip.astro`** — ink-inverted full-bleed band: kicker + title + three proof points (direct-mill sourcing; established Gulf operating record; corridor logistics CN→MENA/Africa). Below: wide SVG route line — dotted bezier from a CN origin point through Gulf/Egypt/Africa points, city labels in `--step--1`, animated `stroke-dashoffset` march (CSS keyframes, paused under reduced-motion), mirrored in RTL like the diagram.

- [ ] **Step 3: `CtaBand.astro`** — oversized display statement (`data-split`) + sub + magnetic teal button → contact page.

- [ ] **Step 4:** Assemble homepage: Hero → ValueChainDiagram → DivisionCards → CorridorStrip → CtaBand. Verify all three languages render, RTL mirrors, build clean.

- [ ] **Step 5: Commit** — `git commit -m "feat: homepage complete — division cards, corridor strip, CTA band"`

---

### Task 10: Division pages (template + three instances)

**Files:**
- Create: `src/components/DivisionPage.astro`, `src/components/ProductGrid.astro`, `src/components/illustrations/{Derrick,Coating,Leaf}.astro`
- Modify: `src/pages/[lang]/{oilfield,coatings,agro}.astro`

- [ ] **Step 1: `ProductGrid.astro`** — props `{ products }` where each product is `{ name, spec, applications }` from the dict. 2-col grid (1-col mobile): product name (h3, serif), one-line spec in `--ink-soft` mono-ish style, applications line prefixed by a small teal bond glyph. Border-top 1px per row, `data-reveal`.

- [ ] **Step 2: `DivisionPage.astro`** — props `{ lang, division: 'oilfield'|'coatings'|'agro' }`: hero (kicker = division index + name, `data-split` statement headline, intro paragraph) with the division's line-art illustration floated in the grid; ProductGrid; sourcing/QC note block (teal-wash background panel); CtaBand reuse.

- [ ] **Step 3: Illustrations** — three thin-line SVG drawings in the molecular style (1.4px teal strokes, ink nodes): Derrick (drilling rig + borehole + barite crystal), Coating (droplet + layered substrate cross-section + polymer chain), Leaf (leaf + K₂SO₄ crystal + droplet). ~120–200 lines of SVG each, hand-composed.

- [ ] **Step 4:** Wire the three pages: `<DivisionPage lang={lang} division="oilfield" />` etc., with correct meta/slug. Populate `{oilfield,coatings,agro}Page` dict sections in all three languages (6–8 products each per the spec lists). `npm test` parity, build clean, visual check EN+AR.

- [ ] **Step 5: Commit** — `git commit -m "feat: three division pages with product grids and line-art illustrations"`

---

### Task 11: About page

**Files:**
- Modify: `src/pages/[lang]/about.astro`; add `aboutPage` copy to dictionaries

- [ ] **Step 1:** Sections: (1) statement hero — the name story ("A trivalent element forms exactly three bonds…") with the logo mark rendered large as line-art; (2) sourcing model — direct-mill relationships in China, QC/audit step, consolidated shipping; (3) corridor — compact reuse of CorridorStrip; (4) three values (traceability, price transparency, delivery reliability) on the card grid. All copy final in three languages; parity passes.

- [ ] **Step 2:** Verify build + visual pass; commit — `git commit -m "feat: about page with name story and sourcing model"`

---

### Task 12: Contact page + inquiry form

**Files:**
- Create: `src/config.ts`, `src/components/InquiryForm.astro`
- Modify: `src/pages/[lang]/contact.astro`; add `contactPage` copy

- [ ] **Step 1: `src/config.ts`:**

```ts
// Swap in the live endpoint when created (e.g. Formspree form ID).
export const FORM_ENDPOINT = 'https://formspree.io/f/REPLACE_ME';
export const CONTACT_EMAIL = 'trade@trivalent-chemical.com'; // placeholder until real address exists
```

- [ ] **Step 2: `InquiryForm.astro`** — `<form method="POST" action={FORM_ENDPOINT}>` with: name, company, email (required, type=email), phone (optional, dir="ltr" always), product interest `<select>` (three divisions + "Multiple / other"), approximate quantity, destination port/country, message `<textarea>`. Labels above inputs, 1px-line inputs on paper-raised, teal focus ring, submit = magnetic button. Beside form: direct-contact block with `mailto:` link (the no-backend fallback) and note. Two-column desktop (form 2/3, contact block 1/3), stacked mobile, RTL-safe via logical properties.

- [ ] **Step 3:** Contact page assembly: title (`data-split`), intro, form. Verify: HTML validation of form attrs, keyboard-only completion, RTL layout, build clean. Commit — `git commit -m "feat: contact page with static inquiry form and mailto fallback"`

---

### Task 13: Micro-interactions — custom cursor + magnetic buttons

**Files:**
- Create: `src/scripts/cursor.ts`
- Modify: `src/scripts/app.ts`

- [ ] **Step 1: `src/scripts/cursor.ts`:**
- Custom cursor: 8px teal dot + 28px trailing ring (lerp follow via `gsap.quickTo`), `mix-blend-mode: multiply`, hidden entirely on `(pointer: coarse)` or reduced-motion (native cursor untouched — the custom one augments, `cursor: none` is NOT set globally, only on `[data-cursor]` hosts). Over `[data-cursor="expand"]` (diagram nodes) the ring scales 1.8× and shows a "+"; over links/buttons it scales 1.4×.
- Magnetic buttons: `[data-magnetic]` elements translate toward pointer within 0.35× strength radius, spring back on leave (`gsap.to` elastic.out).
- Export `initCursor()/destroyCursor()`; wire into `app.ts`.

- [ ] **Step 2:** Verify on dev server: cursor behavior on desktop, absent on touch emulation + reduced motion; magnetic CTAs feel subtle not gimmicky (strength ≤ 8px travel). Commit — `git commit -m "feat: custom cursor and magnetic CTA micro-interactions"`

---

### Task 14: SEO/meta polish + OG images

**Files:**
- Modify: `src/layouts/Base.astro`
- Create: `public/og.png` (1200×630 — render the hero lockup: mark + wordmark + tagline on paper, export via a one-off script or screenshot)

- [ ] **Step 1:** Add to Base head: `og:title`, `og:description`, `og:image`, `og:locale` (`en_US`/`ar_EG`/`zh_CN`), `og:locale:alternate`, `twitter:card=summary_large_image`, canonical URL. Verify tags present in built HTML for one page per language (`grep 'og:locale' dist/ar/index.html`).

- [ ] **Step 2: Commit** — `git commit -m "feat: per-language OG/meta tags and social image"`

---

### Task 15: Full QA pass against spec verification criteria

**Files:** fixes as discovered.

- [ ] **Step 1:** `npm run build` → clean; `find dist -name index.html | wc -l` → 19.
- [ ] **Step 2:** `npm test` → i18n parity passes.
- [ ] **Step 3:** Preview server visual pass: all six EN pages at 1280w and 375w (use preview screenshot + inspect tools). Check type scale, spacing rhythm, grid alignment.
- [ ] **Step 4:** RTL pass: `/ar/` home + `/ar/oilfield` — layout mirrored, diagram mirrored, Arabic renders in Plex Sans Arabic (inspect `font-family` computed), numerals/phone LTR where needed.
- [ ] **Step 5:** ZH pass: `/zh/` home — Noto Sans SC applied, no tofu (visual screenshot check of headings).
- [ ] **Step 6:** No-JS: `curl -s localhost:4321/en/ | grep -c 'vc-node'` → all 10 nodes present in static HTML; visually confirm with JS disabled that diagram + nav + form are usable.
- [ ] **Step 7:** Reduced-motion emulation: no Lenis, no shader canvas, no draw animations; content all visible.
- [ ] **Step 8:** View transitions: navigate home → division → about → home; confirm animations re-fire correctly, no console errors.
- [ ] **Step 9:** Lighthouse (mobile) on `/en/`: `npx lighthouse http://localhost:4321/en/ --preset=perf --form-factor=mobile --screenEmulation.mobile --quiet --chrome-flags='--headless'` → performance ≥ 90. If Chrome unavailable, fall back to: total JS transfer < 90KB gzip (`ls -l dist/_astro/*.js`), images lazy, fonts swap.
- [ ] **Step 10:** Fix anything found; final commit — `git commit -m "chore: QA pass — spec verification criteria met"`.

---

## Self-review notes

- **Spec coverage:** brand/name (T3 logo, T11 story), visual system (T1 tokens, fonts T3), stack incl. Lenis/SplitText/VT/OGL/micro-interactions (T5/T6/T13), 18 routes (T4), homepage order (T6–T9), diagram behavior incl. RTL/mobile/no-JS/keyboard (T7–T8), division content + exclusions (T2/T10), about (T11), contact/form/mailto (T12), a11y+perf+degradation (throughout, verified T15), OG/meta (T14). All eight verification criteria map to T15 steps.
- **Known deliberate deviations from full-code plans:** final long-form copy (EN master inline-structured; AR/ZH translated at execution, enforced by parity script) and presentational component CSS are specified by exact structure/behavior rather than full inline code — the executor writes them against the token system.
- **Type consistency:** `Lang`/`Dict`/`t`/`pathFor`/`dirFor` defined once (T2) and used consistently; `initX/destroyX` pattern uniform across motion/diagram/cursor/shader modules; node/edge shapes defined in T7 and consumed in T8.
