import * as anchor from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowRight, ExternalLink, Play, ShieldCheck, Wallet } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ProviderEvidence } from "../components/ProviderEvidence";
import { ReceiptCard } from "../components/ReceiptCard";
import { StatusPill } from "../components/StatusPill";
import { Timeline } from "../components/Timeline";
import { approveTaskOnchain, createTaskOnchain, fundTaskOnchain, releasePaymentOnchain } from "../lib/anchorClient";
import { generateAgentRun } from "../lib/demoAgent";
import { canonicalJson, hashBytes, hashHex, makeTx, taskIdBytes } from "../lib/hashes";
import { receiptPayload } from "../lib/receipts";
import { explorerTx, shortAddress } from "../lib/solana";
import type { AgentTask } from "../types";

export function TaskDetail({ tasks, updateTask }: { tasks: AgentTask[]; updateTask: (task: AgentTask) => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const wallet = useWallet();
  const task = tasks.find((item) => item.id === id)!;

  if (!task) {
    return (
      <div className="page">
        <div className="panel">Task not found.</div>
      </div>
    );
  }

  async function createOnchain() {
    if (!wallet.publicKey) throw new Error("Connect a wallet first.");
    const payload = {
      title: task.title,
      description: task.description,
      agentWallet: task.agentWallet,
      payoutAmount: task.payoutAmount,
      inputWallet: task.inputWallet,
    };
    const [taskHashBytes, idBytes] = await Promise.all([hashBytes(canonicalJson(payload)), taskIdBytes(task.id)]);
    const result = await createTaskOnchain({
      wallet,
      taskId: idBytes,
      taskHash: taskHashBytes,
      agentWallet: task.agentWallet,
      amountLamports: new anchor.BN(Math.round(Number(task.payoutAmount) * anchor.web3.LAMPORTS_PER_SOL)),
    });

    updateTask({
      ...task,
      payerWallet: wallet.publicKey.toBase58(),
      taskHash: await hashHex(canonicalJson(payload), "task_"),
      status: "created",
      onchain: {
        programId: result.programId,
        cluster: result.cluster,
        taskEscrowPda: result.taskEscrow,
        createTx: result.tx,
      },
    });
  }

  async function fund() {
    if (task.onchain?.taskEscrowPda && wallet.publicKey) {
      const tx = await fundTaskOnchain(wallet, task.onchain.taskEscrowPda);
      updateTask({
        ...task,
        status: "funded",
        fundedAt: new Date().toISOString(),
        escrowTx: tx,
        onchain: { ...task.onchain, fundTx: tx },
      });
      return;
    }

    updateTask({ ...task, status: "funded", fundedAt: new Date().toISOString(), escrowTx: makeTx() });
  }

  function runAgent() {
    updateTask({ ...task, status: "running" });
    window.setTimeout(() => {
      const run = generateAgentRun(task.provider, task.inputWallet);
      updateTask({
        ...task,
        status: "delivered",
        deliveredAt: new Date().toISOString(),
        providerEvidence: run.evidence,
        deliverableSummary: run.summary,
        deliverableJson: run.json,
      });
    }, 700);
  }

  async function approve() {
    const deliverableHashBytes = await hashBytes(canonicalJson(task.deliverableJson ?? task.deliverableSummary ?? task.id));
    const deliverableHash = await hashHex(canonicalJson(task.deliverableJson ?? task.deliverableSummary ?? task.id), "dlv_");
    let approveTx: string | undefined;

    if (task.onchain?.taskEscrowPda && wallet.publicKey) {
      approveTx = await approveTaskOnchain(wallet, task.onchain.taskEscrowPda, deliverableHashBytes);
    }

    updateTask({
      ...task,
      status: "approved",
      approvedAt: new Date().toISOString(),
      deliverableHash,
      onchain: task.onchain && approveTx ? { ...task.onchain, approveTx } : task.onchain,
    });
  }

  async function release() {
    const paidAt = new Date().toISOString();
    const receiptHashBytes = await hashBytes(canonicalJson({ ...receiptPayload(task), paidAt }));
    const receiptHash = await hashHex(canonicalJson({ ...receiptPayload(task), paidAt }), "rcpt_");
    let releaseTx: string | undefined;

    if (task.onchain?.taskEscrowPda && wallet.publicKey) {
      releaseTx = await releasePaymentOnchain(wallet, task.onchain.taskEscrowPda, task.agentWallet, receiptHashBytes);
    }

    updateTask({
      ...task,
      status: "paid",
      paidAt,
      receiptHash,
      payoutTx: releaseTx ?? makeTx(),
      onchain: task.onchain && releaseTx ? { ...task.onchain, releaseTx } : task.onchain,
    });
  }

  async function act() {
    try {
      if (task.status === "draft") await createOnchain();
      else if (task.status === "created") await fund();
      else if (task.status === "funded") runAgent();
      else if (task.status === "delivered") await approve();
      else if (task.status === "approved") await release();
      else if (task.status === "paid") navigate(`/receipt/${task.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Action failed");
    }
  }

  const actionLabel: Record<string, string> = {
    draft: wallet.publicKey ? "Create Onchain Task" : "Connect Wallet First",
    created: "Fund Escrow",
    funded: "Run Agent",
    running: "Running Agent",
    delivered: "Approve Payout",
    approved: "Release Payment",
    paid: "View Receipt",
    cancelled: "Cancelled",
  };

  return (
    <div className="page">
      <section className="detail-head">
        <div>
          <StatusPill status={task.status} />
          <h1>{task.title}</h1>
          <p>{task.description}</p>
        </div>
        <button className="primary-action" disabled={task.status === "running" || (task.status === "draft" && !wallet.publicKey)} onClick={act}>
          {task.status === "funded" ? <Play size={18} /> : <ArrowRight size={18} />}
          {actionLabel[task.status]}
        </button>
      </section>

      <section className="split">
        <div className="stack">
          <div className="panel">
            <div className="panel-heading">
              <h2>Task Terms</h2>
              <span className="chip">{task.settlementMode}</span>
            </div>
            <div className="terms-grid">
              <Info label="Payer" value={shortAddress(task.payerWallet, 6)} />
              <Info label="Agent" value={shortAddress(task.agentWallet, 6)} />
              <Info label="Payout" value={`${task.payoutAmount} ${task.payoutToken}`} />
              <Info label="Provider" value={task.provider} />
              <Info label="Escrow PDA" value={shortAddress(task.onchain?.taskEscrowPda, 6)} />
              <Info label="Program" value={shortAddress(task.onchain?.programId, 6)} />
            </div>
            {task.onchain?.fundTx ? (
              <a className="inline-link" href={explorerTx(task.onchain.fundTx)} target="_blank" rel="noreferrer">
                Fund tx <ExternalLink size={14} />
              </a>
            ) : null}
          </div>
          <ProviderEvidence evidence={task.providerEvidence} />
          {task.deliverableSummary ? (
            <div className="panel">
              <h2>Agent Deliverable</h2>
              <p>{task.deliverableSummary}</p>
              <code className="block-code">{task.deliverableHash ?? "Deliverable hash appears after approval."}</code>
            </div>
          ) : null}
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-heading">
              <h2>Timeline</h2>
              <ShieldCheck size={18} />
            </div>
            <Timeline task={task} />
          </div>
          <ReceiptCard task={task} />
          <div className="panel">
            <h3>Wallet Action</h3>
            <p className="muted">
              <Wallet size={14} /> Onchain tasks use Phantom-compatible devnet signing. Demo-local seed tasks keep fake tx references for judges without a wallet.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="info">
      <span>{label}</span>
      <code>{value ?? "Pending"}</code>
    </div>
  );
}
