/** Base error for all @wikialisa/swift-core errors */
export class SWIFTCoreError extends Error {
  readonly code: string;
  readonly details: Record<string, unknown> | undefined;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "SWIFTCoreError";
    this.code = code;
    this.details = details ?? undefined;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Thrown when a payload or field fails Zod/SWIFT validation */
export class ValidationError extends SWIFTCoreError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

/** Thrown when LAU HMAC signing fails */
export class SigningError extends SWIFTCoreError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "SIGNING_ERROR", details);
    this.name = "SigningError";
  }
}

/** Thrown when SWIFT SDK config is missing or invalid */
export class ConfigError extends SWIFTCoreError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "CONFIG_ERROR", details);
    this.name = "ConfigError";
  }
}

/** Thrown when a Java bridge (JAR spawn) operation fails */
export class JavaBridgeError extends SWIFTCoreError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "JAVA_BRIDGE_ERROR", details);
    this.name = "JavaBridgeError";
  }
}

/** Thrown when the Redis event bus publish/subscribe fails */
export class EventBusError extends SWIFTCoreError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "EVENT_BUS_ERROR", details);
    this.name = "EventBusError";
  }
}
