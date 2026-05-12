import { ExternalLink, Receipt } from "lucide-react";
import type { AgentTask } from "../types";
import { explorerAddress, explorerTx, shortAddress } from "../lib/solana";

export function ReceiptCard({ task }: { task: AgentTask }) {
  return (
    <div className="receipt-card">
      <div className="receipt-title">
        <Receipt size={20} />
        <span>Payment Receipt</span>
      </div>
      <div className="receipt-row">
        <span>Receipt hash</span>
        <code>{task.receiptHash ?? "Pending"}</code>
      </div>
      <div className="receipt-row">
        <span>Task</span>
        <strong>{task.title}</strong>
      </div>
      <div className="receipt-row">
        <span>Payer</span>
        <code>{shortAddress(task.payerWallet, 6)}</code>
      </div>
      <div className="receipt-row">
        <span>Agent</span>
        <code>{shortAddress(task.agentWallet, 6)}</code>
      </div>
      <div className="receipt-row">
        <span>Amount</span>
        <strong>
          {task.payoutAmount} {task.payoutToken}
        </strong>
      </div>
      {task.onchain?.taskEscrowPda ? (
        <a className="inline-link" href={explorerAddress(task.onchain.taskEscrowPda)} target="_blank" rel="noreferrer">
          Escrow PDA <ExternalLink size={14} />
        </a>
      ) : null}
      {task.onchain?.releaseTx || task.payoutTx ? (
        <a className="inline-link" href={explorerTx(task.onchain?.releaseTx ?? task.payoutTx)} target="_blank" rel="noreferrer">
          Release transaction <ExternalLink size={14} />
        </a>
      ) : null}
    </div>
  );
}
