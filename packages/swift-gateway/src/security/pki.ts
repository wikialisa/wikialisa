import { createHash } from "node:crypto";
import { readFile, readFileSync } from "node:fs";

/** PEM certificate + private key pair loaded from disk */
export interface CertificateBundle {
  cert: string;
  key: string;
}

/**
 * PkiCertificateService — loads SWIFT PKI certificates and computes SHA-256 fingerprints.
 * Used for mutual TLS (mTLS) authentication with SWIFT API endpoints.
 */
export class PkiCertificateService {
  private readonly certPath: string;
  private readonly keyPath: string;

  constructor(certPath: string, keyPath: string) {
    this.certPath = certPath;
    this.keyPath = keyPath;
  }

  /** Read cert and key from disk asynchronously. */
  async loadCertificate(): Promise<CertificateBundle> {
    const [cert, key] = await Promise.all([
      readFile(this.certPath, "utf8"),
      readFile(this.keyPath, "utf8"),
    ]);
    return { cert, key };
  }

  /**
   * Compute SHA-256 fingerprint of the certificate in `AA:BB:CC:…` format,
   * matching `openssl x509 -fingerprint -sha256` output.
   */
  async getFingerprint(): Promise<string> {
    const pem = await readFile(this.certPath, "utf8");
    const derBase64 = pem
      .replace(/-----BEGIN CERTIFICATE-----/g, "")
      .replace(/-----END CERTIFICATE-----/g, "")
      .replace(/\s+/g, "");
    const der = Buffer.from(derBase64, "base64");
    const hash = createHash("sha256").update(der).digest("hex").toUpperCase();
    return (hash.match(/.{2}/g) ?? []).join(":");
  }
}
