# TemplateWebAstro

A production-ready Astro **website template with a finished design** — an
elegant one-page site (white gallery look, gold hairlines, Noto Serif JP +
Cormorant Garamond) with GSAP loading, scroll-reveal and menu animations, wired
for marketing/SEO out of the box. Static only: there is no blog.

## Make a site from this template (日本語)

1. GitHub で **Use this template** → 新しいリポジトリを作る
2. そのリポジトリを Claude Code で開き、「セットアップして」と送る
   （または `/setup`）
3. Claude の質問（サイト名・事業内容・載せる節・配色など14問）に答える

デザイン（配色・書体・アニメーション）は最初から入っています。トップ1ページに
ヒーロー / コンセプト / メニュー / ギャラリー / スタッフ / よくある質問 /
アクセス / お問い合わせ / サイトポリシー の節が並び、質問への答えで中身を
埋めていきます。写真は見本（ネイルサロン）なので差し替えてください。

質問の一覧と、各回答がどのファイルに入るかは [`CLAUDE.md`](CLAUDE.md) の
「第1部 初期セットアップ」にあります。`pnpm check:setup` で未設定の項目を
いつでも確認できます。

Built on **Astro 7** + **Tailwind 4**. Everything is data-driven from a single
config file, so you change one place and metadata, structured data, the sitemap
and the web manifest all follow.

This starter is meant to disappear once you start building.

## Requirements

- **Node.js `>=22.12.0`** (Astro 7 requirement; odd-numbered releases like v23
  are not supported) — enforced via `engines` in `package.json`
- **pnpm** (the repo ships a `pnpm-lock.yaml` and `pnpm-workspace.yaml`)

## Quick start

```bash
pnpm install
pnpm dev
```

| Script              | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `pnpm dev`          | Start the dev server                                   |
| `pnpm build`        | Production build to `dist/`                            |
| `pnpm preview`      | Preview the production build                           |
| `pnpm check`        | `astro check` (type + diagnostics)                     |
| `pnpm test`         | Vitest unit tests (`src/**/*.test.ts`)                 |
| `pnpm check:links`  | Internal link check over `dist/` (run after build)     |
| `pnpm check:jsonld` | JSON-LD check + summary over `dist/` (run after build) |
| `pnpm format`       | Prettier (`prettier-plugin-astro`) over the repo       |
| `pnpm format:check` | Formatting check (same as CI)                          |
| `pnpm check:setup`  | List template placeholders not yet filled in           |
| `pnpm images`       | Regenerate icons / OG image (`icons`, `og`, …)         |

> Set `url` in `src/content/site.ts` to your domain for correct canonical
> URLs, sitemap and JSON-LD. There is no `.env` and no build variable.

## Configuration as data

All site metadata lives in **`src/content/site.ts`** and flows into the Header,
Footer, SEO `<head>`, the JSON-LD graph, the sitemap filter and the web
manifest. There is no duplication — edit it once.

```ts
export const site = {
  name,
  tagline,
  description,
  locale,
  sameAs, // brand social profiles -> Organization.sameAs
  author, // -> Person (sameAs from author.socials)
  business, // optional: enables LocalBusiness + visible NAP (§4 MEO)
  brand, // wordmark + diamond-mark initial (hero, loader, header, footer)
  contactFormUrl, // optional external form linked from the contact section
  nav, // fullscreen menu: "/#section" links, `en` caption, `children`
  footerNav, // secondary links (the policy section)
  seo: {
    ogImage,
    ogImageWidth,
    ogImageHeight,
    twitterSite,
    logo,
    robots,
    themeColor,
    noindexPaths,
  },
};
```

The site **origin** (`url`), the Cloudflare Web Analytics token
(`cloudflareBeaconToken`) and the Search Console code
(`seo.googleSiteVerification`) live here too — all three are public values, so
they are committed rather than kept in `.env`. Everything is configured by
editing files, which works from a phone. Read the origin via `Astro.site`.
Never put a real secret in this file.

## What's included

> Removing something? [`FEATURES.md`](FEATURES.md) is the inventory: every
> feature, the files it actually lives in, a step-by-step removal recipe, and a
> report on the few couplings that make a clean removal harder than it looks.

**SEO & structured data**

- Per-page `<title>` (`Page | Site`), meta description, absolute canonical
- Open Graph + Twitter cards with an **absolute** image URL
- Connected JSON-LD `@graph` (`src/lib/seo/jsonld.ts`): Organization (or a
  Person publisher via `site.publisher`), WebSite, Person, WebPage + optional
  BreadcrumbList, all linked by `@id`; `pnpm check:jsonld` validates the built
  output and prints what it tells search engines
- Optional `LocalBusiness` node + visible NAP when `site.business` is set
- Rich `robots` defaults (`max-image-preview:large`, …); optional GSC meta

**Crawling**

- XML sitemap with a `noindex` filter synced to `site.seo.noindexPaths`
- `robots.txt` that allows crawling and points to the sitemap
- One URL shape (`trailingSlash: "never"`) across canonical and sitemap —
  enforced at the edge too (`html_handling: "drop-trailing-slash"` in
  `wrangler.jsonc` redirects `/about/` → `/about`)

