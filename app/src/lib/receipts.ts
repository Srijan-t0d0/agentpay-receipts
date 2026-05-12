import type { AgentTask } from "../types";

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
  };
}
