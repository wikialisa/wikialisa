import { describe, it, expect } from "vitest";
import { buildMT202 } from "../src/mt/mt202.js";
import type { SWIFTMT202Payload } from "../src/types/messages.js";

const BASE: SWIFTMT202Payload = {
  senderBIC:                 "AXVNVNVN",
  receiverBIC:               "BARCGB22",
  reference:                 "REF-MT202-001",
  relatedReference:          "REF-MT103-001",
  amount:                    50000,
  currency:                  "USD",
  valueDate:                 "250101",
  accountWithInstitutionBIC: "CITIUS33",
  beneficiaryInstitutionBIC: "DEUTDEFF",
};

describe("buildMT202", () => {
  it("produces a string with correct block headers", () => {
    const msg = buildMT202(BASE);
    expect(msg).toContain("{1:F01");
    expect(msg).toContain("{2:I202");
    expect(msg).toContain("{4:");
    expect(msg).toContain("-}");
  });

  it("embeds sender and receiver BICs padded to 12 chars", () => {
    const msg = buildMT202(BASE);
    expect(msg).toContain("{1:F01AXVNVNVNXXXX");
    expect(msg).toContain("{2:I202BARCGB22XXXX");
  });

  it("includes :20: reference (max 16 chars)", () => {
    const msg = buildMT202(BASE);
    expect(msg).toContain(":20:REF-MT202-001");
  });

  it("includes :21: related reference", () => {
    const msg = buildMT202(BASE);
    expect(msg).toContain(":21:REF-MT103-001");
  });

  it("formats :32A: with value date, currency and comma amount", () => {
    const msg = buildMT202(BASE);
    expect(msg).toContain(":32A:250101USD50000,00");
  });

  it("includes :57A: account with institution BIC", () => {
    const msg = buildMT202(BASE);
    expect(msg).toContain(":57A:CITIUS33");
  });

  it("includes :58A: beneficiary institution BIC", () => {
    const msg = buildMT202(BASE);
    expect(msg).toContain(":58A:DEUTDEFF");
  });

  it("truncates reference to 16 characters", () => {
    const msg = buildMT202({ ...BASE, reference: "TOOLONGREFERENCE123456" });
    expect(msg).toContain(":20:TOOLONGREFERENCE");
  });

  it("truncates relatedReference to 16 characters", () => {
    const msg = buildMT202({ ...BASE, relatedReference: "TOOLONGRELATEDREF123" });
    expect(msg).toContain(":21:TOOLONGRELATEDRE");
  });

  it("uses CRLF line endings", () => {
    const msg = buildMT202(BASE);
    expect(msg).toContain("\r\n");
  });
});
