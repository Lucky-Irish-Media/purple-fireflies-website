const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/**
 * Pet pages show real dollar amounts from cached D1 cents, so the formatting
 * lives in one place instead of an inline `toLocaleString` in every cell.
 */
export function formatCents(cents: number): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0;
  return usdFormatter.format(safe / 100);
}
