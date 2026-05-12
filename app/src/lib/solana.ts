export const CLUSTER = "devnet" as const;
export const RPC_ENDPOINT = "https://api.devnet.solana.com";

export function explorerTx(tx?: string) {
  return tx ? `https://explorer.solana.com/tx/${tx}?cluster=${CLUSTER}` : "";
}

export function explorerAddress(address?: string) {
  return address ? `https://explorer.solana.com/address/${address}?cluster=${CLUSTER}` : "";
}

export function shortAddress(value?: string, size = 4) {
  if (!value) return "Not set";
  if (value.length <= size * 2 + 3) return value;
  return `${value.slice(0, size)}...${value.slice(-size)}`;
}
