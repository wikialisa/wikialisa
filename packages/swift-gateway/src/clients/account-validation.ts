import axios from "axios";
import type { LauHeaderSigner } from "../security/lau-header.js";

export interface AccountValidationResult {
  iban: string;
  bic: string;
  isValid: boolean;
  reason?: string;
}

/**
 * AccountValidationClient — validates beneficiary account IBAN+BIC via SWIFT Pre-Validation API.
 * @see https://developer.swift.com/reference#tag/Pre-Validation
 */
export class AccountValidationClient {
  private readonly gatewayUrl: string;
  private readonly signer: LauHeaderSigner;

  constructor(gatewayUrl: string, signer: LauHeaderSigner) {
    this.gatewayUrl = gatewayUrl.replace(/\/$/, "");
    this.signer = signer;
  }

  async validate(iban: string, bic: string): Promise<AccountValidationResult> {
    const url = `${this.gatewayUrl}/swift/prevalidation/v2/accounts/verification`;
    const body = JSON.stringify({ iban, bic });
    const h = this.signer.buildHeader(body);
    const { data } = await axios.post<AccountValidationResult>(url, { iban, bic }, {
      headers: { "X-SWIFT-Signature": h.signature, "X-SWIFT-Timestamp": h.timestamp, "X-SWIFT-AppId": h.appId, "Content-Type": "application/json", Accept: "application/json" },
    });
    return data;
  }
}
