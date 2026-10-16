import { randomUUID } from "node:crypto";

/**
 * Generate a UETR (Unique End-to-end Transaction Reference) per SWIFT gpi spec.
 * UETR = RFC 4122 UUID v4, lowercase hyphenated.
 */
export function generateUETR(): string {
  return randomUUID();
}

/** Validate that a string is a valid UETR (UUID v4). */
export function isValidUETR(uetr: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uetr);
}

/**
 * Canonicalize a UETR to lowercase hyphenated form.
 * @throws {Error} if not a valid UUID v4
 */
export function formatUETR(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (!isValidUETR(lower)) throw new Error(`Invalid UETR: "${raw}"`);
  return lower;
}

/** Format number to SWIFT FIN amount string (comma decimal). e.g. 1500.5 → "1500,50" */
export function formatSWIFTAmount(amount: number): string {
  return amount.toFixed(2).replace(".", ",");
}

/** Parse SWIFT FIN amount string (comma decimal) to number. e.g. "1500,50" → 1500.5 */
export function parseSWIFTAmount(amount: string): number {
  return parseFloat(amount.replace(",", "."));
}

/** Format a Date as SWIFT YYMMDD (MT message fields). */
export function toSWIFTDate(date: Date = new Date()): string {
  return date.toISOString().slice(2, 10).replace(/-/g, "");
}

/** Format a Date as ISO 8601 UTC string (MX/pacs messages). */
export function toISO8601(date: Date = new Date()): string {
  return date.toISOString();
}
