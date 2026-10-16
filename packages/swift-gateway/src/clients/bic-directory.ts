import axios from "axios";
import type { LauHeaderSigner } from "../security/lau-header.js";

export interface BicRecord {
  bic: string;
  institutionName: string;
  country: string;
  city: string;
  address: string;
}

/**
 * BicDirectoryClient — resolves institution details from the SWIFT BIC Directory.
 * @see https://developer.swift.com/reference#tag/BIC-Directory
 */
export class BicDirectoryClient {
  private readonly gatewayUrl: string;
  private readonly signer: LauHeaderSigner;

  constructor(gatewayUrl: string, signer: LauHeaderSigner) {
    this.gatewayUrl = gatewayUrl.replace(/\/$/, "");
    this.signer = signer;
  }

  async lookup(bic: string): Promise<BicRecord> {
    const url = `${this.gatewayUrl}/swift/bicdirectory/v1/biccodes/${encodeURIComponent(bic)}`;
    const h = this.signer.buildHeader(bic);
    const { data } = await axios.get<BicRecord>(url, {
      headers: { "X-SWIFT-Signature": h.signature, "X-SWIFT-Timestamp": h.timestamp, "X-SWIFT-AppId": h.appId, Accept: "application/json" },
    });
    return data;
  }
}
