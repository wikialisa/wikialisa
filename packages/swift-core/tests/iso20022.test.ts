import { describe, it, expect } from "vitest";
import { buildPacs008, parsePacs008, buildPacs009, parsePacs009, buildCamt053, parseCamt053 } from "../src/iso20022/builders.js";
import type { Pacs008Payload, Pacs009Payload, Camt053Payload } from "../src/types/messages.js";

// ─── pacs.008 ─────────────────────────────────────────────────────────────────

const PACS008: Pacs008Payload = {
  msgId:          "PACS008-2025-001",
  instrId:        "INSTR-001",
  endToEndId:     "E2E-001",
  txId:           "TX-001",
  intrBkSttlmAmt: 5000,
  currency:       "USD",
  intrBkSttlmDt:  "2025-01-01",
  dbtrName:       "NGUYEN VAN A",
  dbtrAcctIBAN:   "GB29NWBK60161331926819",
  dbtrAgtBIC:     "AXVNVNVN",
  cdtrAgtBIC:     "BARCGB22",
  cdtrName:       "JOHN DOE",
  cdtrAcctIBAN:   "DE89370400440532013000",
};

describe("buildPacs008", () => {
  it("returns a non-empty XML string", () => {
    const xml = buildPacs008(PACS008);
    expect(typeof xml).toBe("string");
    expect(xml.length).toBeGreaterThan(100);
  });

  it("starts with XML declaration", () => {
    const xml = buildPacs008(PACS008);
    expect(xml).toMatch(/^<\?xml/);
  });

  it("contains the correct ISO 20022 namespace", () => {
    const xml = buildPacs008(PACS008);
    expect(xml).toContain("urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08");
  });

  it("embeds msgId in GrpHdr", () => {
    const xml = buildPacs008(PACS008);
    expect(xml).toContain("<MsgId>PACS008-2025-001</MsgId>");
  });

  it("embeds settlement amount with currency attribute", () => {
    const xml = buildPacs008(PACS008);
    expect(xml).toContain('Ccy="USD"');
    expect(xml).toContain("5000.00");
  });

  it("embeds debtor IBAN", () => {
    const xml = buildPacs008(PACS008);
    expect(xml).toContain("GB29NWBK60161331926819");
  });

  it("embeds creditor IBAN", () => {
    const xml = buildPacs008(PACS008);
    expect(xml).toContain("DE89370400440532013000");
  });

  it("embeds debtor and creditor BICs", () => {
    const xml = buildPacs008(PACS008);
    expect(xml).toContain("AXVNVNVN");
    expect(xml).toContain("BARCGB22");
  });
});

describe("parsePacs008", () => {
  it("round-trips: build then parse recovers msgId", () => {
    const xml = buildPacs008(PACS008);
    const parsed = parsePacs008(xml) as any;
    expect(parsed?.Document?.FIToFICstmrCdtTrf?.GrpHdr?.MsgId).toBe("PACS008-2025-001");
  });

  it("returns an object (not null/undefined)", () => {
    const xml = buildPacs008(PACS008);
    const parsed = parsePacs008(xml);
    expect(parsed).toBeTruthy();
    expect(typeof parsed).toBe("object");
  });
});

// ─── pacs.009 ─────────────────────────────────────────────────────────────────

const PACS009: Pacs009Payload = {
  msgId:          "PACS009-2025-001",
  instrId:        "INSTR-002",
  endToEndId:     "E2E-002",
  txId:           "TX-002",
  intrBkSttlmAmt: 100000,
  currency:       "EUR",
  intrBkSttlmDt:  "2025-01-01",
  instgAgtBIC:    "AXVNVNVN",
  instdAgtBIC:    "DEUTDEFF",
  dbtrAgtBIC:     "CITIUS33",
  cdtrAgtBIC:     "BNPAFRPP",
  cdtrName:       "ACME CORP",
  cdtrAcctIBAN:   "FR7630006000011234567890189",
};

describe("buildPacs009", () => {
  it("returns XML containing correct namespace", () => {
    const xml = buildPacs009(PACS009);
    expect(xml).toContain("urn:iso:std:iso:20022:tech:xsd:pacs.009.001.08");
  });

  it("embeds instgAgtBIC", () => {
    const xml = buildPacs009(PACS009);
    expect(xml).toContain("AXVNVNVN");
  });

  it("embeds settlement amount and currency", () => {
    const xml = buildPacs009(PACS009);
    expect(xml).toContain('Ccy="EUR"');
    expect(xml).toContain("100000.00");
  });
});

describe("parsePacs009", () => {
  it("round-trips msgId correctly", () => {
    const xml = buildPacs009(PACS009);
    const parsed = parsePacs009(xml) as any;
    expect(parsed?.Document?.FICdtTrf?.GrpHdr?.MsgId).toBe("PACS009-2025-001");
  });
});

// ─── camt.053 ─────────────────────────────────────────────────────────────────

const CAMT053: Camt053Payload = {
  msgId:                  "CAMT053-2025-001",
  stmtId:                 "STMT-001",
  frDt:                   "2025-01-01",
  toDt:                   "2025-01-31",
  accountIBAN:            "GB29NWBK60161331926819",
  servicerBIC:            "AXVNVNVN",
  openingBalanceAmt:      10000,
  openingBalanceCurrency: "USD",
  openingBalanceDC:       "CRDT",
  openingBalanceDate:     "2025-01-01",
  closingBalanceAmt:      12500,
  closingBalanceCurrency: "USD",
  closingBalanceDC:       "CRDT",
  closingBalanceDate:     "2025-01-31",
  entries: [
    {
      amount:               5000,
      currency:             "USD",
      creditDebitIndicator: "CRDT",
      status:               "BOOK",
      bookingDate:          "2025-01-15",
      valueDate:            "2025-01-15",
      endToEndId:           "E2E-CRDT-001",
    },
    {
      amount:               2500,
      currency:             "USD",
      creditDebitIndicator: "DBIT",
      status:               "BOOK",
      bookingDate:          "2025-01-20",
      valueDate:            "2025-01-20",
      endToEndId:           "E2E-DBIT-001",
    },
  ],
};

describe("buildCamt053", () => {
  it("returns XML containing correct namespace", () => {
    const xml = buildCamt053(CAMT053);
    expect(xml).toContain("urn:iso:std:iso:20022:tech:xsd:camt.053.001.08");
  });

  it("embeds msgId", () => {
    const xml = buildCamt053(CAMT053);
    expect(xml).toContain("<MsgId>CAMT053-2025-001</MsgId>");
  });

  it("embeds account IBAN", () => {
    const xml = buildCamt053(CAMT053);
    expect(xml).toContain("GB29NWBK60161331926819");
  });

  it("embeds both CRDT and DBIT entries", () => {
    const xml = buildCamt053(CAMT053);
    expect(xml).toContain("CRDT");
    expect(xml).toContain("DBIT");
  });
});

describe("parseCamt053", () => {
  it("round-trips msgId correctly", () => {
    const xml = buildCamt053(CAMT053);
    const parsed = parseCamt053(xml) as any;
    expect(parsed?.Document?.BkToCstmrStmt?.GrpHdr?.MsgId).toBe("CAMT053-2025-001");
  });
});
