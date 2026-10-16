import { describe, it, expect } from "vitest";
import { buildMT103 } from "../src/mt/mt103.js";
import type { SWIFTMT103Payload } from "../src/types/messages.js";

const BASE: SWIFTMT103Payload = {
  senderBIC:          "AXVNVNVN",
  receiverBIC:        "BARCGB22",
  reference:          "REF-20250101-001",
  amount:             1500.50,
  currency:           "USD",
  orderingAccount:    "0123456789",
  orderingName:       "NGUYEN VAN A",
  beneficiaryAccount: "GB29NWBK60161331926819",
  beneficiaryName:    "JOHN DOE",
  chargesCode:        "SHA",
  valueDate:          "250101",
};

describe("buildMT103", () => {
  it("produces a string with correct block headers", () => {
    const msg = buildMT103(BASE);
    expect(msg).toContain("{1:F01");
    expect(msg).toContain("{2:I103");
    expect(msg).toContain("{4:");
    expect(msg).toContain("-}");
  });

  it("embeds sender BIC padded to 12 chars in block 1", () => {
    const msg = buildMT103(BASE);
    // AXVNVNVN (8 chars) → padded to 12 → AXVNVNVNXXXX
    expect(msg).toContain("{1:F01AXVNVNVNXXXX");
  });

  it("embeds receiver BIC padded to 12 chars in block 2", () => {
    const msg = buildMT103(BASE);
    expect(msg).toContain("{2:I103BARCGB22XXXX");
  });

  it("truncates reference to 16 characters in :20: field", () => {
    const msg = buildMT103({ ...BASE, reference: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" });
    expect(msg).toContain(":20:ABCDEFGHIJKLMNOP");
  });

  it("formats amount with comma decimal in :32A:", () => {
    const msg = buildMT103(BASE);
    expect(msg).toContain(":32A:250101USD1500,50");
  });

  it("includes ordering account in :50K:", () => {
    const msg = buildMT103(BASE);
    expect(msg).toContain(":50K:/0123456789");
  });

  it("includes beneficiary account in :59:", () => {
    const msg = buildMT103(BASE);
    expect(msg).toContain(":59:/GB29NWBK60161331926819");
  });

  it("includes charges code in :71A:", () => {
    const msg = buildMT103(BASE);
    expect(msg).toContain(":71A:SHA");
  });

  it("defaults chargesCode to SHA when not provided", () => {
    const { chargesCode, ...rest } = BASE;
    const msg = buildMT103(rest as SWIFTMT103Payload);
    expect(msg).toContain(":71A:SHA");
  });

  it("uses OUR charges code when specified", () => {
    const msg = buildMT103({ ...BASE, chargesCode: "OUR" });
    expect(msg).toContain(":71A:OUR");
  });

  it("truncates orderingName to 35 characters", () => {
    const longName = "A".repeat(50);
    const msg = buildMT103({ ...BASE, orderingName: longName });
    expect(msg).toContain("A".repeat(35));
    expect(msg).not.toContain("A".repeat(36));
  });

  it("truncates beneficiaryName to 35 characters", () => {
    const longName = "B".repeat(50);
    const msg = buildMT103({ ...BASE, beneficiaryName: longName });
    expect(msg).toContain("B".repeat(35));
    expect(msg).not.toContain("B".repeat(36));
  });

  it("uses CRLF line endings between fields", () => {
    const msg = buildMT103(BASE);
    expect(msg).toContain("\r\n");
  });

  it("uses provided valueDate instead of today", () => {
    const msg = buildMT103({ ...BASE, valueDate: "251231" });
    expect(msg).toContain(":32A:251231USD");
  });

  it("handles zero-decimal amounts correctly", () => {
    const msg = buildMT103({ ...BASE, amount: 1000 });
    expect(msg).toContain("1000,00");
  });
});
