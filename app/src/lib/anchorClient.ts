import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "../idl/agentpay_escrow.json";
import { prefixedHash } from "./ids";
import { deriveTaskPda as deriveTaskPdaHelper, PROGRAM_ID } from "./pda";
import { CLUSTER, RPC_ENDPOINT } from "./solana";

type WalletLike = {
  publicKey: PublicKey | null;
  signTransaction?: anchor.Wallet["signTransaction"];
  signAllTransactions?: anchor.Wallet["signAllTransactions"];
};

type TaskEscrowRaw = {
  payer: PublicKey;
  agent: PublicKey;
  taskId: number[];
  taskHash: number[];
  deliverableHash: number[];
  receiptHash: number[];
  amountLamports: anchor.BN;
  status: unknown;
  createdAt: anchor.BN;
  fundedAt: anchor.BN;
  approvedAt: anchor.BN;
  paidAt: anchor.BN;
};

type ReadableTaskProgram = Program & {
  account: Program["account"] & {
    taskEscrow: {
      fetch(address: PublicKey): Promise<TaskEscrowRaw>;
    };
  };
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
  return deriveTaskPdaHelper(payer, taskId);
}

export type OnchainTaskEscrow = {
  payer: string;
  agent: string;
  taskId: number[];
  taskHash: string;
  deliverableHash?: string;
  receiptHash?: string;
  amountLamports: string;
  status: string;
  createdAt: string;
  fundedAt: string;
  approvedAt: string;
  paidAt: string;
};

const zeroHash = "0".repeat(64);

function statusName(status: unknown) {
  if (typeof status === "object" && status) {
    const [key] = Object.keys(status as Record<string, unknown>);
    return key ?? "unknown";
  }
  return String(status ?? "unknown");
}

function accountProgram(): ReadableTaskProgram {
  const readOnlyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => {
      throw new Error("Read-only Anchor client cannot sign transactions.");
    },
    signAllTransactions: async () => {
      throw new Error("Read-only Anchor client cannot sign transactions.");
    },
  };
  const provider = new anchor.AnchorProvider(getConnection(), readOnlyWallet, { commitment: "confirmed" });
  return new Program(idl as anchor.Idl, provider) as unknown as ReadableTaskProgram;
}

export async function fetchTaskEscrowAccount(taskEscrowPda?: string): Promise<OnchainTaskEscrow | null> {
  if (!taskEscrowPda) return null;

  try {
    const account = await accountProgram().account.taskEscrow.fetch(new PublicKey(taskEscrowPda));
    const deliverableHash = prefixedHash("dlv_", Array.from(account.deliverableHash as number[]));
    const receiptHash = prefixedHash("rcpt_", Array.from(account.receiptHash as number[]));

    return {
      payer: account.payer.toBase58(),
      agent: account.agent.toBase58(),
      taskId: Array.from(account.taskId as number[]),
      taskHash: prefixedHash("task_", Array.from(account.taskHash as number[])),
      deliverableHash: deliverableHash.endsWith(zeroHash) ? undefined : deliverableHash,
      receiptHash: receiptHash.endsWith(zeroHash) ? undefined : receiptHash,
      amountLamports: account.amountLamports.toString(),
      status: statusName(account.status),
      createdAt: account.createdAt.toString(),
      fundedAt: account.fundedAt.toString(),
      approvedAt: account.approvedAt.toString(),
      paidAt: account.paidAt.toString(),
    };
  } catch {
    return null;
  }
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

export async function cancelTaskOnchain(wallet: WalletLike, taskEscrow: string) {
  const program = getProgram(wallet);
  return program.methods
    .cancelTask()
    .accounts({
      payer: wallet.publicKey!,
      taskEscrow: new PublicKey(taskEscrow),
    })
    .rpc();
}
