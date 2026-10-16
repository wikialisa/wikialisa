import type { SWIFTMT940Payload } from "../types/messages.js";
import { padBIC, formatAmount } from "./helpers.js";

/**
 * Generates a SWIFT MT940 Customer Statement Message.
 * Reference: SWIFT SR 2025 MT940 field specification.
 */
export function buildMT940(payload: SWIFTMT940Payload): string {
  const lines: string[] = [
    `{1:F01${padBIC(payload.senderBIC)}0000000000}`,
    `{2:I940${padBIC(payload.receiverBIC)}N}`,
    `{4:`,
    `:20:${payload.reference.slice(0, 16)}`,
    `:25:${payload.accountId.slice(0, 35)}`,
    `:28C:${payload.statementSeqNo}`,
    `:${payload.openingBalanceMark === "F" ? "60F" : "60M"}:${payload.openingBalanceDC}${payload.openingBalanceDate}${payload.openingBalanceCurrency}${formatAmount(payload.openingBalanceAmount)}`,
  ];

  for (const tx of payload.transactions) {
    const entry = tx.entryDate ?? tx.valueDate.slice(2);
    const bankRef = tx.bankReference ? `//` + tx.bankReference : "";
    lines.push(
      `:61:${tx.valueDate}${entry}${tx.creditDebitMark}${tx.fundsCode ?? ""}${formatAmount(tx.amount)}${tx.transactionTypeCode}${tx.customerReference}${bankRef}`
    );
    if (tx.supplementaryDetails) {
      lines.push(`:86:${tx.supplementaryDetails.slice(0, 390)}`);
    }
  }

  lines.push(
    `:${payload.closingBalanceMark === "F" ? "62F" : "62M"}:${payload.closingBalanceDC}${payload.closingBalanceDate}${payload.closingBalanceCurrency}${formatAmount(payload.closingBalanceAmount)}`,
    `-}`
  );

  return lines.join("\r\n");
}
