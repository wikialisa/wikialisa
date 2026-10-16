"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Connection: () => import_web3.Connection,
  PublicKey: () => import_web3.PublicKey,
  anchor: () => anchor,
  clusterApiUrl: () => import_web3.clusterApiUrl,
  createAnchorProvider: () => createAnchorProvider,
  createEvmClient: () => createEvmClient,
  loadProgram: () => loadProgram
});
module.exports = __toCommonJS(index_exports);
var anchor = __toESM(require("@coral-xyz/anchor"));
var import_web3 = require("@solana/web3.js");
var import_viem = require("viem");
function createAnchorProvider(endpoint, wallet, opts) {
  const connection = new import_web3.Connection(endpoint, opts?.commitment ?? "confirmed");
  return new anchor.AnchorProvider(connection, wallet, opts ?? {});
}
function loadProgram(idl, programId, provider) {
  anchor.setProvider(provider);
  return new anchor.Program(idl, provider);
}
function createEvmClient(rpcUrl, chain) {
  return (0, import_viem.createPublicClient)({ chain, transport: (0, import_viem.http)(rpcUrl) });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Connection,
  PublicKey,
  anchor,
  clusterApiUrl,
  createAnchorProvider,
  createEvmClient,
  loadProgram
});
