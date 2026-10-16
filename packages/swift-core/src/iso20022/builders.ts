import { XMLBuilder, XMLParser } from "fast-xml-parser";
import type { Pacs008Payload, Pacs009Payload, Camt053Payload, Camt053Entry } from "../types/messages.js";

// ─── Shared XML instances ──────────────────────────────────────────────────────

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  format: true,
  indentBy: "  ",
  suppressEmptyNode: true,
});

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
});

// ─── pacs.008 ─────────────────────────────────────────────────────────────────

/**
 * Build a pacs.008.001.08 FIToFI Customer Credit Transfer XML message.
 */
export function buildPacs008(payload: Pacs008Payload): string {
  const {
    msgId, creDtTm = new Date().toISOString(), nbOfTxs = 1,
    sttlmMtd = "CLRG", instrId, endToEndId, txId,
    intrBkSttlmAmt, currency,
    intrBkSttlmDt = new Date().toISOString().split("T")[0],
    dbtrName, dbtrAcctIBAN, dbtrAgtBIC, cdtrAgtBIC, cdtrName, cdtrAcctIBAN,
  } = payload;

  return builder.build({
    "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
    Document: {
      "@_xmlns": "urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08",
      FIToFICstmrCdtTrf: {
        GrpHdr: {
          MsgId: msgId, CreDtTm: creDtTm, NbOfTxs: nbOfTxs,
          SttlmInf: { SttlmMtd: sttlmMtd },
        },
        CdtTrfTxInf: {
          PmtId: { InstrId: instrId, EndToEndId: endToEndId, TxId: txId },
          IntrBkSttlmAmt: { "@_Ccy": currency, "#text": intrBkSttlmAmt.toFixed(2) },
          IntrBkSttlmDt: intrBkSttlmDt,
          Dbtr: { Nm: dbtrName },
          DbtrAcct: { Id: { IBAN: dbtrAcctIBAN } },
          DbtrAgt: { FinInstnId: { BICFI: dbtrAgtBIC } },
          CdtrAgt: { FinInstnId: { BICFI: cdtrAgtBIC } },
          Cdtr: { Nm: cdtrName },
          CdtrAcct: { Id: { IBAN: cdtrAcctIBAN } },
        },
      },
    },
  }) as string;
}

/** Parse an inbound pacs.008 XML string into a plain object. */
export function parsePacs008(xml: string): Record<string, unknown> {
  return parser.parse(xml) as Record<string, unknown>;
}

// ─── pacs.009 ─────────────────────────────────────────────────────────────────

/**
 * Build a pacs.009.001.08 Financial Institution Credit Transfer XML message.
 */
export function buildPacs009(payload: Pacs009Payload): string {
  const {
    msgId, creDtTm = new Date().toISOString(), nbOfTxs = 1,
    sttlmMtd = "CLRG", instrId, endToEndId, txId,
    intrBkSttlmAmt, currency,
    intrBkSttlmDt = new Date().toISOString().split("T")[0],
    instgAgtBIC, instdAgtBIC, dbtrAgtBIC, cdtrAgtBIC, cdtrName, cdtrAcctIBAN,
  } = payload;

  return builder.build({
    "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
    Document: {
      "@_xmlns": "urn:iso:std:iso:20022:tech:xsd:pacs.009.001.08",
      FICdtTrf: {
        GrpHdr: {
          MsgId: msgId, CreDtTm: creDtTm, NbOfTxs: nbOfTxs,
          SttlmInf: { SttlmMtd: sttlmMtd },
          InstgAgt: { FinInstnId: { BICFI: instgAgtBIC } },
          InstdAgt: { FinInstnId: { BICFI: instdAgtBIC } },
        },
        CdtTrfTxInf: {
          PmtId: { InstrId: instrId, EndToEndId: endToEndId, TxId: txId },
          IntrBkSttlmAmt: { "@_Ccy": currency, "#text": intrBkSttlmAmt.toFixed(2) },
          IntrBkSttlmDt: intrBkSttlmDt,
          DbtrAgt: { FinInstnId: { BICFI: dbtrAgtBIC } },
          CdtrAgt: { FinInstnId: { BICFI: cdtrAgtBIC } },
          Cdtr: { Nm: cdtrName },
          CdtrAcct: { Id: { IBAN: cdtrAcctIBAN } },
        },
      },
    },
  }) as string;
}

