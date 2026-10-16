// ─── MT (ISO 15022) Types ─────────────────────────────────────────────────────

/**
 * Payload for generating a SWIFT MT103 (Single Customer Credit Transfer).
 * Reference: SWIFT SR 2025 MT103 field specification.
 */
export interface SWIFTMT103Payload {
  /** BIC8/BIC11 of the sending institution */
  senderBIC: string;
  /** BIC8/BIC11 of the receiving institution */
  receiverBIC: string;
  /** Unique transaction reference (max 16 chars, :20: field) */
  reference: string;
  /** Transfer amount */
  amount: number;
  /** ISO 4217 currency code */
  currency: string;
  /** Ordering customer account */
  orderingAccount: string;
  /** Ordering customer name (max 35 chars) */
  orderingName: string;
  /** Beneficiary account (IBAN or local) */
  beneficiaryAccount: string;
  /** Beneficiary name (max 35 chars) */
  beneficiaryName: string;
  /** Charges code: SHA (default) | OUR | BEN */
  chargesCode?: "SHA" | "OUR" | "BEN";
  /** Value date in YYMMDD format. Defaults to today. */
  valueDate?: string;
}

/**
 * Payload for generating a SWIFT MT202 (Financial Institution Credit Transfer).
 * Reference: SWIFT SR 2025 MT202 field specification.
 */
export interface SWIFTMT202Payload {
  senderBIC: string;
  receiverBIC: string;
  reference: string;
  relatedReference: string;
  amount: number;
  currency: string;
  valueDate?: string;
  /** Account with Institution BIC */
  accountWithInstitutionBIC: string;
  /** Beneficiary Institution BIC */
  beneficiaryInstitutionBIC: string;
}

/** A single transaction line in an MT940 statement */
export interface MT940Transaction {
  /** Ngày valeur YYMMDD */
  valueDate: string;
  /** Ngày đặt bút MMDD (optional) */
  entryDate?: string;
  /** D = Debit, C = Credit, RD = Reverse Debit, RC = Reverse Credit */
  creditDebitMark: "D" | "C" | "RD" | "RC";
  /** Funds code (currency 3rd char) */
  fundsCode?: string;
  amount: number;
  /** Transaction type code: NTRF, NCHK, NMSC, etc. */
  transactionTypeCode: string;
  customerReference: string;
  bankReference?: string;
  supplementaryDetails?: string;
}

/**
 * Payload for generating a SWIFT MT940 Customer Statement Message.
 */
export interface SWIFTMT940Payload {
  senderBIC: string;
  receiverBIC: string;
  /** Transaction Reference Number (:20:) */
  reference: string;
  /** Account Identification (:25:) */
  accountId: string;
  /** Statement/Sequence Number (:28C:), e.g. "00001/001" */
  statementSeqNo: string;
  /** F = Final, I = Interim */
  openingBalanceMark: "F" | "I";
  openingBalanceDC: "D" | "C";
  openingBalanceDate: string;
  openingBalanceCurrency: string;
  openingBalanceAmount: number;
  transactions: MT940Transaction[];
  closingBalanceMark: "F" | "I";
  closingBalanceDC: "D" | "C";
  closingBalanceDate: string;
  closingBalanceCurrency: string;
  closingBalanceAmount: number;
}

// ─── ISO 20022 Types ──────────────────────────────────────────────────────────

/** pacs.008.001 — FIToFI Customer Credit Transfer */
export interface Pacs008Payload {
  msgId: string;
  creDtTm?: string;
  nbOfTxs?: number;
  sttlmMtd?: string;
  instrId: string;
  endToEndId: string;
  txId: string;
  intrBkSttlmAmt: number;
  currency: string;
  intrBkSttlmDt?: string;
  dbtrName: string;
  dbtrAcctIBAN: string;
  dbtrAgtBIC: string;
  cdtrAgtBIC: string;
  cdtrName: string;
  cdtrAcctIBAN: string;
}

/** pacs.009.001 — Financial Institution Credit Transfer */
export interface Pacs009Payload {
  msgId: string;
  creDtTm?: string;
  nbOfTxs?: number;
  sttlmMtd?: string;
  instrId: string;
  endToEndId: string;
  txId: string;
  intrBkSttlmAmt: number;
  currency: string;
  intrBkSttlmDt?: string;
  instgAgtBIC: string;
  instdAgtBIC: string;
  dbtrAgtBIC: string;
  cdtrAgtBIC: string;
  cdtrName: string;
  cdtrAcctIBAN: string;
}

/** A single entry in a camt.053 statement */
export interface Camt053Entry {
  amount: number;
  currency: string;
  creditDebitIndicator: "CRDT" | "DBIT";
  status: "BOOK" | "PDNG";
  bookingDate: string;
  valueDate: string;
  accountServicerRef?: string;
  endToEndId?: string;
  bankTransactionCode?: string;
  additionalEntryInfo?: string;
}

/** camt.053.001 — Bank-to-Customer Statement */
export interface Camt053Payload {
  msgId: string;
  creDtTm?: string;
  msgPgntn?: string;
  stmtId: string;
  seqNb?: number;
  frDt: string;
  toDt: string;
  accountIBAN: string;
  servicerBIC: string;
  openingBalanceAmt: number;
  openingBalanceCurrency: string;
  openingBalanceDC: "CRDT" | "DBIT";
  openingBalanceDate: string;
  closingBalanceAmt: number;
  closingBalanceCurrency: string;
  closingBalanceDC: "CRDT" | "DBIT";
  closingBalanceDate: string;
  entries: Camt053Entry[];
}

// ─── Security Types ───────────────────────────────────────────────────────────

/** LAU HMAC-SHA256 signature output */
export interface LAUSignatureResult {
  signature: string;
  algorithm: "HMAC-SHA256";
  timestamp: string;
}

/** MGW transmission result */
export interface MGWTransmissionResult {
  success: boolean;
  messageId: string;
  lauSignature: string;
  status: "QUEUED" | "TRANSMITTED_TO_SWIFT_MGW" | "REJECTED";
  rawMessage: string;
  timestamp: string;
}
