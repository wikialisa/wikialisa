import crypto from "node:crypto";
import type { LAUSignatureResult } from "../types/messages.js";

/**
 * Local Authentication Algorithm (LAU) signer.
 *
 * Implements HMAC-SHA256 signing per SWIFT LAU v2 specification.
 * Node.js fallback for environments where the vendor JVM JAR is unavailable (CI, tests).
 * In production, delegate to swift-security-sdk-2.17.5-6.jar via JavaBridge.
 */
export class LAUSigner {
  private readonly lauKey: Buffer;

  constructor(lauKeyHex: string) {
    if (!lauKeyHex || lauKeyHex.length < 32) {
      throw new Error("LAU key must be at least 32 hex characters (16 bytes)");
    }
    this.lauKey = /^[0-9a-fA-F]+$/.test(lauKeyHex)
      ? Buffer.from(lauKeyHex, "hex")
      : Buffer.from(lauKeyHex, "utf8");
  }

  /**
   * Signs the given FIN/MX message body.
   * Signed material: `<message><timestamp_iso>` per SWIFT LAU v2 convention.
   */
  public sign(message: string): LAUSignatureResult {
    const timestamp = new Date().toISOString();
    const hmac = crypto.createHmac("sha256", this.lauKey);
    hmac.update(`${message}${timestamp}`, "utf8");
    return { signature: hmac.digest("hex").toUpperCase(), algorithm: "HMAC-SHA256", timestamp };
  }

  /** Verify a previously computed LAU signature (constant-time). */
  public verify(message: string, timestamp: string, signature: string): boolean {
    const hmac = crypto.createHmac("sha256", this.lauKey);
    hmac.update(`${message}${timestamp}`, "utf8");
    const expected = hmac.digest("hex").toUpperCase();
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature.toUpperCase()));
    } catch {
      return false;
    }
  }
}
