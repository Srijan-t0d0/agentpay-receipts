import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "../idl/agentpay_escrow.json";
import { CLUSTER, RPC_ENDPOINT } from "./solana";

export const PROGRAM_ID = new PublicKey(idl.address);

type WalletLike = {
  publicKey: PublicKey | null;
  signTransaction?: anchor.Wallet["signTransaction"];
  signAllTransactions?: anchor.Wallet["signAllTransactions"];
};

export function getConnection() {
  return new Connection(RPC_ENDPOINT, "confirmed");
}

export function getProgram(wallet: WalletLike) {
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error("Connect a wallet before sending onchain transactions.");
  }

  const provider = new anchor.AnchorProvider(
    getConnection(),
    {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    },
    { commitment: "confirmed" },
  );

  return new Program(idl as anchor.Idl, provider) as Program;
}

export function deriveTaskPda(payer: PublicKey, taskId: number[]) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("task"), payer.toBuffer(), Buffer.from(taskId)],
    PROGRAM_ID,
  )[0];
}

export async function createTaskOnchain(params: {
  wallet: WalletLike;
  taskId: number[];
  taskHash: number[];
  agentWallet: string;
  amountLamports: anchor.BN;
}) {
  const program = getProgram(params.wallet);
  const payer = params.wallet.publicKey!;
  const taskEscrow = deriveTaskPda(payer, params.taskId);
  const tx = await program.methods
    .createTask(params.taskId, params.taskHash, new PublicKey(params.agentWallet), params.amountLamports)
    .accounts({
      payer,
      taskEscrow,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { tx, taskEscrow: taskEscrow.toBase58(), programId: PROGRAM_ID.toBase58(), cluster: CLUSTER };
}

export async function fundTaskOnchain(wallet: WalletLike, taskEscrow: string) {
  const program = getProgram(wallet);
  return program.methods
    .fundTask()
    .accounts({
      payer: wallet.publicKey!,
      taskEscrow: new PublicKey(taskEscrow),
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function approveTaskOnchain(wallet: WalletLike, taskEscrow: string, deliverableHash: number[]) {
  const program = getProgram(wallet);
  return program.methods
    .approveTask(deliverableHash)
    .accounts({
      payer: wallet.publicKey!,
      taskEscrow: new PublicKey(taskEscrow),
    })
    .rpc();
}

export async function releasePaymentOnchain(wallet: WalletLike, taskEscrow: string, agentWallet: string, receiptHash: number[]) {
  const program = getProgram(wallet);
  return program.methods
    .releasePayment(receiptHash)
    .accounts({
      payer: wallet.publicKey!,
      taskEscrow: new PublicKey(taskEscrow),
      agent: new PublicKey(agentWallet),
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}