/** Parse an inbound pacs.009 XML string into a plain object. */
export function parsePacs009(xml: string): Record<string, unknown> {
  return parser.parse(xml) as Record<string, unknown>;
}

// ─── camt.053 ─────────────────────────────────────────────────────────────────

/**
 * Build a camt.053.001.08 Bank-to-Customer Statement XML message.
 */
export function buildCamt053(payload: Camt053Payload): string {
  const {
    msgId, creDtTm = new Date().toISOString(), msgPgntn = "1/1",
    stmtId, seqNb = 1, frDt, toDt, accountIBAN, servicerBIC,
    openingBalanceAmt, openingBalanceCurrency, openingBalanceDC, openingBalanceDate,
    closingBalanceAmt, closingBalanceCurrency, closingBalanceDC, closingBalanceDate,
    entries,
  } = payload;

  const entryNodes = entries.map((e: Camt053Entry) => ({
    Amt: { "@_Ccy": e.currency, "#text": e.amount.toFixed(2) },
    CdtDbtInd: e.creditDebitIndicator,
    Sts: { Cd: e.status },
    BookgDt: { Dt: e.bookingDate },
    ValDt: { Dt: e.valueDate },
    ...(e.accountServicerRef ? { AcctSvcrRef: e.accountServicerRef } : {}),
    BkTxCd: e.bankTransactionCode
      ? { Domn: { Cd: "PMNT", Fmly: { Cd: e.bankTransactionCode, SubFmlyCd: "OTHR" } } }
      : { Domn: { Cd: "PMNT", Fmly: { Cd: "MCOP", SubFmlyCd: "OTHR" } } },
    NtryDtls: {
      TxDtls: {
        Refs: { EndToEndId: e.endToEndId ?? "NOTPROVIDED" },
        ...(e.additionalEntryInfo ? { AddtlTxInf: e.additionalEntryInfo } : {}),
      },
    },
  }));

  return builder.build({
    "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
    Document: {
      "@_xmlns": "urn:iso:std:iso:20022:tech:xsd:camt.053.001.08",
      BkToCstmrStmt: {
        GrpHdr: { MsgId: msgId, CreDtTm: creDtTm, MsgPgntn: { PgNb: msgPgntn, LastPgInd: true } },
        Stmt: {
          Id: stmtId, SeqNb: seqNb,
          Acct: { Id: { IBAN: accountIBAN }, Svcr: { FinInstnId: { BICFI: servicerBIC } } },
          Bal: [
            { Tp: { CdOrPrtry: { Cd: "OPBD" } }, Amt: { "@_Ccy": openingBalanceCurrency, "#text": openingBalanceAmt.toFixed(2) }, CdtDbtInd: openingBalanceDC, Dt: { Dt: openingBalanceDate } },
            { Tp: { CdOrPrtry: { Cd: "CLBD" } }, Amt: { "@_Ccy": closingBalanceCurrency, "#text": closingBalanceAmt.toFixed(2) }, CdtDbtInd: closingBalanceDC, Dt: { Dt: closingBalanceDate } },
          ],
          TxsSummry: {
            TtlDbtNtries: { NbOfNtries: entries.filter((e: Camt053Entry) => e.creditDebitIndicator === "DBIT").length },
            TtlCdtNtries: { NbOfNtries: entries.filter((e: Camt053Entry) => e.creditDebitIndicator === "CRDT").length },
          },
          Ntry: entryNodes,
          FrToDt: { FrDtTm: `${frDt}T00:00:00Z`, ToDtTm: `${toDt}T23:59:59Z` },
        },
      },
    },
  }) as string;
}

/** Parse an inbound camt.053 XML string into a plain object. */
export function parseCamt053(xml: string): Record<string, unknown> {
  return parser.parse(xml) as Record<string, unknown>;
}
