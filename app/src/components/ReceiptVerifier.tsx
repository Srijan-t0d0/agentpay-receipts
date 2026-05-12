import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { fetchTaskEscrowAccount, type OnchainTaskEscrow } from "../lib/anchorClient";
import type { AgentTask } from "../types";

function matchesHash(left?: string, right?: string) {
  return Boolean(left && right && left === right);
}

export function ReceiptVerifier({ hash, task }: { hash?: string; task?: AgentTask }) {
  const [onchain, setOnchain] = useState<OnchainTaskEscrow | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setOnchain(null);

    if (!task?.onchain?.taskEscrowPda) return;

    setLoading(true);
    fetchTaskEscrowAccount(task.onchain.taskEscrowPda)
      .then((account) => {
        if (mounted) setOnchain(account);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [task?.onchain?.taskEscrowPda]);

  const checks = useMemo(() => {
    if (!task) {
      return [{ label: "Local receipt cache", state: "missing", detail: "No matching receipt was found in this browser cache." }];
    }

    return [
      {
        label: "Local receipt cache",
        state: "ok",
        detail: `Matched ${task.receiptHash ?? task.id}`,
      },
      {
        label: "Receipt hash matches request",
        state: hash && task.receiptHash === hash ? "ok" : "warning",
        detail: hash ? `Requested ${hash}` : "Opened without a receipt hash.",
      },
      {
        label: "Receipt hash matches onchain task account",
        state: task.settlementMode === "demo-local" ? "demo" : matchesHash(task.receiptHash, onchain?.receiptHash) ? "ok" : "warning",
        detail: task.settlementMode === "demo-local" ? "Seeded demo receipt has local-only settlement." : onchain?.receiptHash ?? "No onchain receipt hash read yet.",
      },
      {
        label: "Deliverable hash is stored onchain",
        state: task.settlementMode === "demo-local" ? "demo" : matchesHash(task.deliverableHash, onchain?.deliverableHash) ? "ok" : "warning",
        detail: task.settlementMode === "demo-local" ? "Demo-local task keeps deliverable proof in browser state." : onchain?.deliverableHash ?? "No onchain deliverable hash read yet.",
      },
    ];
  }, [hash, onchain, task]);

  return (
    <div className="panel">
      <div className="panel-heading">
        <h2>Receipt Verification</h2>
        {loading ? <LoaderCircle size={18} /> : null}
      </div>
      <div className="verify-list">
        {checks.map((check) => (
          <div className={`verify-row verify-${check.state}`} key={check.label}>
            {check.state === "ok" ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
            <div>
              <strong>{check.label}</strong>
              <span>{check.detail}</span>
            </div>
          </div>
        ))}
      </div>
      {task?.settlementMode === "demo-local" ? (
        <p className="muted demo-note">
          Seeded demo receipts are transparent local artifacts. Wallet-created tasks use the Anchor escrow account on devnet/localnet for settlement hashes.
        </p>
      ) : null}
    </div>
  );
}
