import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { ReceiptCard } from "../components/ReceiptCard";
import { TaskForm, type TaskFormValues } from "../components/TaskForm";
import type { AgentTask } from "../types";
import { makeId } from "../lib/hashes";

const presets: Array<{ label: string; values: TaskFormValues }> = [
  {
    label: "Wallet risk report",
    values: {
      title: "Analyze wallet risk before payout",
      description: "Use provider evidence to summarize wallet risk before releasing payment.",
      agentName: "Risk Analyst Agent",
      agentWallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgQ2p",
      payoutAmount: "0.25",
      provider: "Zerion",
      inputWallet: "Fh8cBrV6fPbJY2YwZKqVJ5fGW6cXHjGJZJ8nJm5e4tN8",
    },
  },
  {
    label: "Treasury concentration check",
    values: {
      title: "Check treasury concentration",
      description: "Summarize concentration risk before a founder grant payment.",
      agentName: "Treasury Scout",
      agentWallet: "8UPTw7zvN6EDgk2k7kY4Fd22wM7pNu3raN6hJqVf3XLM",
      payoutAmount: "0.10",
      provider: "Covalent",
      inputWallet: "8KWuMxCb4HfK9m6gK8GZp7nA9RYxVUENf2LZq5ip5WXv",
    },
  },
  {
    label: "Payout compliance review",
    values: {
      title: "Review payout compliance",
      description: "Check recent activity, sanctions-like flags, and payout readiness before settlement.",
      agentName: "Compliance Review Agent",
      agentWallet: "6xQ8PZQxbJ6xkPshSca2MRHkSk1x3UYyS7zR9VcSH8vT",
      payoutAmount: "0.18",
      provider: "Dune SIM",
      inputWallet: "4Nd1mREdmbbgrLJP5yrGkgWYb84M4bXQdqPvxkQ3zY9H",
    },
  },
];

function isPublicKey(value: string) {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

export function NewTask({ onCreate }: { onCreate: (task: AgentTask) => void }) {
  const navigate = useNavigate();
  const [values, setValues] = useState<TaskFormValues>(presets[0].values);

  const validation = [
    { label: "Agent wallet is a Solana public key", ok: isPublicKey(values.agentWallet) },
    { label: "Wallet to analyze is a Solana public key", ok: isPublicKey(values.inputWallet) },
    { label: "Payout is greater than 0 and no more than 5 SOL", ok: Number(values.payoutAmount) > 0 && Number(values.payoutAmount) <= 5 },
    { label: "Description is specific enough for a receipt", ok: values.description.trim().length >= 32 },
  ];
  const valid = validation.every((item) => item.ok);

  function updateValue<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const preview: AgentTask = {
    id: "preview",
    title: values.title || "Untitled task",
    description: values.description,
    payerWallet: "Wallet connects on task detail",
    agentName: values.agentName,
    agentWallet: values.agentWallet,
    provider: values.provider,
    payoutAmount: values.payoutAmount || "0",
    payoutToken: "SOL",
    settlementMode: "onchain-anchor",
    status: "draft",
    createdAt: new Date().toISOString(),
    inputWallet: values.inputWallet,
  };

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) return;

    const task: AgentTask = {
      id: makeId("task_"),
      title: values.title.trim(),
      description: values.description.trim(),
      payerWallet: "Connect wallet to create onchain",
      agentName: values.agentName.trim(),
      agentWallet: values.agentWallet.trim(),
      provider: values.provider,
      payoutAmount: values.payoutAmount.trim(),
      payoutToken: "SOL",
      settlementMode: "onchain-anchor",
      status: "draft",
      createdAt: new Date().toISOString(),
      inputWallet: values.inputWallet.trim(),
    };
    onCreate(task);
    navigate(`/task/${task.id}`);
  }

  return (
    <div className="page">
      <section className="detail-head">
        <div>
          <div className="eyebrow">Paid agent work order</div>
          <h1>Create Paid Agent Task</h1>
          <p>Pick a preset, tune the terms, and preview the receipt before opening the wallet flow.</p>
        </div>
      </section>
      <section className="split">
        <div className="panel">
          <div className="preset-row">
            {presets.map((preset) => (
              <button className="secondary-action" key={preset.label} type="button" onClick={() => setValues(preset.values)}>
                {preset.label}
              </button>
            ))}
          </div>
        <form className="task-form" onSubmit={submit}>
          <TaskForm values={values} onChange={updateValue} />
          <button className="primary-action" type="submit" disabled={!valid}>Create Work Order</button>
        </form>
        </div>
        <div className="stack">
          <div className="panel">
            <h2>Validation</h2>
            <div className="verify-list">
              {validation.map((item) => (
                <div className={item.ok ? "verify-row verify-ok" : "verify-row verify-warning"} key={item.label}>
                  {item.ok ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
                  <strong>{item.label}</strong>
                </div>
              ))}
            </div>
          </div>
          <ReceiptCard task={preview} />
        </div>
      </section>
    </div>
  );
}
