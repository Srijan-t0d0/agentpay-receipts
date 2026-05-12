export type SupportedCluster = "localnet" | "devnet";

export const CLUSTER = (import.meta.env.VITE_SOLANA_CLUSTER ?? "localnet") as SupportedCluster;
export const RPC_ENDPOINT =
  import.meta.env.VITE_SOLANA_RPC_ENDPOINT ??
  (CLUSTER === "devnet" ? "https://api.devnet.solana.com" : "http://127.0.0.1:8899");

export function explorerTx(tx?: string) {
  if (!tx) return "";
  if (CLUSTER === "localnet") {
    return `https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=${encodeURIComponent(RPC_ENDPOINT)}`;
  }
  return `https://explorer.solana.com/tx/${tx}?cluster=${CLUSTER}`;
}

export function explorerAddress(address?: string) {
  if (!address) return "";
  if (CLUSTER === "localnet") {
    return `https://explorer.solana.com/address/${address}?cluster=custom&customUrl=${encodeURIComponent(RPC_ENDPOINT)}`;
  }
  return `https://explorer.solana.com/address/${address}?cluster=${CLUSTER}`;
}

export function shortAddress(value?: string, size = 4) {
  if (!value) return "Not set";
  if (value.length <= size * 2 + 3) return value;
  return `${value.slice(0, size)}...${value.slice(-size)}`;
}
