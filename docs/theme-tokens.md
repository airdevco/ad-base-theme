# ad-base theme token contract

Single source of truth for theming ad-base. Components use **semantic Tailwind classes**; values live in `src/app/globals.css`.

## How to apply a theme

1. Replace **Layer A** (`:root` + `.dark`) with TweakCN export for the chosen preset.
2. Replace **Layer B** (extension block below) — TweakCN does not generate these; set per preset or derive from `--primary`.
3. Keep **Layer C** (`@theme` mappings) stable unless adding new tokens.

Savepoint before migration: git tag `savepoint/pre-theme-token-migration`.

---

## Workflow

After any token or component color change:

1. Run `npm run verify:theme` — must exit 0 before merging.
2. Spot-check light + dark on `/`, `/login`, `/admin/users` if user-facing colors changed.
3. For Layer A paste experiments, follow [Smoke test](#smoke-test-layer-a-paste) and revert before commit.

---

## Verification (`npm run verify:theme`)

Script: [`scripts/verify-theme-tokens.sh`](../scripts/verify-theme-tokens.sh)

| Check | What it validates |
|-------|-------------------|
| **Hex grep** | No `#RRGGBB` or `bg-[#…]` in `src/**/*.{ts,tsx}` outside the allowlist below |
| **Token completeness** | Every `@theme` `--color-*` mapping has a matching `--*` var in both `:root` and `.dark` |

### Hex grep allowlist

These paths may contain hardcoded hex (fixed brand colors, chart data, theme tooling):

| Path | Reason |
|------|--------|
| `src/app/theme/**` | Theme generator UI (moves to ad-base-theme) |
| `src/app/(auth)/_components/auth-flow.tsx` | Google OAuth `#1a73e8` + SVG brand fills |
| `src/app/(auth)/_components/auth-flow-sdc-shared.tsx` | OAuth / Microsoft SVG fills |
| `src/app/(settings)/account/_components/appearance-section.tsx` | Theme-picker illustration tiles |
| `src/app/(admin)/admin/dashboard/_components/*-chart.tsx` | Recharts stroke/fill props (defer chart-token migration) |
| `src/lib/themes.ts` | Theme catalog swatch data |
| `src/mock/dashboard.ts` | Chart series mock colors |

All other TS/TSX files must use semantic Tailwind classes (`bg-primary`, `bg-brand`, `text-muted-foreground`, etc.) — not raw hex.

---

## Layer A — TweakCN / shadcn core

Required in every preset (`:root` and `.dark`):

| Token | Tailwind | Role |
|-------|----------|------|
| `--background` | `bg-background` | Page background |
| `--foreground` | `text-foreground` | Body text |
| `--card`, `--card-foreground` | `bg-card`, `text-card-foreground` | Cards, panels |
| `--popover`, `--popover-foreground` | `bg-popover` | Popovers, tooltips |
| `--primary`, `--primary-foreground` | `bg-primary`, `text-primary-foreground` | Primary actions, links |
| `--secondary`, `--secondary-foreground` | `bg-secondary` | Secondary surfaces |
| `--muted`, `--muted-foreground` | `bg-muted`, `text-muted-foreground` | Muted fills, helper text |
| `--accent`, `--accent-foreground` | `bg-accent` | Hover states |
| `--destructive`, `--destructive-foreground` | `bg-destructive` | Errors, destructive actions |
| `--border`, `--input`, `--ring` | `border-border`, `ring-ring` | Borders, focus rings |
| `--chart-1` … `--chart-5` | `text-chart-1`, etc. | Charts |
| `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring` | `bg-sidebar`, etc. | App sidebar chrome |
| `--font-sans`, `--font-serif`, `--font-mono` | `font-sans`, etc. | Typography stacks |
| `--radius` | `rounded-lg`, etc. | Border radius base |
| `--shadow-*` | `shadow-sm`, etc. | Elevation (add when adopting full TweakCN export) |

---

## Layer B — ad-base extensions

Append to each preset. Set explicitly or derive from `--primary` in ad-base-theme.

| Token | Tailwind | Role | Current default |
|-------|----------|------|-----------------|
| `--surface` | `bg-surface` | Marketing footer, subtle page sections | `#fafafa` |
| `--primary-hover`, `--primary-active` | `bg-primary-hover`, `bg-primary-active` | Primary button hover/active | HSL steps from primary |
| `--brand` | `bg-brand`, `text-brand` | Marketing navy, auth panels, sidebar headers | `#0F1E4B` |
| `--brand-foreground` | `text-brand-foreground` | Text on brand surfaces | `#ffffff` |
| `--brand-hover`, `--brand-active` | `hover:bg-brand-hover`, `active:bg-brand-active` | Brand CTA states | `#1a3278`, `#0a1638` |
| `--gradient-brand-from` | `from-gradient-brand-from` | Hero/auth gradient start | `#0F1E4B` |
| `--gradient-brand-via` | `via-gradient-brand-via` | Hero/auth gradient mid | `#142858` |
| `--gradient-brand-to` | `to-gradient-brand-to` | Hero/auth gradient end | `#0B1735` |
| `--status-*-bg/text` | `bg-status-warning-bg`, `bg-status-success-text`, etc. | Status dots (`bg-status-*-text`), badges, billing banners | success `#00BD7D`, warning `#f97316` / `#fb923c` dark |
| `--input-shadow`, `--input-shadow-focus` | (CSS only) | Input inset shadow | border / ring colors |

Utility: `.bg-brand-gradient` — `linear-gradient(to bottom right, from, via, to)`.

### Deprecated aliases (do not use in new code)

| Old | Use instead |
|-----|-------------|
| `--sidebar-background` | `--sidebar` |

---

## Layer C — `@theme` mappings

Defined once in `globals.css`. Maps `--*` variables to Tailwind `--color-*` tokens. Rarely changes.

---

## Primary auto-derive rules (ad-base-theme)

When user picks one primary color:

- `--ring`, `--chart-1`, `--sidebar-primary` ← primary
- `--brand` ← darkened primary (same hue, low lightness)
- `--gradient-brand-*` ← brand + proportional lightness steps
- `--primary-hover` / `--primary-active` ← lightness steps from primary
- Dark mode: lighter primary variant for contrast on dark backgrounds

---

## Fixed colors (not in hex grep, documented separately)

These are intentional non-token colors outside the grep allowlist scope or handled elsewhere:

- Google OAuth button (`#1a73e8`) — in allowlisted `auth-flow.tsx`
- Password-strength decorative accents in auth/security — Tailwind palette classes, not hex literals

Prefer `--chart-1` … `--chart-5` when migrating dashboard charts (currently allowlisted).

---

## Smoke test (Layer A paste)

Procedure to validate paste-to-apply without breaking Layer B extensions:

1. Export a TweakCN preset (or hand-edit Layer A only).
2. In [`src/app/globals.css`](src/app/globals.css), replace **only** TweakCN core vars in `:root` and `.dark` (`--primary`, `--ring`, `--chart-1`, `--sidebar-primary`, etc.).
3. **Do not change** Layer B extension vars (`--brand`, `--gradient-brand-*`, `--status-*`, `--primary-hover/active`, `--surface`, `--input-shadow*`).
4. Run `npm run verify:theme`.
5. Spot-check in light + dark:

| URL | Expect |
|-----|--------|
| `/` | Hero/CTAs stay navy (`--brand`); primary buttons/links use new `--primary` |
| `/login` | Auth panel still brand gradient |
| `/search` | Hero banner + online dot `#00BD7D` |
| `/admin/users` | Status dots green/orange; primary actions use new primary |
| `/account` | Billing warning banner orange tint |

6. Revert Layer A to production values before committing.

**Last run (2026-06-02):** Swapped `--primary` to `#E5583E` in Layer A only. Verified primary buttons orange, brand hero navy, status dots unchanged. Reverted before commit.


---

## Preset bundle (ThemePresetBundle v1)

Machine-readable preset format for round-trip in **ad-base-theme** (prototype on `/theme` until fork).

- **Six curated presets** live only in `ad-base-theme/presets/` — not shipped in client ad-base.
- ad-base applies **one** theme via `globals.css`.

### Shape

| Field | Role |
|-------|------|
| `version` | `1` |
| `panel.light` / `panel.dark?` | Full theme panel state (source of truth for import) |
| `layerA` | TweakCN / shadcn create vars (`--primary`, `--background`, …) — full set after theme CSS paste (4b) |
| `layerB` | ad-base extensions (`--brand`, `--gradient-brand-*`, …); status colors excluded |
| `meta` | `brandOverridden`, `defaultDarkMode`, `editor` (`tweakcn` \| `shadcn-create` \| `manual`) |

Module: [`src/app/theme/_components/theme-preset-bundle.ts`](../src/app/theme/_components/theme-preset-bundle.ts)

### Workflow

1. Tune theme on `/theme` → **Copy Preset JSON**.
2. Save JSON externally (or commit in ad-base-theme later).
3. **Import Preset JSON** to restore panel + preview.
4. **Copy Prompt** / **Apply CSS** (4c) for pasting into ad-base `globals.css`.

### Paste theme CSS (4b)

1. Design in [TweakCN](https://tweakcn.com) or [shadcn create](https://ui.shadcn.com/create).
2. Copy the exported `:root` + `.dark` CSS block.
3. On `/theme` → **Paste theme CSS** → **Apply Layer A CSS**.
4. Preview updates with full Layer A; brand/gradients still derive from primary (Layer B).
5. **Copy Preset JSON** saves `layerA` + panel state for round-trip.

Parser: [`parse-theme-css.ts`](../src/app/theme/_components/parse-theme-css.ts) — filters to Layer A allowlist; ignores `--brand`, `--status-*`, etc.

---

## Migration status

| Slice | Scope | Status |
|-------|--------|--------|
| 0a | Token manifest + brand vars in globals.css | Done |
| 0b | `home/shared.tsx` CTAs | Done |
| 0c | `home/footer.tsx` | Done |
| 0d | `home/hero.tsx`, `impact.tsx`, `testimonial.tsx` brand gradients | Done |
| 0e | Remaining surfaces (services, how-it-works, contact, team) | Done |
| 0f | On-brand gradient text (`text-brand-foreground` on hero/impact/testimonial/shared) | Done |
| 1a | Auth layouts, onboarding progress, search hero banner; **extension:** `auth-flow.tsx`, `reset-password-client.tsx`, `not-found.tsx`, `terms/page.tsx`, `privacy/page.tsx` | Done |
| 1b | Admin sidebars: `admin-sdc-sidebar.tsx`, `admin-sidebar.tsx`, `account-sdc-settings-sidebar.tsx`, `admin-sdc-email-templates-header-search.tsx` | Done |
| 1c | Admin dialog footer, tooltips, billing warnings, admin status dots, filter pills, edit-columns, users header search | Done |
| 2a | Straggler fixes: search dot, email draft dot, input-shadow-focus | Done |
| 2b | `npm run verify:theme` grep + token completeness gate | Done |
| 2c | Smoke Layer A preset paste (primary `#E5583E` test, reverted) | Done |
| 2d | Docs finalize: verification, workflow, allowlist table | Done |
| 2.5a | Remove `--attio-*` vars and `.transition-attio` from globals.css | Done |
| 2.5b | Stop emitting attio vars in `generate-prompt.ts` | Done |
| 3a | Rename `navyColor` → `brandColor` in theme UI | Done |
| 3b | `deriveExtensionTokens` + primary→brand auto-derive + preview `--color-brand*` | Done |
| 3c | Brand override lock UI + Reset to derived | Done |
| 3d | Retire `NAVY_FILES` / `buildNavyOverrides`; copy-prompt emits Layer B CSS | Done |
| 4a | `ThemePresetBundle` v1 + Copy/Import Preset JSON on `/theme` (no preset catalog in ad-base) | Done |
| 4b | Paste theme CSS (TweakCN or shadcn create) → full Layer A in preview + bundle | Done |
| 4b.1 | Neutral panel labels + `meta.editor` includes `tweakcn` | Done |
