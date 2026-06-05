import type { ThemeState } from "./theme-state";
import {
  DEFAULTS,
  CURATED_FONTS,
  deriveExtensionTokens,
  computeDarkVariant,
  computeDarkNavy,
  computeDarkBackground,
  hexToHsl,
  hasChanges,
} from "./theme-state";


function getFontConfig(fontName: string) {
  return CURATED_FONTS.find((f) => f.name === fontName);
}

export function generatePrompt(state: ThemeState): string {
  if (!hasChanges(state)) return "";

  const lines: string[] = [];

  // ── Before/After Summary ──
  const changes: string[] = [];
  if (state.primaryColor !== DEFAULTS.primaryColor) {
    changes.push(
      `primary from ${DEFAULTS.primaryColor} → ${state.primaryColor}`
    );
  }
  if (state.brandColor !== DEFAULTS.brandColor) {
    changes.push(`brand from ${DEFAULTS.brandColor} → ${state.brandColor}`);
  }
  if (state.backgroundColor !== DEFAULTS.backgroundColor) {
    changes.push(
      `background from ${DEFAULTS.backgroundColor} → ${state.backgroundColor}`
    );
  }
  if (state.headingFont !== DEFAULTS.headingFont) {
    changes.push(
      `heading font from ${DEFAULTS.headingFont} → ${state.headingFont}`
    );
  }
  if (state.bodyFont !== DEFAULTS.bodyFont) {
    changes.push(
      `body font from ${DEFAULTS.bodyFont} → ${state.bodyFont}`
    );
  }
  if (state.radius !== DEFAULTS.radius) {
    changes.push(
      `radius from ${DEFAULTS.radius}rem → ${state.radius}rem`
    );
  }

  lines.push("# Theme Update Instructions");
  lines.push("");
  lines.push(`**Summary:** Changing ${changes.join(", ")}.`);
  lines.push("");

  // ── Primary Color ──
  if (state.primaryColor !== DEFAULTS.primaryColor) {
    const darkVariant = computeDarkVariant(state.primaryColor);
    lines.push("## Primary Color");
    lines.push("");
    lines.push(
      `In \`src/app/globals.css\`, update the following CSS variables in the \`:root\` block:`
    );
    lines.push("```css");
    lines.push(`--primary: ${state.primaryColor};`);
    lines.push(`--ring: ${state.primaryColor};`);
    lines.push(`--sidebar-primary: ${state.primaryColor};`);
    lines.push(`--sidebar-ring: ${state.primaryColor};`);
    lines.push(`--chart-1: ${state.primaryColor};`);
    lines.push("```");
    lines.push("");
    lines.push(
      `**Dark mode primary:** In the \`.dark\` block of \`globals.css\`, update these variables to \`${darkVariant}\` (or adjust for contrast):`
    );
    lines.push("```css");
    lines.push(`--primary: ${darkVariant};`);
    lines.push(`--ring: ${darkVariant};`);
    lines.push(`--sidebar-primary: ${darkVariant};`);
    lines.push(`--sidebar-ring: ${darkVariant};`);
    lines.push(`--chart-1: ${darkVariant};`);
    lines.push("```");
    lines.push("");
  }

  // ── Layer B — Extension tokens ──
  const layerBChanged =
    state.primaryColor !== DEFAULTS.primaryColor ||
    state.brandColor !== DEFAULTS.brandColor;

  if (layerBChanged) {
    const ext = deriveExtensionTokens(state.primaryColor, state.brandColor);
    lines.push("## Layer B — Extension tokens");
    lines.push("");
    lines.push(
      "In `src/app/globals.css`, update these **Layer B** variables in the `:root` block (ad-base extensions — do not edit component files):"
    );
    lines.push("");
    lines.push("```css");
    lines.push(`--primary-hover: ${ext.primaryHover};`);
    lines.push(`--primary-active: ${ext.primaryActive};`);
    lines.push(`--brand: ${ext.brand};`);
    lines.push(`--brand-foreground: ${ext.brandForeground};`);
    lines.push(`--brand-hover: ${ext.brandHover};`);
    lines.push(`--brand-active: ${ext.brandActive};`);
    lines.push(`--gradient-brand-from: ${ext.gradientBrandFrom};`);
    lines.push(`--gradient-brand-via: ${ext.gradientBrandVia};`);
    lines.push(`--gradient-brand-to: ${ext.gradientBrandTo};`);
    lines.push(`--input-shadow-focus: 0px 0px 0px 1px var(--brand) inset;`);
    lines.push("```");
    lines.push("");
    if (state.brandOverridden) {
      lines.push(
        "_Note: Brand was manually overridden in the theme previewer (not auto-derived from primary)._"
      );
      lines.push("");
    }
  }

  // ── Page Background ──
  if (state.backgroundColor !== DEFAULTS.backgroundColor) {
    lines.push("## Page Background");
    lines.push("");
    lines.push(
      `In \`src/app/globals.css\`, update \`--background\` in the \`:root\` block to \`${state.backgroundColor}\`.`
    );
    lines.push(
      "Also update `--surface` and `--sidebar-background` to match or use a slightly adjusted shade."
    );
    lines.push("");
  }

  // ── Dark Mode Tokens (comprehensive) ──
  // Generate full dark mode CSS block if any color changed
  const anyColorChanged =
    state.primaryColor !== DEFAULTS.primaryColor ||
    state.brandColor !== DEFAULTS.brandColor ||
    state.backgroundColor !== DEFAULTS.backgroundColor;

  if (anyColorChanged) {
    // Derive the dark brand from the chosen primary (same logic as the theme previewer)
    const darkNavy = state.brandColor !== DEFAULTS.brandColor
      ? state.brandColor
      : computeDarkNavy(state.primaryColor);
    const { h, s } = hexToHsl(darkNavy);
    const sat = Math.round(Math.min(s * 100, 40));
    const hue = Math.round(h);
    const hsl = (l: number) => `hsl(${hue} ${sat}% ${l}%)`;
    const darkPrimary = computeDarkVariant(state.primaryColor);
    const darkBg = state.backgroundColor !== DEFAULTS.backgroundColor
      ? state.backgroundColor
      : hsl(4);

    lines.push("## Dark Mode Tokens");
    lines.push("");
    lines.push(
      "In `src/app/globals.css`, update the **entire `.dark` block** with these hue-tinted values. The hue and saturation are derived from the filled card background color to create a rich branded dark mode rather than neutral gray."
    );
    lines.push("");
    lines.push("```css");
    lines.push(".dark {");
    lines.push(`  --background: ${darkBg};`);
    lines.push(`  --foreground: hsl(0 0% 98%);`);
    lines.push(`  --card: ${hsl(7)};`);
    lines.push(`  --card-foreground: hsl(0 0% 98%);`);
    lines.push(`  --popover: ${hsl(7)};`);
    lines.push(`  --popover-foreground: hsl(0 0% 98%);`);
    lines.push(`  --primary: ${darkPrimary};`);
    lines.push(`  --primary-foreground: hsl(0 0% 98%);`);
    lines.push(`  --secondary: ${hsl(14)};`);
    lines.push(`  --secondary-foreground: hsl(0 0% 98%);`);
    lines.push(`  --muted: ${hsl(14)};`);
    lines.push(`  --muted-foreground: hsl(${hue} ${Math.round(sat * 0.4)}% 65%);`);
    lines.push(`  --accent: ${hsl(14)};`);
    lines.push(`  --accent-foreground: hsl(0 0% 98%);`);
    lines.push(`  --destructive: hsl(0 62.8% 30.6%);`);
    lines.push(`  --destructive-foreground: hsl(0 0% 98%);`);
    lines.push(`  --border: ${hsl(18)};`);
    lines.push(`  --input: ${hsl(11)};`);
    lines.push(`  --ring: ${darkPrimary};`);
    lines.push(`  --chart-1: ${darkPrimary};`);
    lines.push(`  --chart-2: hsl(${hue} 70% 67%);`);
    lines.push(`  --chart-3: hsl(${hue} 55% 78%);`);
    lines.push(`  --chart-4: hsl(${hue} 90% 43%);`);
    lines.push(`  --chart-5: hsl(${hue} 45% 88%);`);
    lines.push(`  --sidebar-background: ${hsl(8)};`);
    lines.push(`  --sidebar-foreground: hsl(${hue} 10% 96%);`);
    lines.push(`  --sidebar-primary: ${darkPrimary};`);
    lines.push(`  --sidebar-primary-foreground: hsl(0 0% 100%);`);
    lines.push(`  --sidebar-accent: ${hsl(14)};`);
    lines.push(`  --sidebar-accent-foreground: hsl(${hue} 10% 96%);`);
    lines.push(`  --sidebar-border: ${hsl(18)};`);
    lines.push(`  --sidebar-ring: ${darkPrimary};`);
    lines.push(`  --sidebar: ${hsl(8)};`);
    lines.push(`  --surface: ${hsl(7)};`);
    lines.push(`  --input-shadow: 0px 0px 0px 1px ${hsl(14)} inset;`);
    lines.push(`  --input-shadow-focus: 0px 0px 0px 1px ${darkPrimary} inset;`);
    lines.push(`  --status-success-bg: hsl(160 30% 12%);`);
    lines.push(`  --status-success-text: hsl(160 60% 65%);`);
    lines.push(`  --status-warning-bg: hsl(40 30% 12%);`);
    lines.push(`  --status-warning-text: hsl(40 70% 65%);`);
    lines.push(`  --status-error-bg: hsl(0 30% 12%);`);
    lines.push(`  --status-error-text: hsl(0 60% 65%);`);
    lines.push(`  --status-neutral-bg: hsl(${hue} 15% 15%);`);
    lines.push(`  --status-neutral-text: hsl(${hue} 8% 60%);`);
    const ext = deriveExtensionTokens(state.primaryColor, state.brandColor);
    lines.push(`  --primary-hover: ${computeDarkVariant(state.primaryColor)};`);
    lines.push(`  --primary-active: ${ext.primaryActive};`);
    lines.push(`  --brand: ${ext.brand};`);
    lines.push(`  --brand-foreground: ${ext.brandForeground};`);
    lines.push(`  --brand-hover: ${ext.brandHover};`);
    lines.push(`  --brand-active: ${ext.brandActive};`);
    lines.push(`  --gradient-brand-from: ${ext.gradientBrandFrom};`);
    lines.push(`  --gradient-brand-via: ${ext.gradientBrandVia};`);
    lines.push(`  --gradient-brand-to: ${ext.gradientBrandTo};`);
    lines.push("}");
    lines.push("```");
    lines.push("");
    lines.push(
      "**Dark mode card-holo gradient:** Also update the `.dark .card-holo` rule in `globals.css` to use the new hue:"
    );
    lines.push("```css");
    lines.push(`.dark .card-holo {`);
    lines.push(`  border-color: transparent;`);
    lines.push(`  background: linear-gradient(`);
    lines.push(`    135deg,`);
    lines.push(`    ${hsl(9)} 0%,`);
    lines.push(`    ${hsl(7)} 25%,`);
    lines.push(`    ${hsl(10)} 50%,`);
    lines.push(`    ${hsl(9)} 75%,`);
    lines.push(`    ${hsl(7)} 100%`);
    lines.push(`  );`);
    lines.push(`  box-shadow:`);
    lines.push(`    0 0 0 1px hsla(0 0% 100% / 0.04),`);
    lines.push(`    0 1px 2px rgba(0, 0, 0, 0.4),`);
    lines.push(`    inset 0 1px 0 hsla(0 0% 100% / 0.03);`);
    lines.push(`}`);
    lines.push("```");
    lines.push("");
  }

  // ── Typography ──
  const fontChanged =
    state.headingFont !== DEFAULTS.headingFont ||
    state.bodyFont !== DEFAULTS.bodyFont;
  const sizesChanged = [
    "h1Size",
    "h2Size",
    "h3Size",
    "h4Size",
    "h5Size",
    "h6Size",
    "bodySize",
  ].some(
    (k) =>
      state[k as keyof ThemeState] !== DEFAULTS[k as keyof ThemeState]
  );

  if (fontChanged || sizesChanged) {
    lines.push("## Typography");
    lines.push("");

    if (fontChanged) {
      const headingConfig = getFontConfig(state.headingFont);
      const bodyConfig = getFontConfig(state.bodyFont);

      lines.push("**Font loading:**");
      if (state.headingFont !== DEFAULTS.headingFont && headingConfig) {
        lines.push(
          `- Load **${state.headingFont}** with weights ${headingConfig.weights.join(", ")} for headings`
        );
      }
      if (
        state.bodyFont !== DEFAULTS.bodyFont &&
        bodyConfig &&
        state.bodyFont !== state.headingFont
      ) {
        lines.push(
          `- Load **${state.bodyFont}** with weights ${bodyConfig.weights.join(", ")} for body text`
        );
      }
      lines.push("");

      lines.push(
        `In \`src/app/layout.tsx\`, update the \`next/font/google\` imports:`
      );
      if (state.headingFont !== DEFAULTS.headingFont) {
        lines.push(
          `- Import \`${state.headingFont}\` from \`next/font/google\` with subsets: ["latin"] and weights: [${headingConfig?.weights.map((w) => `"${w}"`).join(", ") ?? '"400", "700"'}]`
        );
      }
      if (
        state.bodyFont !== DEFAULTS.bodyFont &&
        state.bodyFont !== state.headingFont
      ) {
        lines.push(
          `- Import \`${state.bodyFont}\` from \`next/font/google\` with subsets: ["latin"] and weights: [${bodyConfig?.weights.map((w) => `"${w}"`).join(", ") ?? '"400", "700"'}]`
        );
      }
      lines.push("");

      lines.push("In `src/app/globals.css`:");
      if (state.headingFont !== DEFAULTS.headingFont) {
        lines.push(
          `- Update \`--font-heading\` in both \`:root\` and \`.dark\` to: \`'${state.headingFont}', ${headingConfig?.category ?? "sans-serif"}\``
        );
      }
      if (state.bodyFont !== DEFAULTS.bodyFont) {
        lines.push(
          `- Update the \`body\` font-family and \`--font-sans\` in \`@theme\` to: \`'${state.bodyFont}', ${bodyConfig?.category ?? "sans-serif"}\``
        );
      }
      lines.push("");
    }

    if (sizesChanged) {
      lines.push("**Font sizes:**");
      if (state.h1Size !== DEFAULTS.h1Size)
        lines.push(`- h1: ${state.h1Size}px`);
      if (state.h2Size !== DEFAULTS.h2Size)
        lines.push(`- h2: ${state.h2Size}px`);
      if (state.h3Size !== DEFAULTS.h3Size)
        lines.push(`- h3: ${state.h3Size}px`);
      if (state.h4Size !== DEFAULTS.h4Size)
        lines.push(`- h4: ${state.h4Size}px`);
      if (state.h5Size !== DEFAULTS.h5Size)
        lines.push(`- h5: ${state.h5Size}px`);
      if (state.h6Size !== DEFAULTS.h6Size)
        lines.push(`- h6: ${state.h6Size}px`);
      if (state.bodySize !== DEFAULTS.bodySize)
        lines.push(`- body: ${state.bodySize}px`);
      lines.push("");
    }
  }

  // ── Border Radius ──
  if (state.radius !== DEFAULTS.radius) {
    lines.push("## Border Radius");
    lines.push("");
    lines.push(
      `In \`src/app/globals.css\`, update \`--radius\` in \`:root\` to \`${state.radius}rem\`.`
    );
    lines.push("");
    lines.push(
      "The homepage uses five tiers of hardcoded pixel radius values. Update each tier proportionally to match the new base radius:"
    );
    lines.push("");
    lines.push("| Current class | New value | Used on |");
    lines.push("|---|---|---|");
    lines.push(
      `| \`rounded-[28px]\` | \`rounded-[${Math.round(state.radius * 3.5 * 16)}px]\` | Hero card, testimonial, impact, contact container, how-it-works images |`
    );
    lines.push(
      `| \`rounded-[24px]\` | \`rounded-[${Math.round(state.radius * 3 * 16)}px]\` | Service cards |`
    );
    lines.push(
      `| \`rounded-[20px]\` | \`rounded-[${Math.round(state.radius * 2.5 * 16)}px]\` | Feature cards, pricing cards, team cards, why-choose-us cards |`
    );
    lines.push(
      `| \`rounded-[16px]\` | \`rounded-[${Math.round(state.radius * 2 * 16)}px]\` | Hero image, contact image (see nested note below) |`
    );
    lines.push(
      `| \`rounded-[12px]\` | \`rounded-[${Math.round(state.radius * 1.5 * 16)}px]\` | Contact form inputs |`
    );
    lines.push("");
    const nestedInner = Math.max(Math.round(state.radius * 3.5 * 16 - 16), 0);
    lines.push(
      `**Nested radius:** The hero image and contact image (\`rounded-[16px]\`) are nested inside their \`rounded-[28px]\` containers with \`p-4\` (16px) padding. For concentric curves, their radius should be \`outer - padding\` = \`${nestedInner}px\` instead of the flat tier value above.`
    );
    lines.push("");
    lines.push(
      "**Do not change** `rounded-full` or `rounded-[1000px]` classes — these are pill-shaped buttons and badges that should remain fully rounded."
    );
    lines.push("");
    lines.push("Affected files:");
    lines.push("- `src/components/home/hero.tsx`");
    lines.push("- `src/components/home/features.tsx`");
    lines.push("- `src/components/home/services.tsx`");
    lines.push("- `src/components/home/pricing.tsx`");
    lines.push("- `src/components/home/team.tsx`");
    lines.push("- `src/components/home/testimonial.tsx`");
    lines.push("- `src/components/home/how-it-works.tsx`");
    lines.push("- `src/components/home/why-choose-us.tsx`");
    lines.push("- `src/components/home/impact.tsx`");
    lines.push("- `src/components/home/contact.tsx`");
    lines.push("");
  }

  // ── Branding ──
  if (state.logoMode !== "none") {
    lines.push("## Branding");
    lines.push("");

    if (state.logoMode === "upload") {
      lines.push(
        "Replace `/public/logo.svg` and `/public/logo-dark-mode.svg` with the client's logo files. Ensure both light and dark variants are provided."
      );
    } else if (state.logoMode === "placeholder" && state.logoText) {
      lines.push(
        `Update the app name from 'Airdev' to '${state.logoText}'.`
      );
      lines.push("");
      lines.push("Steps:");
      lines.push(
        `- Update \`APP_NAME\` in \`src/lib/constants.ts\` to \`"${state.logoText}"\``
      );
      lines.push(
        "- Replace `/public/logo.svg` and `/public/logo-dark-mode.svg` with the new brand logo"
      );
      lines.push(
        `- Update the Logo component fallback text in \`src/components/layout/logo.tsx\``
      );
    }

    lines.push("");
    lines.push(
      "Also update any hardcoded 'Airdev' text in `src/components/home/footer.tsx` and `src/components/layout/admin-sidebar.tsx`."
    );
    lines.push("");
  }

  // Final safety net
  lines.push("---");
  lines.push("");
  lines.push(
    "After making all changes, search the full codebase for any other instances of the old values not listed above to ensure nothing was missed."
  );

  return lines.join("\n");
}
