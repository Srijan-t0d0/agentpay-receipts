import type { AgentProvider, ProviderEvidence } from "../types";

export function generateAgentRun(provider: AgentProvider, wallet?: string) {
  const observedAt = new Date().toISOString();

  const evidence: ProviderEvidence = {
    provider,
    queryLabel: "Wallet portfolio and activity summary",
    sourceWallet: wallet,
    observedAt,
    summary: "Medium risk: concentrated holdings with recent failed transactions.",
    rows: [
      { label: "Portfolio concentration", value: "72% in 2 assets", tone: "warning" },
      { label: "Recent swaps", value: "14" },
      { label: "Failed transactions", value: "3", tone: "warning" },
      { label: "New token approvals", value: "1", tone: "neutral" },
    ],
    rawPreview: {
      concentration: 0.72,
      swaps_30d: 14,
      failed_txs_30d: 3,
      approvals_30d: 1,
    },
  };

  return {
    evidence,
    summary:
      "Wallet risk: Medium. Portfolio concentration is 72% in 2 assets. Recent activity includes 14 swaps, 3 failed transactions, and 1 new token approval. Suggested action: require manual approval before recurring payments.",
    json: {
      risk: "Medium",
      portfolioConcentration: "72% in 2 assets",
      recentActivity: {
        swaps: 14,
        failedTransactions: 3,
        newTokenApprovals: 1,
      },
      recommendation: "Require manual approval before recurring payments",
      confidence: 0.84,
    },
  };
}
