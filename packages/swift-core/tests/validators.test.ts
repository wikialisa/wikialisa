import { describe, it, expect } from "vitest";
import {
  isBIC,
  normaliseBIC,
  isIBAN,
  normaliseIBAN,
  isCurrencyCode,
  isValidAmount,
} from "../src/security/validators.js";

// ─── BIC ─────────────────────────────────────────────────────────────────────

describe("isBIC", () => {
  it("accepts valid BIC-8", () => {
    expect(isBIC("BARCGB22")).toBe(true);
    expect(isBIC("AXVNVNVN")).toBe(true);
    expect(isBIC("DEUTDEFF")).toBe(true);
  });

  it("accepts valid BIC-11", () => {
    expect(isBIC("BARCGB22XXX")).toBe(true);
    expect(isBIC("CITIUS33MIA")).toBe(true);
  });

  it("accepts lowercase (case-insensitive)", () => {
    expect(isBIC("barcgb22")).toBe(true);
  });

  it("rejects BIC shorter than 8", () => {
    expect(isBIC("BARC")).toBe(false);
  });

  it("rejects BIC of length 9 or 10", () => {
    expect(isBIC("BARCGB22X")).toBe(false);
    expect(isBIC("BARCGB22XX")).toBe(false);
  });

  it("rejects BIC longer than 11", () => {
    expect(isBIC("BARCGB22XXXXX")).toBe(false);
  });

  it("rejects BIC with invalid chars", () => {
    expect(isBIC("BARC-B22")).toBe(false);
    expect(isBIC("1ARCGB22")).toBe(false);
  });
});

describe("normaliseBIC", () => {
  it("pads BIC-8 to BIC-11 with XXX", () => {
    expect(normaliseBIC("BARCGB22")).toBe("BARCGB22XXX");
  });

  it("leaves BIC-11 unchanged", () => {
    expect(normaliseBIC("BARCGB22XXX")).toBe("BARCGB22XXX");
  });

  it("uppercases input", () => {
    expect(normaliseBIC("barcgb22")).toBe("BARCGB22XXX");
  });

  it("throws on invalid BIC", () => {
    expect(() => normaliseBIC("INVALID")).toThrow('Invalid BIC: "INVALID"');
  });
});

// ─── IBAN ─────────────────────────────────────────────────────────────────────

describe("isIBAN", () => {
  it("validates a correct GB IBAN", () => {
    expect(isIBAN("GB29NWBK60161331926819")).toBe(true);
  });

  it("validates a correct DE IBAN", () => {
    expect(isIBAN("DE89370400440532013000")).toBe(true);
  });

  it("accepts spaces (stripped internally)", () => {
    expect(isIBAN("GB29 NWBK 6016 1331 9268 19")).toBe(true);
  });

  it("rejects too-short string", () => {
    expect(isIBAN("GB29NWBK")).toBe(false);
  });

  it("rejects string with invalid MOD-97", () => {
    expect(isIBAN("GB00NWBK60161331926819")).toBe(false);
  });

  it("rejects non-alpha country code", () => {
    expect(isIBAN("1234567890123456")).toBe(false);
  });
});

describe("normaliseIBAN", () => {
  it("strips spaces and uppercases", () => {
    expect(normaliseIBAN("gb29 nwbk 6016 1331 9268 19")).toBe("GB29NWBK60161331926819");
  });

  it("throws on invalid IBAN", () => {
    expect(() => normaliseIBAN("INVALID")).toThrow('Invalid IBAN: "INVALID"');
  });
});

// ─── Currency code & amount ───────────────────────────────────────────────────

describe("isCurrencyCode", () => {
  it("accepts valid ISO 4217 codes", () => {
    expect(isCurrencyCode("USD")).toBe(true);
    expect(isCurrencyCode("VND")).toBe(true);
    expect(isCurrencyCode("EUR")).toBe(true);
  });

  it("rejects lowercase", () => expect(isCurrencyCode("usd")).toBe(false));
  it("rejects 2-char code", () => expect(isCurrencyCode("US")).toBe(false));
  it("rejects 4-char code", () => expect(isCurrencyCode("USDD")).toBe(false));
});

describe("isValidAmount", () => {
  it("accepts integer amounts", () => expect(isValidAmount("1000")).toBe(true));
  it("accepts decimal with dot", () => expect(isValidAmount("1500.50")).toBe(true));
  it("accepts decimal with comma", () => expect(isValidAmount("1500,50")).toBe(true));
  it("rejects zero", () => expect(isValidAmount("0")).toBe(false));
  it("rejects negative", () => expect(isValidAmount("-100")).toBe(false));
  it("rejects non-numeric", () => expect(isValidAmount("abc")).toBe(false));
  it("rejects empty string", () => expect(isValidAmount("")).toBe(false));
});
