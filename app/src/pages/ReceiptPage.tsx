import { Copy, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ProviderEvidence } from "../components/ProviderEvidence";
import { ReceiptCard } from "../components/ReceiptCard";
import { Timeline } from "../components/Timeline";
import { receiptPayload } from "../lib/receipts";
import { explorerAddress, explorerTx } from "../lib/solana";
import type { AgentTask } from "../types";

export function ReceiptPage({ tasks }: { tasks: AgentTask[] }) {
  const { id } = useParams();
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return (
      <div className="page">
        <div className="panel">Receipt not found in this browser cache.</div>
      </div>
    );
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
  }

  return (
    <div className="page">
      <section className="detail-head">
        <div>
          <div className="eyebrow">Public payment artifact</div>
          <h1>Payment Receipt</h1>
          <p>{task.title}</p>
        </div>
        <button className="primary-action" onClick={copyLink}>
          <Copy size={18} /> Copy Receipt Link
        </button>
      </section>

      <section className="split">
        <div className="stack">
          <ReceiptCard task={task} />
          <div className="panel">
            <h2>Verification</h2>
            <div className="check-list">
              <span>Receipt hash: {task.receiptHash ? "present" : "missing"}</span>
              <span>Deliverable hash: {task.deliverableHash ? "present" : "missing"}</span>
              <span>Settlement: {task.settlementMode === "onchain-anchor" ? "Anchor SOL escrow" : "Demo-local seed"}</span>
              <span>Status: {task.status}</span>
            </div>
            {task.onchain?.taskEscrowPda ? (
              <a className="inline-link" href={explorerAddress(task.onchain.taskEscrowPda)} target="_blank" rel="noreferrer">
                Open escrow account <ExternalLink size={14} />
              </a>
            ) : null}
            {task.onchain?.releaseTx || task.payoutTx ? (
              <a className="inline-link" href={explorerTx(task.onchain?.releaseTx ?? task.payoutTx)} target="_blank" rel="noreferrer">
                Open release tx <ExternalLink size={14} />
              </a>
            ) : null}
          </div>
          <ProviderEvidence evidence={task.providerEvidence} />
        </div>
        <div className="stack">
          <div className="panel">
            <h2>Receipt Payload</h2>
            <pre>{JSON.stringify(receiptPayload(task), null, 2)}</pre>
          </div>
          <div className="panel">
            <h2>Timeline</h2>
            <Timeline task={task} />
          </div>
          <Link className="secondary-action" to="/">Back to Dashboard</Link>
        </div>
      </section>
    </div>
  );
}
