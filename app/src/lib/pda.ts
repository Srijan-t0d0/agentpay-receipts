import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";
import idl from "../idl/agentpay_escrow.json";

export const PROGRAM_ID = new PublicKey(idl.address);

export function deriveTaskPda(payer: PublicKey, taskId: number[]) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("task"), payer.toBuffer(), Buffer.from(taskId)],
    PROGRAM_ID,
  )[0];
}
