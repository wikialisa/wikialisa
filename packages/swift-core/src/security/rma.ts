/**
 * Relationship Management Application (RMA) authorisation registry.
 *
 * Production implementation should query the SWIFTRef RMA database via
 * the swift-security-sdk HTTP endpoint. This module provides a typed
 * in-memory stub for testing and development.
 */
export interface RMARecord {
  /** The BIC that granted authorisation */
  grantor: string;
  /** The BIC authorised to send */
  grantee: string;
  /** Message categories authorised, e.g. ["1", "2", "9"] */
  categories: string[];
  /** Expiry date ISO 8601 */
  expiresAt: string;
  active: boolean;
}

export class RMARegistry {
  private readonly records: RMARecord[];

  constructor(records: RMARecord[] = []) {
    this.records = records;
  }

  /** Check whether `sender` is authorised to send the given category to `receiver`. */
  public isAuthorised(sender: string, receiver: string, category = "1"): boolean {
    const now = new Date().toISOString();
    return this.records.some(
      (r) =>
        r.grantee === sender &&
        r.grantor === receiver &&
        r.categories.includes(category) &&
        r.active &&
        r.expiresAt > now
    );
  }
}
