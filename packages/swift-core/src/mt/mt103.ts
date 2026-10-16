import type { SWIFTMT103Payload } from "../types/messages.js";
import { padBIC, formatAmount, formatToday } from "./helpers.js";

/**
 * Generates a SWIFT MT103 message (Single Customer Credit Transfer).
 * Reference: SWIFT SR 2025 MT103 field specification.
 */
export function buildMT103(payload: SWIFTMT103Payload): string {
  const {
    senderBIC, receiverBIC, reference, amount, currency,
    orderingAccount, orderingName, beneficiaryAccount, beneficiaryName,
    chargesCode = "SHA",
    valueDate = formatToday(),
  } = payload;

  return [
    `{1:F01${padBIC(senderBIC)}0000000000}`,
    `{2:I103${padBIC(receiverBIC)}N}`,
    `{4:`,
    `:20:${reference.slice(0, 16)}`,
    `:23B:CRED`,
    `:32A:${valueDate}${currency}${formatAmount(amount)}`,
    `:50K:/${orderingAccount}`,
    orderingName.slice(0, 35),
    `:59:/${beneficiaryAccount}`,
    beneficiaryName.slice(0, 35),
    `:71A:${chargesCode}`,
    `-}`,
  ].join("\r\n");
}
