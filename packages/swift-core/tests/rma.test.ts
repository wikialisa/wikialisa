import { describe, it, expect, beforeEach } from "vitest";
import { RMARegistry } from "../src/security/rma.js";
import type { RMARecord } from "../src/security/rma.js";

const FUTURE = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
const PAST   = new Date(Date.now() -       24 * 60 * 60 * 1000).toISOString();

const RECORDS: RMARecord[] = [
  { grantor: "BARCGB22XXX", grantee: "AXVNVNVNXXX", categories: ["1", "2"], expiresAt: FUTURE, active: true  },
  { grantor: "DEUTDEFFXXX", grantee: "AXVNVNVNXXX", categories: ["2"],       expiresAt: FUTURE, active: true  },
  { grantor: "CITIUS33XXX", grantee: "AXVNVNVNXXX", categories: ["1"],       expiresAt: PAST,   active: true  }, // expired
  { grantor: "BNPAFRPPXXX", grantee: "AXVNVNVNXXX", categories: ["1"],       expiresAt: FUTURE, active: false }, // inactive
];

describe("RMARegistry — constructor", () => {
  it("creates an empty registry when no records passed", () => {
    const reg = new RMARegistry();
    expect(reg.isAuthorised("ANYBANK", "ANYBANK2")).toBe(false);
  });
});

describe("RMARegistry — isAuthorised()", () => {
  let reg: RMARegistry;

  beforeEach(() => {
    reg = new RMARegistry(RECORDS);
  });

  it("returns true for authorised sender/receiver/category combo", () => {
    expect(reg.isAuthorised("AXVNVNVNXXX", "BARCGB22XXX", "1")).toBe(true);
  });

  it("returns true for category 2 with BARCLAYS as grantor", () => {
    expect(reg.isAuthorised("AXVNVNVNXXX", "BARCGB22XXX", "2")).toBe(true);
  });

  it("defaults category to '1' when not specified", () => {
    expect(reg.isAuthorised("AXVNVNVNXXX", "BARCGB22XXX")).toBe(true);
  });

  it("returns false when category not in authorised list", () => {
    // DEUTDEFF only authorises category 2, not 1
    expect(reg.isAuthorised("AXVNVNVNXXX", "DEUTDEFFXXX", "1")).toBe(false);
  });

  it("returns false for expired record", () => {
    expect(reg.isAuthorised("AXVNVNVNXXX", "CITIUS33XXX", "1")).toBe(false);
  });

  it("returns false for inactive record", () => {
    expect(reg.isAuthorised("AXVNVNVNXXX", "BNPAFRPPXXX", "1")).toBe(false);
  });

  it("returns false when sender and receiver are swapped", () => {
    // Record has grantor=BARCGB22XXX, grantee=AXVNVNVNXXX
    // Swapping them should fail
    expect(reg.isAuthorised("BARCGB22XXX", "AXVNVNVNXXX", "1")).toBe(false);
  });

  it("returns false for unknown BICs", () => {
    expect(reg.isAuthorised("UNKNOWN1XXX", "UNKNOWN2XXX", "1")).toBe(false);
  });

  it("returns false for category 9 (not authorised by any record)", () => {
    expect(reg.isAuthorised("AXVNVNVNXXX", "BARCGB22XXX", "9")).toBe(false);
  });
});
