import type { SWIFTMT202Payload } from "../types/messages.js";
import { padBIC, formatAmount, formatToday } from "./helpers.js";

/**
 * Generates a SWIFT MT202 message (Financial Institution Credit Transfer).
 * Reference: SWIFT SR 2025 MT202 field specification.
 */
export function buildMT202(payload: SWIFTMT202Payload): string {
  const {
    senderBIC, receiverBIC, reference, relatedReference, amount, currency,
    valueDate = formatToday(),
    accountWithInstitutionBIC, beneficiaryInstitutionBIC,
  } = payload;

  return [
    `{1:F01${padBIC(senderBIC)}0000000000}`,
    `{2:I202${padBIC(receiverBIC)}N}`,
    `{4:`,
    `:20:${reference.slice(0, 16)}`,
    `:21:${relatedReference.slice(0, 16)}`,
    `:32A:${valueDate}${currency}${formatAmount(amount)}`,
    `:57A:${accountWithInstitutionBIC}`,
    `:58A:${beneficiaryInstitutionBIC}`,
    `-}`,
  ].join("\r\n");
}
