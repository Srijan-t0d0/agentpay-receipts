import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { CircleAlert, CircleCheck, LoaderCircle, Wallet } from "lucide-react";
import { CLUSTER, shortAddress } from "../lib/solana";

function hasPhantom() {
  const maybeWindow = window as Window & { solana?: { isPhantom?: boolean } };
  return Boolean(maybeWindow.solana?.isPhantom);
}

export function WalletBadge() {
  const wallet = useWallet();
  const phantomDetected = useMemo(() => hasPhantom(), []);
  const state = wallet.connecting ? "connecting" : wallet.connected ? "connected" : phantomDetected ? "ready" : "phantom missing";
  const icon = wallet.connecting ? <LoaderCircle size={14} /> : wallet.connected ? <CircleCheck size={14} /> : <CircleAlert size={14} />;

  return (
    <div className="wallet-badge" data-state={state}>
      {icon}
      <div>
        <span>{wallet.connected ? shortAddress(wallet.publicKey?.toBase58(), 4) : state}</span>
        <small>
          <Wallet size={12} /> Phantom {phantomDetected ? "detected" : "not detected"} · {CLUSTER}
        </small>
      </div>
    </div>
  );
}
