import axios from "axios";
import type { LauHeaderSigner } from "../security/lau-header.js";

export interface GpiAgentStatus {
  bicfi: string;
  /** ACSP = Accepted/In-flight, ACCC = Completed, RJCT = Rejected */
  trackerStatus: string;
}

export interface GpiPaymentStatus {
  uetr: string;
  status: string;
  lastUpdateDt: string;
  agents: GpiAgentStatus[];
}

/**
 * GpiTrackerClient — queries the SWIFT GPI Tracker API for real-time payment status.
 * @see https://developer.swift.com/reference#tag/GPI-Payments-Tracker
 */
export class GpiTrackerClient {
  private readonly gatewayUrl: string;
  private readonly signer: LauHeaderSigner;

  constructor(gatewayUrl: string, signer: LauHeaderSigner) {
    this.gatewayUrl = gatewayUrl.replace(/\/$/, "");
    this.signer = signer;
  }

  async trackByUetr(uetr: string): Promise<GpiPaymentStatus> {
    const url = `${this.gatewayUrl}/swift/txtracking/v2/transactions/${uetr}`;
    const h = this.signer.buildHeader(uetr);
    const { data } = await axios.get<GpiPaymentStatus>(url, {
      headers: { "X-SWIFT-Signature": h.signature, "X-SWIFT-Timestamp": h.timestamp, "X-SWIFT-AppId": h.appId, Accept: "application/json" },
    });
    return data;
  }
}
