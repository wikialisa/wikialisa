/** BIC (Business Identifier Code) branded type — 8 or 11 characters */
export type BIC = string & { readonly __brand: "BIC" };

/** IBAN (International Bank Account Number) branded type — up to 34 characters */
export type IBAN = string & { readonly __brand: "IBAN" };

const BIC_REGEX = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

/** Returns true if the string is a valid BIC-8 or BIC-11 */
export function isBIC(bic: string): bic is BIC {
  return BIC_REGEX.test(bic.toUpperCase().trim());
}

/**
 * Normalise BIC to uppercase, pad BIC-8 to BIC-11 with "XXX".
 * @throws {Error} if the input is not a valid BIC
 */
export function normaliseBIC(bic: string): string {
  const upper = bic.toUpperCase().trim();
  if (!isBIC(upper)) throw new Error(`Invalid BIC: "${bic}"`);
  return upper.length === 8 ? `${upper}XXX` : upper;
}

function _mod97(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let remainder = 0;
  for (const ch of numeric) {
    remainder = (remainder * 10 + parseInt(ch, 10)) % 97;
  }
  return remainder === 1;
}

/** Returns true if the string passes IBAN format and MOD-97 check */
export function isIBAN(iban: string): iban is IBAN {
  const n = iban.replace(/\s+/g, "").toUpperCase();
  if (n.length < 15 || n.length > 34) return false;
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(n)) return false;
  return _mod97(n);
}

/**
 * Normalise an IBAN — strip spaces, uppercase.
 * @throws {Error} if the IBAN is invalid
 */
export function normaliseIBAN(iban: string): string {
  const n = iban.replace(/\s+/g, "").toUpperCase();
  if (!isIBAN(n)) throw new Error(`Invalid IBAN: "${iban}"`);
  return n;
}

/** Returns true if the string looks like a valid ISO 4217 currency code */
export function isCurrencyCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

/**
 * Returns true if the amount string is a valid positive decimal.
 * Accepts both "." and "," as decimal separator.
 */
export function isValidAmount(amount: string): boolean {
  return /^\d{1,15}([.,]\d{1,5})?$/.test(amount.trim()) &&
    parseFloat(amount.replace(",", ".")) > 0;
}
