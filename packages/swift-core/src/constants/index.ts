/** SWIFT message category numbers */
export enum MessageCategory {
  CATEGORY_1 = "1",
  CATEGORY_2 = "2",
  CATEGORY_9 = "9",
}

/** ISO 20022 charge bearer codes */
export enum ChargeBearerCode {
  SHA = "SHA",
  OUR = "OUR",
  BEN = "BEN",
}

/** ISO 20022 settlement method codes */
export enum SettlementMethod {
  CLRG = "CLRG",
  INDA = "INDA",
  INGA = "INGA",
}

/** Internal AXQ transaction lifecycle statuses */
export enum TransactionStatus {
  QUEUED = "QUEUED",
  SUBMITTED = "SUBMITTED",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING",
  FAILED = "FAILED",
}

/** SWIFT field maximum character limits per specification */
export const SWIFT_FIELD_LIMITS = {
  REFERENCE: 16,
  ACCOUNT: 34,
  NAME: 35,
  BIC: 11,
  IBAN: 34,
  AMOUNT: 15,
} as const;

/** Supported ISO 4217 currency codes in the AXQ system */
export const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "CNY",
  "VND", "SGD", "HKD", "KRW", "THB",
  "AUD", "CAD", "CHF", "MYR", "IDR",
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number];

/** Supported SWIFT message types */
export type SWIFTMessageType =
  | "MT103" | "MT202" | "MT940"
  | "PACS008" | "PACS009" | "CAMT053" | "CAMT056" | "PAIN001";

/** SWIFT event names (Redis Streams) */
export type SWIFTEventName =
  | "SWIFT_MT103_REQUESTED"
  | "SWIFT_MT202_REQUESTED"
  | "SWIFT_PACS008_REQUESTED"
  | "SWIFT_PACS009_REQUESTED"
  | "SWIFT_CAMT053_REQUESTED"
  | "SWIFT_MESSAGE_SENT"
  | "SWIFT_MESSAGE_CONFIRMED"
  | "SWIFT_MESSAGE_REJECTED"
  | "SWIFT_MESSAGE_CANCELLED";
