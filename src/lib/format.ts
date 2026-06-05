/**
 * Format dashboard stat values: plain numbers get thousands separators;
 * currency strings like "$48200" or "$48,200" normalize to "$48,200".
 */
export function formatDashboardStatValue(value: string | number): string {
  if (typeof value === "number") {
    return value.toLocaleString("en-US");
  }
  const trimmed = value.trim();
  const currency = trimmed.match(/^\$\s*([\d,]+(?:\.\d+)?)\s*$/);
  if (currency) {
    const num = Number(currency[1].replace(/,/g, ""));
    if (!Number.isNaN(num)) {
      return `$${num.toLocaleString("en-US")}`;
    }
  }
  return value;
}

/** Thousands separators for chart axes and inline metrics (en-US). */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}
