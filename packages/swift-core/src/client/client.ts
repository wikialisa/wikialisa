import type { Redis as RedisType } from "ioredis";

/**
 * AXVNSwiftClient — Event Bus producer for AXQ SWIFT domain.
 *
 * Services import this class to push SWIFT message requests into
 * Redis Stream `vnkr:swift:outbound` without direct HTTP calls
 * to the swift-gateway. Pattern: Fire-and-Forget with ACK via inbound stream.
 */
export class AXVNSwiftClient {
  private readonly redis: RedisType;
  private readonly outboundStream: string;

  constructor(redis: RedisType, options?: { outboundStream?: string }) {
    this.redis = redis;
    this.outboundStream = options?.outboundStream ?? "vnkr:swift:outbound";
  }

  private async xadd(event: string, data: unknown, traceId?: string): Promise<string> {
    return (this.redis as unknown as {
      xadd(...args: unknown[]): Promise<string>;
    }).xadd(
      this.outboundStream, "*",
      "event", event,
      "data", JSON.stringify(data),
      "traceId", traceId ?? `trace-${Date.now()}`
    );
  }

  async requestMT103(
    payload: { senderBIC: string; receiverBIC: string; reference: string; amount: number; currency: string; orderingAccount: string; orderingName: string; beneficiaryAccount: string; beneficiaryName: string; chargesCode?: "SHA" | "OUR" | "BEN"; valueDate?: string },
    traceId?: string
  ): Promise<{ success: true; streamId: string; reference: string }> {
    const streamId = await this.xadd("SWIFT_MT103_REQUESTED", payload, traceId);
    return { success: true, streamId, reference: payload.reference };
  }

  async requestMT202(
    payload: { senderBIC: string; receiverBIC: string; reference: string; relatedReference: string; amount: number; currency: string; valueDate?: string; accountWithInstitutionBIC: string; beneficiaryInstitutionBIC: string },
    traceId?: string
  ): Promise<{ success: true; streamId: string; reference: string }> {
    const streamId = await this.xadd("SWIFT_MT202_REQUESTED", payload, traceId);
    return { success: true, streamId, reference: payload.reference };
  }

  async requestPacs008(
    payload: { msgId: string; instrId: string; endToEndId: string; txId: string; intrBkSttlmAmt: number; currency: string; dbtrName: string; dbtrAcctIBAN: string; dbtrAgtBIC: string; cdtrAgtBIC: string; cdtrName: string; cdtrAcctIBAN: string; creDtTm?: string; intrBkSttlmDt?: string },
    traceId?: string
  ): Promise<{ success: true; streamId: string; msgId: string }> {
    const streamId = await this.xadd("SWIFT_PACS008_REQUESTED", payload, traceId);
    return { success: true, streamId, msgId: payload.msgId };
  }

  async requestPacs009(
    payload: { msgId: string; instrId: string; endToEndId: string; txId: string; intrBkSttlmAmt: number; currency: string; instgAgtBIC: string; instdAgtBIC: string; dbtrAgtBIC: string; cdtrAgtBIC: string; cdtrName: string; cdtrAcctIBAN: string; creDtTm?: string; intrBkSttlmDt?: string },
    traceId?: string
  ): Promise<{ success: true; streamId: string; msgId: string }> {
    const streamId = await this.xadd("SWIFT_PACS009_REQUESTED", payload, traceId);
    return { success: true, streamId, msgId: payload.msgId };
  }

  /**
   * Subscribe to the inbound ACK stream (consumer group pattern).
   * Returns a stop() function to terminate the polling loop.
   */
  async subscribeInbound(
    onEvent: (type: string, payload: Record<string, unknown>) => Promise<void>,
    options?: { group?: string; consumer?: string; stream?: string }
  ): Promise<() => void> {
    const stream = options?.stream ?? "vnkr:swift:inbound";
    const group = options?.group ?? "swift-client-sub";
    const consumer = options?.consumer ?? `sub-${Date.now()}`;
    const r = this.redis as unknown as { xgroup(...a: unknown[]): Promise<unknown>; xreadgroup(...a: unknown[]): Promise<unknown>; xack(...a: unknown[]): Promise<unknown> };

    try {
      await r.xgroup("CREATE", stream, group, "0", "MKSTREAM");
    } catch { /* BUSYGROUP — OK */ }

    let active = true;

    (async () => {
      while (active) {
        const res = await r.xreadgroup("GROUP", group, consumer, "BLOCK", 2000, "COUNT", 5, "STREAMS", stream, ">") as Array<[string, Array<[string, string[]]>]> | null;
        if (!res) continue;
        for (const [, msgs] of res) {
          for (const [id, raw] of msgs) {
            const f: Record<string, string> = {};
            for (let i = 0; i < raw.length - 1; i += 2) f[raw[i]!] = raw[i + 1]!;
            try { await onEvent(f["type"] ?? "", JSON.parse(f["payload"] ?? "{}")); }
            finally { await r.xack(stream, group, id); }
          }
        }
      }
    })().catch(console.error);

    return () => { active = false; };
  }
}
