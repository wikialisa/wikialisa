import { describe, it, expect } from "vitest";
import {
  generateUETR,
  isValidUETR,
  formatUETR,
  formatSWIFTAmount,
  parseSWIFTAmount,
  toSWIFTDate,
  toISO8601,
} from "../src/utils/index.js";

// ─── UETR ─────────────────────────────────────────────────────────────────────

describe("generateUETR", () => {
  it("returns a lowercase hyphenated UUID v4", () => {
    const uetr = generateUETR();
    expect(isValidUETR(uetr)).toBe(true);
  });

  it("generates unique values on each call", () => {
    const a = generateUETR();
    const b = generateUETR();
    expect(a).not.toBe(b);
  });
});

describe("isValidUETR", () => {
  it("validates a proper UUID v4", () => {
    // Both have '4' at position 14 — valid v4 UUIDs
    expect(isValidUETR("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isValidUETR("550e8400-e29b-4000-a716-446655440000")).toBe(true);
  });

  it("rejects UUID v1", () => {
    expect(isValidUETR("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toBe(false);
  });

  it("rejects non-uuid strings", () => {
    expect(isValidUETR("not-a-uuid")).toBe(false);
    expect(isValidUETR("")).toBe(false);
  });

  it("is case-insensitive", () => {
    const upper = "550E8400-E29B-4000-A716-446655440000";
    expect(isValidUETR(upper)).toBe(true);
  });
});

describe("formatUETR", () => {
  it("lowercases and returns valid UETR", () => {
    const raw = "550E8400-E29B-4000-A716-446655440000";
    const result = formatUETR(raw);
    expect(result).toBe(raw.toLowerCase());
    expect(isValidUETR(result)).toBe(true);
  });

  it("throws on invalid UETR", () => {
    expect(() => formatUETR("invalid")).toThrow('Invalid UETR: "invalid"');
  });
});

// ─── Amount formatting ────────────────────────────────────────────────────────

describe("formatSWIFTAmount", () => {
  it("formats with comma decimal separator", () => {
    expect(formatSWIFTAmount(1500.5)).toBe("1500,50");
    expect(formatSWIFTAmount(1000)).toBe("1000,00");
    expect(formatSWIFTAmount(0.01)).toBe("0,01");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatSWIFTAmount(1.999)).toBe("2,00");
    expect(formatSWIFTAmount(1.994)).toBe("1,99");
  });
});

describe("parseSWIFTAmount", () => {
  it("parses comma decimal to number", () => {
    expect(parseSWIFTAmount("1500,50")).toBe(1500.5);
    expect(parseSWIFTAmount("1000,00")).toBe(1000);
  });

  it("is inverse of formatSWIFTAmount", () => {
    const original = 12345.67;
    expect(parseSWIFTAmount(formatSWIFTAmount(original))).toBeCloseTo(original);
  });
});

// ─── Date formatting ──────────────────────────────────────────────────────────

describe("toSWIFTDate", () => {
  it("returns 6-char YYMMDD string", () => {
    const result = toSWIFTDate(new Date("2025-01-15T00:00:00Z"));
    expect(result).toBe("250115");
    expect(result).toHaveLength(6);
  });

  it("uses current date when no argument given", () => {
    const result = toSWIFTDate();
    expect(result).toMatch(/^\d{6}$/);
  });
});

describe("toISO8601", () => {
  it("returns a valid ISO 8601 string", () => {
    const result = toISO8601(new Date("2025-06-01T12:00:00Z"));
    expect(result).toBe("2025-06-01T12:00:00.000Z");
  });

  it("uses current time when no argument given", () => {
    const before = Date.now();
    const result = toISO8601();
    const after = Date.now();
    const ts = new Date(result).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});
