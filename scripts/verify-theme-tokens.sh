#!/usr/bin/env bash
# Theme token verification gate (Slice 2b)
#
# Check 1: No unallowlisted hex / arbitrary hex color literals in TS/TSX
# Check 2: Every @theme --color-* mapping references a CSS var in :root and .dark
#
# Allowlist (documented in docs/theme-tokens.md):
#   src/app/theme/**                          — theme generator UI
#   src/app/(auth)/_components/auth-flow.tsx  — Google OAuth + SVG brand fills
#   src/app/(auth)/_components/auth-flow-sdc-shared.tsx
#   src/app/(settings)/account/_components/appearance-section.tsx
#   src/app/(admin)/admin/dashboard/_components/*-chart.tsx
#   src/lib/themes.ts                         — theme catalog swatches
#   src/mock/dashboard.ts                     — chart series mock data

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

failures=0

normalize_path() {
  printf '%s' "$1" | sed 's|//*|/|g'
}

is_allowlisted() {
  local file
  file="$(normalize_path "$1")"
  [[ "$file" =~ ^src/app/theme/ ]] && return 0
  [[ "$file" == "src/app/(auth)/_components/auth-flow.tsx" ]] && return 0
  [[ "$file" == "src/app/(auth)/_components/auth-flow-sdc-shared.tsx" ]] && return 0
  [[ "$file" == "src/app/(settings)/account/_components/appearance-section.tsx" ]] && return 0
  [[ "$file" == "src/lib/themes.ts" ]] && return 0
  [[ "$file" == "src/mock/dashboard.ts" ]] && return 0
  [[ "$file" =~ ^src/app/\(admin\)/admin/dashboard/_components/.*-chart\.tsx$ ]] && return 0
  return 1
}

echo "==> Check 1: hex literals in src/**/*.{ts,tsx}"

hex_pattern='(\[#|#[0-9a-fA-F]{6}\b)'

hex_violations=()
if command -v rg >/dev/null 2>&1; then
  while IFS= read -r match; do
    [[ -z "$match" ]] && continue
    file="$(normalize_path "${match%%:*}")"
    if ! is_allowlisted "$file"; then
      hex_violations+=("$match")
    fi
  done < <(rg --no-heading -n "$hex_pattern" src/ --glob '*.{tsx,ts}' 2>/dev/null || true)
else
  while IFS= read -r match; do
    [[ -z "$match" ]] && continue
    file="$(normalize_path "${match%%:*}")"
    if ! is_allowlisted "$file"; then
      hex_violations+=("$match")
    fi
  done < <(grep -rEn "$hex_pattern" src/ --include='*.tsx' --include='*.ts' 2>/dev/null || true)
fi

if ((${#hex_violations[@]} > 0)); then
  echo -e "${RED}FAIL${NC}: Unallowlisted hex literals found:"
  printf '  %s\n' "${hex_violations[@]}"
  failures=$((failures + 1))
else
  echo -e "${GREEN}PASS${NC}: No unallowlisted hex literals"
fi

echo ""
echo "==> Check 2: @theme --color-* variable completeness"

node <<'NODE'
const fs = require("fs");
const path = "src/app/globals.css";
const css = fs.readFileSync(path, "utf8");

function extractBlock(selector) {
  const re = new RegExp(
    selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{([^}]*)\\}",
    "s"
  );
  const m = css.match(re);
  return m ? m[1] : "";
}

const rootBlock = extractBlock(":root");
const darkBlock = extractBlock(".dark");

const themeStart = css.indexOf("@theme {");
const themeEnd = css.indexOf("\n}", themeStart);
const themeBlock = css.slice(themeStart, themeEnd);

const varInBlock = (block, name) =>
  new RegExp(`--${name}\\s*:`).test(block);

const colorMappings = [
  ...themeBlock.matchAll(/--color-([a-z0-9-]+)\s*:\s*var\(--([a-z0-9-]+)\)/g),
];

const missing = [];
for (const [, colorName, cssVar] of colorMappings) {
  if (!varInBlock(rootBlock, cssVar)) {
    missing.push(`--${cssVar} missing in :root (referenced by --color-${colorName})`);
  }
  if (!varInBlock(darkBlock, cssVar)) {
    missing.push(`--${cssVar} missing in .dark (referenced by --color-${colorName})`);
  }
}

if (missing.length > 0) {
  console.error("\x1b[0;31mFAIL\x1b[0m: Token completeness issues:");
  for (const msg of missing) console.error("  " + msg);
  process.exit(1);
}

console.log("\x1b[0;32mPASS\x1b[0m: All @theme --color-* vars exist in :root and .dark");
NODE

token_exit=$?
if [[ $token_exit -ne 0 ]]; then
  failures=$((failures + 1))
fi

echo ""
if ((failures > 0)); then
  echo -e "${RED}verify:theme failed${NC} ($failures check(s))"
  exit 1
fi

echo -e "${GREEN}verify:theme passed${NC}"
