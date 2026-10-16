import https from "node:https";
import http from "node:http";
import { URL } from "node:url";

/**
 * OAuthTokenResponse — result returned by the SWIFT API Gateway token endpoint.
 * Reference: SWIFT Developer Portal → API Gateway → OAuth 2.0 Client Credentials
 */
export interface OAuthTokenResponse {
  access_token: string;
  token_type: "Bearer";
  /** Lifetime in seconds (typically 1800 = 30 min) */
  expires_in: number;
  /** Absolute UTC epoch (ms) computed on receipt */
  expires_at: number;
  scope?: string;
}

/**
 * OAuthClientConfig — all values MUST come from environment variables.
 */
export interface OAuthClientConfig {
  /**
   * SWIFT API Gateway token URL.
   * Sandbox: https://sandbox.swift.com/oauth2/v1/token
   * Production: https://api.swift.com/oauth2/v1/token
   */
  tokenUrl: string;
  /** OAuth2 client_id (issued by SWIFT) */
  clientId: string;
  /** OAuth2 client_secret — treat as a secret, never log */
  clientSecret: string;
  /** Space-separated scopes, e.g. "swift.preval!p swift.gpi.tracker!p" */
  scope?: string;
  /** Optional PEM-encoded certificate for SWIFT mTLS endpoints */
  tlsCert?: string;
  tlsKey?: string;
}

/**
 * SwiftOAuthClient — OAuth 2.0 Client Credentials flow for SWIFT API Gateway.
 * Handles token acquisition and transparent refresh automatically.
 */
export class SwiftOAuthClient {
  private readonly config: OAuthClientConfig;
  private cachedToken: OAuthTokenResponse | null = null;
  private readonly refreshBufferSecs: number;

  constructor(config: OAuthClientConfig, refreshBufferSecs = 60) {
    if (!config.tokenUrl)     throw new Error("[SwiftOAuth] tokenUrl is required");
    if (!config.clientId)     throw new Error("[SwiftOAuth] clientId is required");
    if (!config.clientSecret) throw new Error("[SwiftOAuth] clientSecret is required");
    this.config = config;
    this.refreshBufferSecs = refreshBufferSecs;
  }

  /** Return a valid Bearer access token, fetching a new one if expired or absent. */
  async getAccessToken(): Promise<string> {
    if (this.isTokenValid()) return this.cachedToken!.access_token;
    this.cachedToken = await this.fetchToken();
    return this.cachedToken.access_token;
  }

  /** Force refresh regardless of expiry (use after HTTP 401). */
  async forceRefresh(): Promise<string> {
    this.cachedToken = await this.fetchToken();
    return this.cachedToken.access_token;
  }

  getCachedToken(): OAuthTokenResponse | null { return this.cachedToken; }

  private isTokenValid(): boolean {
    if (!this.cachedToken) return false;
    return Date.now() < this.cachedToken.expires_at - this.refreshBufferSecs * 1000;
  }

  private async fetchToken(): Promise<OAuthTokenResponse> {
    const urlObj = new URL(this.config.tokenUrl);
    const isHttps = urlObj.protocol === "https:";
    const transport = isHttps ? https : http;

    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64");
    const body = new URLSearchParams({ grant_type: "client_credentials" });
    if (this.config.scope) body.set("scope", this.config.scope);
    const bodyStr = body.toString();

    const tlsOptions: https.RequestOptions = {};
    if (isHttps && this.config.tlsCert && this.config.tlsKey) {
      tlsOptions.cert = this.config.tlsCert;
      tlsOptions.key  = this.config.tlsKey;
    }

    const options: https.RequestOptions = {
      ...tlsOptions,
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "Authorization": `Basic ${credentials}`,
        "Content-Length": Buffer.byteLength(bodyStr),
      },
    };

    return new Promise((resolve, reject) => {
      const req = transport.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          if ((res.statusCode ?? 0) >= 400) {
            reject(new Error(`[SwiftOAuth] HTTP ${res.statusCode}: ${raw}`));
            return;
          }
          try {
            const json = JSON.parse(raw) as Omit<OAuthTokenResponse, "expires_at">;
            resolve({ ...json, expires_at: Date.now() + (json.expires_in ?? 1800) * 1000 });
          } catch {
            reject(new Error(`[SwiftOAuth] Failed to parse token response: ${raw}`));
          }
        });
      });
      req.on("error", reject);
      req.write(bodyStr);
      req.end();
    });
  }
}