**Content**

- One page (`src/pages/index.astro`) of section components in
  `src/components/sections/`, with placeholder copy and sample photos filled
  in by the setup interview; FAQ via native `<details>`; the access section's
  address/phone/hours come from `site.business`, the same data as the
  LocalBusiness JSON-LD; a designed 404

**Performance & a11y**

- Motion is progressive enhancement: everything starts visible unless JS runs
  **and** the visitor allows motion (`.has-motion`) — see
  [Runtime JavaScript](#runtime-javascript)
- Long-term immutable caching for hashed assets (`public/_headers` →
  `/_astro/*`)
- Light-only palette by design (`color-scheme: light`)
- Semantic HTML; skip link; fullscreen menu with focus trap, Escape and
  `inert` background; `prefers-reduced-motion` turns all GSAP motion off
- Mobile-hardened: no horizontal page scroll at 320px, 44px touch targets on
  touch devices, `dvh` viewport units — see [Mobile](#mobile)

**Security headers**

- `public/_headers` ships `nosniff`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy` and HSTS on `/*`, plus a ready-to-uncomment CSP that
  matches this starter's default output

**CI & tests**

- `.github/workflows/ci.yml` runs `format:check` + `astro check` + `test` +
  `build` + `check:links` + `check:jsonld` on every push/PR (deploys stay on Cloudflare Workers
  Builds)
- Vitest specs cover the parts that break invisibly: JSON-LD `@id` wiring and
  `noindex` path matching
- `scripts/check-links.mjs` walks the built HTML and fails on dead internal
  links (no network, so it never goes flaky). It also verifies the `Sitemap:`
  URL in `robots.txt` — the one internal reference nothing else points at, so
  removing the sitemap integration can't silently leave a 404 behind

**PWA & analytics**

- `favicon.svg`/`.ico`, `apple-touch-icon`, 192/512 icons, dynamic
  `/site.webmanifest`
- Cookieless Cloudflare Web Analytics, injected only when a token is configured

## Mobile

Designed for 320px up, and checked by hand at 320px and 390px on the routes
this starter ships. Treat that as a starting point, not a guarantee: nothing in
CI measures viewport width, so new content can regress it. The rules below are
the mechanisms that make the property hold — they are what to check against.

Four rules keep it that way — break one and the phone layout goes with it:

1. **Nothing may widen the page.** Two layers: `overflow-wrap: anywhere` on
   the body for long URLs and identifiers (`anywhere`, not `break-word` — only
   `anywhere` shrinks min-content width, which is what a flex item is sized
   to); and `max-width: 100%` on embedded and replaced content, so an
   `<iframe>` (a map embed) or a wide inline `<svg>` cannot push the page out
   either. A wide table goes in its own `overflow-x: auto` box.

2. **Touch targets use the `tap-target` utility**, not ad-hoc padding. It sets
   24×24px everywhere (WCAG 2.2 AA, SC 2.5.8) and 44px under
   `@media (any-pointer: coarse)` — `any-pointer`, so an iPad with a keyboard
   or a touch laptop is treated as touch rather than as a mouse. It is for
   elements that could otherwise fall under the minimum; see CLAUDE.md rule 10
   for the three cases where it should _not_ be applied.

3. **Viewport height is `dvh`, never `vh`.** `100vh` on mobile browsers measures
   the viewport as if the URL bar were hidden, which leaves the footer below the
   fold on short pages.

4. **The fullscreen menu scrolls inside itself** (`overflow-y: auto`), so a
   long nav stays usable on a short or landscape screen.

## Runtime JavaScript

Two bundles: Astro's link prefetcher (~2.3 kB) and the design's motion in
`src/scripts/` (GSAP + ScrollTrigger, ScrollToPlugin, SplitText):

| File         | What it does                                                   |
| ------------ | -------------------------------------------------------------- |
| `loader.ts`  | First-visit loading screen (once per session)                  |
| `hero.ts`    | Wordmark letters rise, subtitle tracking opens, photo wipes in |
| `reveals.ts` | Scroll reveals driven by `data-reveal*` attributes; parallax   |
| `header.ts`  | Frosted header + progress line; smooth in-page anchor scroll   |
| `menu.ts`    | Fullscreen menu open/close, focus trap, Escape                 |
| `motion.ts`  | Shared easing/durations (mirrors `--ease-*` in `global.css`)   |

Every hidden-before-reveal state is scoped to `html.has-motion`, which the
inline script in `Base.astro` adds only when JS runs and
`prefers-reduced-motion` is off — so with JS disabled or motion reduced, every
section is visible immediately and the loader never appears. The reveal
vocabulary (`data-reveal`, `data-reveal-mask`, `data-reveal-group` /
`data-reveal-item`, `data-reveal-line`, `data-reveal-lines`, `data-parallax`)
is documented at the top of `src/scripts/reveals.ts`; use it on new sections
instead of writing new animation code.

## Styling (Tailwind 4)

There is no `tailwind.config.js`. Design tokens live in `src/styles/global.css`
inside an `@theme` block and become **both** CSS variables and utilities:

```css
@theme {
  --color-bg: #ffffff; /* -> bg-bg / text-bg ... and var(--color-bg) */
  --color-fg: #333333; /* headings */
  --color-body: #555555; /* body copy */
  --color-muted: #888888; /* labels */
  --color-accent: #c9a87c; /* gold */
}
```

Components style themselves in scoped `<style>` blocks that read these
variables (`var(--color-fg)`); utilities (`text-fg`, `bg-surface`, …) work
too. **Use only the tokens** — a raw hex or a stock Tailwind color like
`text-gray-700` bypasses the palette. The full list (bg, fg, body, muted, link,
border, surface, accent, accent-light, ink, on-ink, overlay) is commented in
`global.css`. Shared pieces — `.section`, `.section-label`, `.divider`, `.btn`,
`.btn-light`, `.font-en`, `.img-hover-zoom` — live in its `@layer components`.

The palette is light only. `<meta name="theme-color">` comes from
`site.seo.themeColor` — keep it in sync with `--color-bg`.

### Page copy

`@tailwindcss/typography` styles page copy via `<article class="prose">`, and its
`--tw-prose-*` variables are bound to the design tokens in `global.css` — so
long-form copy is exactly the same color as the rest of the site in the
places it is used (policy section, 404). Preflight replaces a hand-written reset.

## フォント

Noto Serif JP (body) and Cormorant Garamond (wordmark, labels) are loaded from
Google Fonts in `Base.astro` with `display=swap`; `--font-serif` /
`--font-display` in `global.css` fall back to Mincho system faces. Both fonts
are SIL OFL and served by Google, so there is no license file to ship. If you
enable the CSP in `public/_headers`, it already allows `fonts.googleapis.com`
and `fonts.gstatic.com`.

## Project structure

```
src/
├─ components/   Header, FullscreenMenu, Loader, BrandMark, Footer,
│                SectionTitle, FAQ, SEO, SkipLink, Cloudflare, Breadcrumbs
│  └─ sections/  Hero, Concept, MenuSection, Gallery, Staff, Access,
│                Contact, Policy
├─ content/      site.ts (config)
├─ layouts/      Base.astro (head + fonts + JSON-LD graph + shell)
├─ lib/          seo/jsonld.ts (graph builders), noindex.ts (path match
│                shared by meta robots + sitemap), hours.ts (opening hours
│                → 日本語) — each with a *.test.ts
├─ pages/        index (the whole site), 404, robots.txt, site.webmanifest
├─ scripts/      GSAP motion (see Runtime JavaScript)
├─ assets/       images/ (sample photos — optimized at build)
└─ styles/       global.css (@theme tokens, shared components, motion states)

scripts/         check-links.mjs (internal link check over dist/),
                 check-setup.mjs (template placeholders left),
                 generate-images.mjs (icons / OG image)
CLAUDE.md        setup interview + design constraints for AI agents
.claude/         /setup slash command
```

## Deploy (Cloudflare Workers Builds)

This starter deploys to **Cloudflare Workers static assets** through Git
integration — you push, and Cloudflare builds and deploys for you. No local
deploy step.

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Connect to Git** → pick
   the repo (this folder is its own repo, so the build root is the repo root).
3. Build settings (defaults are fine):
   - **Build command:** `pnpm build`
   - **Deploy command:** `npx wrangler deploy` (production) /
     `npx wrangler versions upload` (other branches → preview URL on the PR)
4. No build variables are needed — everything comes from `site.ts`. Set
   `NODE_VERSION=22.17.1` only if the build picks the wrong Node.

`wrangler.jsonc` is the source of truth for the deploy: an **assets-only** Worker
(`assets.directory: ./dist`, `not_found_handling: "404-page"`, no `main`).
Everything else in it is commented with notes — uncomment as you add bindings,
cron, or SSR. Custom headers/redirects go in `public/_headers` /
`public/_redirects`. CI auth is automatic (no API token needed).

> `dist/` and `node_modules/` are gitignored — CI rebuilds them on every push.

## Notes

- **Icons** are generated from `public/favicon.svg`. Replace that mark and run
  `pnpm images icons` to regenerate the PNG/ICO set.
- **Security headers** live in `public/_headers` (that file _is_ the host-level
  config for Cloudflare static assets). Read the HSTS note before pointing a
  real domain at it, and uncomment the CSP once you know which third parties
  the site actually loads.
- **Analytics** is Cloudflare (cookieless) by default; swap
  `src/components/Cloudflare.astro` for GA4 if you prefer. Adding any third
  party means widening the CSP in `public/_headers`.
- **OG image** is one shared default. `pnpm images og <photo>` crops a photo to
  1200×630; `pnpm images og-text` draws the site name and tagline. Generating a
  per-page OG image at build time is deliberately _not_ included: doing it for
  Japanese titles needs a bundled CJK font (several MB in the repo), which
  costs more than it returns for most sites.
- **The sitemap lists the home page as `https://site`, not `https://site/`.**
  That is `@astrojs/sitemap` honouring `trailingSlash: "never"`, and the two
  are the same URL (RFC 3986 §6.2.3 — an empty path is equivalent to `/` for
  http/https). No action needed.
