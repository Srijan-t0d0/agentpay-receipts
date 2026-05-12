export type TaskStatus =
  | "draft"
  | "created"
  | "funded"
  | "running"
  | "delivered"
  | "approved"
  | "paid"
  | "cancelled";

export type AgentProvider =
  | "Zerion"
  | "Covalent"
  | "Dune SIM"
  | "LPAgent"
  | "Demo Agent";

export type SettlementMode = "onchain-anchor" | "demo-local";

export interface ProviderEvidence {
  provider: AgentProvider;
  queryLabel: string;
  sourceWallet?: string;
  observedAt: string;
  summary: string;
  rows: Array<{
    label: string;
    value: string;
    tone?: "neutral" | "good" | "warning" | "danger";
  }>;
  rawPreview?: Record<string, unknown>;
}

export interface OnchainRefs {
  programId: string;
  cluster: "devnet" | "localnet";
  taskEscrowPda: string;
  createTx?: string;
  fundTx?: string;
  approveTx?: string;
  releaseTx?: string;
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  payerWallet: string;
  agentName: string;
  agentWallet: string;
  provider: AgentProvider;
  payoutAmount: string;
  payoutToken: "SOL" | "USDC" | "USDT";
  settlementMode: SettlementMode;
  status: TaskStatus;
  createdAt: string;
  fundedAt?: string;
  deliveredAt?: string;
  approvedAt?: string;
  paidAt?: string;
  inputWallet?: string;
  providerEvidence?: ProviderEvidence;
  deliverableSummary?: string;
  deliverableJson?: Record<string, unknown>;
  taskHash?: string;
  deliverableHash?: string;
  receiptHash?: string;
  escrowTx?: string;
  payoutTx?: string;
  onchain?: OnchainRefs;
}
