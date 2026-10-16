export interface SWIFTLogger {
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, err?: Error, meta?: Record<string, unknown>): void;
  debug(msg: string, meta?: Record<string, unknown>): void;
}

/**
 * Create a minimal JSON-structured logger for a SWIFT service.
 * In production, replace with pino or winston.
 */
export function createSWIFTLogger(service: string): SWIFTLogger {
  const ts = () => new Date().toISOString();
  return {
    info: (msg, meta) => console.info(JSON.stringify({ level: "info", service, ts: ts(), msg, ...meta })),
    warn: (msg, meta) => console.warn(JSON.stringify({ level: "warn", service, ts: ts(), msg, ...meta })),
    error: (msg, err, meta) => console.error(JSON.stringify({ level: "error", service, ts: ts(), msg, error: err ? { name: err.name, message: err.message } : undefined, ...meta })),
    debug: (msg, meta) => { if (process.env["LOG_LEVEL"] === "debug") console.debug(JSON.stringify({ level: "debug", service, ts: ts(), msg, ...meta })); },
  };
}
