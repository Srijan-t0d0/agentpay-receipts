import type { AgentProvider } from "../types";

export const providers: AgentProvider[] = ["Zerion", "Covalent", "Dune SIM", "LPAgent", "Demo Agent"];

export const providerDescriptions: Record<AgentProvider, string> = {
  Zerion: "Portfolio, approvals, and activity evidence",
  Covalent: "Wallet balances and historical transfer checks",
  "Dune SIM": "SQL-style indexed wallet intelligence",
  LPAgent: "Liquidity and payout routing analysis",
  "Demo Agent": "Local seeded evidence for fast judging",
};
