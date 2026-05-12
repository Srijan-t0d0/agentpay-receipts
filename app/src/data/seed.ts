import type { AgentTask } from "../types";
import { makeTx } from "../lib/hashes";

const now = new Date();
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

export const seedTasks: AgentTask[] = [
  {
    id: "task_seed_paid_wallet_risk",
    title: "Analyze wallet risk before payout",
    description: "Review a contributor wallet before releasing a recurring agent payout.",
    payerWallet: "Demo7Yc4Ho1dPaymentDeskPayer111111111111111",
    agentName: "Risk Analyst Agent",
    agentWallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgQ2p",
    provider: "Zerion",
    payoutAmount: "0.25",
    payoutToken: "SOL",
    settlementMode: "demo-local",
    status: "paid",
    createdAt: minutesAgo(92),
    fundedAt: minutesAgo(86),
    deliveredAt: minutesAgo(78),
    approvedAt: minutesAgo(72),
    paidAt: minutesAgo(70),
    inputWallet: "Fh8cBrV6fPbJY2YwZKqVJ5fGW6cXHjGJZJ8nJm5e4tN8",
    taskHash: "task_8f719d6e25b0d7ce5b6bb9af905a462c",
    deliverableHash: "dlv_182c62b193790fbab4c1dd32e76e0bb8",
    receiptHash: "rcpt_a7959d6f3a4e73a7df5724d41ef8d0c6",
    escrowTx: makeTx(),
    payoutTx: makeTx(),
    deliverableSummary:
      "Wallet risk: Medium. Portfolio concentration is 72% in 2 assets with 14 swaps, 3 failed transactions, and 1 new token approval in the recent window.",
    deliverableJson: {
      risk: "Medium",
      concentration: "72% in 2 assets",
      swaps: 14,
      failedTransactions: 3,
      recommendation: "Require manual approval before recurring payments",
    },
    providerEvidence: {
      provider: "Zerion",
      queryLabel: "Wallet portfolio and activity summary",
      observedAt: minutesAgo(78),
      sourceWallet: "Fh8cBrV6fPbJY2YwZKqVJ5fGW6cXHjGJZJ8nJm5e4tN8",
      summary: "Medium risk: concentrated holdings with recent failed activity.",
      rows: [
        { label: "Top 2 assets", value: "72%", tone: "warning" },
        { label: "30-day swaps", value: "14" },
        { label: "Failed transactions", value: "3", tone: "warning" },
        { label: "New token approvals", value: "1", tone: "neutral" },
      ],
    },
  },
  {
    id: "task_seed_funded_treasury",
    title: "Check treasury concentration",
    description: "Summarize concentration risk before a founder grant payment.",
    payerWallet: "Demo5r1f TreasuryOps11111111111111111111111",
    agentName: "Treasury Scout",
    agentWallet: "8UPTw7zvN6EDgk2k7kY4Fd22wM7pNu3raN6hJqVf3XLM",
    provider: "Covalent",
    payoutAmount: "0.10",
    payoutToken: "SOL",
    settlementMode: "demo-local",
    status: "funded",
    createdAt: minutesAgo(44),
    fundedAt: minutesAgo(40),
    inputWallet: "8KWuMxCb4HfK9m6gK8GZp7nA9RYxVUENf2LZq5ip5WXv",
    taskHash: "task_f3b8c02b24e66a99138d611a7f6c881e",
    escrowTx: makeTx(),
  },
];
