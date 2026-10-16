import { z } from "zod";

const BIC = z.string().regex(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/, "Invalid BIC");
const IBAN = z.string().min(15).max(34);
const ISODate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const YYMMDDDate = z.string().regex(/^\d{6}$/, "Expected YYMMDD");
const PositiveAmount = z.number().positive();
const Currency = z.string().length(3).regex(/^[A-Z]{3}$/, "Expected ISO 4217");
const SttlmMtd = z.enum(["CLRG", "INDA", "INGA"]);

export const MT103Schema = z.object({
  senderBIC: BIC,
  receiverBIC: BIC,
  reference: z.string().min(1).max(16),
  amount: PositiveAmount,
  currency: Currency,
  orderingAccount: z.string().min(1).max(34),
  orderingName: z.string().min(1).max(35),
  beneficiaryAccount: z.string().min(1).max(34),
  beneficiaryName: z.string().min(1).max(35),
  chargesCode: z.enum(["SHA", "OUR", "BEN"]).optional(),
  valueDate: YYMMDDDate.optional(),
});

export const MT202Schema = z.object({
  senderBIC: BIC,
  receiverBIC: BIC,
  reference: z.string().min(1).max(16),
  relatedReference: z.string().min(1).max(16),
  amount: PositiveAmount,
  currency: Currency,
  valueDate: YYMMDDDate.optional(),
  accountWithInstitutionBIC: BIC,
  beneficiaryInstitutionBIC: BIC,
});

export const Pacs008Schema = z.object({
  msgId: z.string().min(1).max(35),
  creDtTm: z.string().datetime({ offset: true }).optional(),
  nbOfTxs: z.number().int().positive().optional(),
  sttlmMtd: SttlmMtd.optional(),
  instrId: z.string().min(1).max(35),
  endToEndId: z.string().min(1).max(35),
  txId: z.string().min(1).max(35),
  intrBkSttlmAmt: PositiveAmount,
  currency: Currency,
  intrBkSttlmDt: ISODate.optional(),
  dbtrName: z.string().min(1).max(140),
  dbtrAcctIBAN: IBAN,
  dbtrAgtBIC: BIC,
  cdtrAgtBIC: BIC,
  cdtrName: z.string().min(1).max(140),
  cdtrAcctIBAN: IBAN,
});

export const Pacs009Schema = z.object({
  msgId: z.string().min(1).max(35),
  creDtTm: z.string().datetime({ offset: true }).optional(),
  nbOfTxs: z.number().int().positive().optional(),
  sttlmMtd: SttlmMtd.optional(),
  instrId: z.string().min(1).max(35),
  endToEndId: z.string().min(1).max(35),
  txId: z.string().min(1).max(35),
  intrBkSttlmAmt: PositiveAmount,
  currency: Currency,
  intrBkSttlmDt: ISODate.optional(),
  instgAgtBIC: BIC,
  instdAgtBIC: BIC,
  dbtrAgtBIC: BIC,
  cdtrAgtBIC: BIC,
  cdtrName: z.string().min(1).max(140),
  cdtrAcctIBAN: IBAN,
});

export type MT103Input = z.infer<typeof MT103Schema>;
export type MT202Input = z.infer<typeof MT202Schema>;
export type Pacs008Input = z.infer<typeof Pacs008Schema>;
export type Pacs009Input = z.infer<typeof Pacs009Schema>;
