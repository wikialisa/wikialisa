import { describe, it, expect } from "vitest";
import { LAUSigner } from "../src/security/lau.js";

// 32-char hex key (16 bytes) — safe for tests
const TEST_KEY_HEX = "0102030405060708090a0b0c0d0e0f10";
// 32-char UTF-8 key
const TEST_KEY_UTF8 = "my-test-lau-key-at-least-32chars!";

const SAMPLE_MESSAGE = "{1:F01AXVNVNVN00000000000}{2:I103BARCGB22XXXXN}{4:\r\n:20:TEST-REF\r\n-}";

describe("LAUSigner — constructor", () => {
  it("accepts a valid 32+ hex key", () => {
    expect(() => new LAUSigner(TEST_KEY_HEX)).not.toThrow();
  });

  it("accepts a valid UTF-8 key (>= 32 chars)", () => {
    expect(() => new LAUSigner(TEST_KEY_UTF8)).not.toThrow();
  });

  it("throws when key is too short (< 32 chars)", () => {
    expect(() => new LAUSigner("tooshort")).toThrow("LAU key must be at least 32 hex characters");
  });

  it("throws when key is empty", () => {
    expect(() => new LAUSigner("")).toThrow();
  });
});

describe("LAUSigner — sign()", () => {
  const signer = new LAUSigner(TEST_KEY_HEX);

  it("returns a result with signature, algorithm, and timestamp", () => {
    const result = signer.sign(SAMPLE_MESSAGE);
    expect(result).toHaveProperty("signature");
    expect(result).toHaveProperty("algorithm", "HMAC-SHA256");
    expect(result).toHaveProperty("timestamp");
  });

  it("signature is an uppercase hex string", () => {
    const { signature } = signer.sign(SAMPLE_MESSAGE);
    expect(signature).toMatch(/^[0-9A-F]{64}$/);
  });

  it("timestamp is a valid ISO 8601 string", () => {
    const { timestamp } = signer.sign(SAMPLE_MESSAGE);
    expect(() => new Date(timestamp)).not.toThrow();
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });

  it("produces different signatures for different messages", () => {
    const r1 = signer.sign("message-one");
    const r2 = signer.sign("message-two");
    expect(r1.signature).not.toBe(r2.signature);
  });

  it("produces different signatures on repeated calls (different timestamp)", async () => {
    const r1 = signer.sign(SAMPLE_MESSAGE);
    await new Promise((r) => setTimeout(r, 10));
    const r2 = signer.sign(SAMPLE_MESSAGE);
    // Timestamps will differ → signatures differ
    if (r1.timestamp !== r2.timestamp) {
      expect(r1.signature).not.toBe(r2.signature);
    }
  });
});

describe("LAUSigner — verify()", () => {
  const signer = new LAUSigner(TEST_KEY_HEX);

  it("verifies a freshly signed message correctly", () => {
    const { signature, timestamp } = signer.sign(SAMPLE_MESSAGE);
    expect(signer.verify(SAMPLE_MESSAGE, timestamp, signature)).toBe(true);
  });

  it("rejects tampered message", () => {
    const { signature, timestamp } = signer.sign(SAMPLE_MESSAGE);
    expect(signer.verify("tampered-message", timestamp, signature)).toBe(false);
  });

  it("rejects wrong timestamp", () => {
    const { signature } = signer.sign(SAMPLE_MESSAGE);
    expect(signer.verify(SAMPLE_MESSAGE, "2000-01-01T00:00:00.000Z", signature)).toBe(false);
  });

  it("rejects corrupted signature", () => {
    const { timestamp } = signer.sign(SAMPLE_MESSAGE);
    expect(signer.verify(SAMPLE_MESSAGE, timestamp, "A".repeat(64))).toBe(false);
  });

  it("is case-insensitive for signature input", () => {
    const { signature, timestamp } = signer.sign(SAMPLE_MESSAGE);
    expect(signer.verify(SAMPLE_MESSAGE, timestamp, signature.toLowerCase())).toBe(true);
  });

  it("a signer with different key cannot verify", () => {
    const other = new LAUSigner("ffffffffffffffffffffffffffffffff");
    const { signature, timestamp } = signer.sign(SAMPLE_MESSAGE);
    expect(other.verify(SAMPLE_MESSAGE, timestamp, signature)).toBe(false);
  });
});
