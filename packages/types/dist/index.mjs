// src/index.ts
var JSON_RPC_ERRORS = {
  PARSE_ERROR: { code: -32700, message: "Parse error" },
  INVALID_REQUEST: { code: -32600, message: "Invalid Request" },
  METHOD_NOT_FOUND: { code: -32601, message: "Method not found" },
  INVALID_PARAMS: { code: -32602, message: "Invalid params" },
  INTERNAL_ERROR: { code: -32603, message: "Internal error" },
  // App-level server errors: -32000 to -32099
  UNAUTHORIZED: { code: -32001, message: "Unauthorized" },
  RATE_LIMITED: { code: -32002, message: "Rate limit exceeded" },
  CHAIN_ERROR: { code: -32010, message: "Blockchain error" }
};
export {
  JSON_RPC_ERRORS
};
