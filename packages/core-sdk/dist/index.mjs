// src/index.ts
import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { createPublicClient, http } from "viem";
function createAnchorProvider(endpoint, wallet, opts) {
  const connection = new Connection(endpoint, opts?.commitment ?? "confirmed");
  return new anchor.AnchorProvider(connection, wallet, opts ?? {});
}
function loadProgram(idl, programId, provider) {
  anchor.setProvider(provider);
  return new anchor.Program(idl, provider);
}
function createEvmClient(rpcUrl, chain) {
  return createPublicClient({ chain, transport: http(rpcUrl) });
}
export {
  Connection,
  PublicKey,
  anchor,
  clusterApiUrl,
  createAnchorProvider,
  createEvmClient,
  loadProgram
};
