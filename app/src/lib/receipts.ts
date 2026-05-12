import type { AgentTask, ReceiptProof } from "../types";

export function receiptPayload(task: AgentTask) {
  return {
    id: task.id,
    title: task.title,
    payerWallet: task.payerWallet,
    agentWallet: task.agentWallet,
    amount: `${task.payoutAmount} ${task.payoutToken}`,
    provider: task.provider,
    taskHash: task.taskHash,
    deliverableHash: task.deliverableHash,
    paidAt: task.paidAt,
    taskEscrowPda: task.onchain?.taskEscrowPda,
    releaseTx: task.onchain?.releaseTx ?? task.payoutTx,
    proof: task.proof,
  };
}

export function receiptProof(task: AgentTask): ReceiptProof {
  if (task.settlementMode === "demo-local") {
    return {
      mode: "demo-local",
      receiptHash: task.receiptHash,
      taskHash: task.taskHash,
      deliverableHash: task.deliverableHash,
      memoTx: task.payoutTx,
      verifiedAt: new Date().toISOString(),
      note: "Seeded demo task uses local browser state plus fake tx links for judge-ready receipt review.",
    };
  }

  if (!task.onchain?.taskEscrowPda && task.payoutTx) {
    return {
      mode: "memo-proof",
      receiptHash: task.receiptHash,
      taskHash: task.taskHash,
      deliverableHash: task.deliverableHash,
      memoTx: task.payoutTx,
      verifiedAt: new Date().toISOString(),
      note: "Fallback proof records the receipt hash beside the payment transaction reference.",
    };
  }

  return {
    mode: "anchor-account",
    receiptHash: task.receiptHash,
    taskHash: task.taskHash,
    deliverableHash: task.deliverableHash,
    verifiedAt: new Date().toISOString(),
    note: "Receipt hash and deliverable hash are expected on the Anchor TaskEscrow account.",
  };
}
