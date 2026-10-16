// ─── @wikialisa/swift-core ────────────────────────────────────────────────────
// Canonical SWIFT primitives package cho toàn bộ @wikialisa ecosystem.
//
// Thay thế: @wikialisa/swift-adapter, @wikialisa/swift-sdk-internal
// Consumer nên import từ subpath khi có thể để tree-shaking tốt hơn:
//   import { buildMT103 }  from "@wikialisa/swift-core/mt"
//   import { LAUSigner }   from "@wikialisa/swift-core/security"
//   import { MT103Schema } from "@wikialisa/swift-core/schemas"
//   import { generateUETR } from "@wikialisa/swift-core/utils"

// Types — re-export tất cả
export * from "./types/index.js";

// MT (ISO 15022)
export * from "./mt/index.js";

// ISO 20022 MX
export * from "./iso20022/index.js";

// Security
export * from "./security/index.js";

// Zod Schemas
export * from "./schemas/index.js";

// Utils (UETR, validators, formatters, envelope)
export * from "./utils/index.js";

// Event Bus client
export * from "./client/index.js";

// Constants & Errors
export * from "./constants/index.js";
export * from "./errors/index.js";
export * from "./logger/index.js";
