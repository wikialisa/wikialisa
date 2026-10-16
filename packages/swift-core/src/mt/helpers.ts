// ─── MT helpers (shared across MT103, MT202, MT940) ──────────────────────────

/** Pad a BIC to 12 chars: BIC8 → BIC8XXXX, BIC11 → BIC11X */
export function padBIC(bic: string): string {
  return bic.padEnd(12, "X").slice(0, 12);
}

/** Format amount per SWIFT convention: integral + comma-separated decimals (e.g. 1500000,00) */
export function formatAmount(amount: number): string {
  return amount.toFixed(2).replace(".", ",");
}

/** Returns today (UTC) as YYMMDD, used as default valueDate */
export function formatToday(): string {
  return new Date().toISOString().slice(2, 10).replace(/-/g, "");
}
