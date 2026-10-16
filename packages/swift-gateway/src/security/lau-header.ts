import { createHmac } from "node:crypto";

/**
 * LAU header structure attached to outbound SWIFT Alliance Gateway requests.
 */
export interface LauHeader {
  /** HMAC-SHA256 hex signature of the request material */
  signature: string;
  /** ISO 8601 UTC timestamp used in the signed material */
  timestamp: string;
  /** Application/client ID for the SWIFT API */
  appId: string;
}

/**
 * LauHeaderSigner — builds LAU authentication headers for SWIFT API Gateway requests.
 *
 * The signed material is: `<request_body_or_path><timestamp>` per SWIFT LAU v2.
 * Use this for API-level request signing (HTTP header), distinct from FIN/MX message signing.
 */
export class LauHeaderSigner {
  private readonly key: Buffer;
  private readonly appId: string;

  constructor(lauKeyHex: string, appId: string) {
    if (!lauKeyHex || lauKeyHex.length < 32) {
      throw new Error("LAU key must be at least 32 hex characters (16 bytes)");
    }
    this.key = /^[0-9a-fA-F]+$/.test(lauKeyHex)
      ? Buffer.from(lauKeyHex, "hex")
      : Buffer.from(lauKeyHex, "utf8");
    this.appId = appId;
  }

  /**
   * Build a LAU header for an outbound SWIFT API request.
   * @param material - Request path or body to sign (varies by API endpoint)
   */
  buildHeader(material: string): LauHeader {
    const timestamp = new Date().toISOString();
    const hmac = createHmac("sha256", this.key);
    hmac.update(`${material}${timestamp}`, "utf8");
    return { signature: hmac.digest("hex").toUpperCase(), timestamp, appId: this.appId };
  }
}
