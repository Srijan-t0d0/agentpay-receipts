import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AgentProvider, AgentTask } from "../types";
import { makeId } from "../lib/hashes";

const providers: AgentProvider[] = ["Zerion", "Covalent", "Dune SIM", "LPAgent", "Demo Agent"];

export function NewTask({ onCreate }: { onCreate: (task: AgentTask) => void }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Analyze wallet risk before payout");
  const [description, setDescription] = useState("Use onchain-data-style evidence to summarize risk before releasing payment.");
  const [agentName, setAgentName] = useState("Risk Analyst Agent");
  const [agentWallet, setAgentWallet] = useState("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgQ2p");
  const [payoutAmount, setPayoutAmount] = useState("0.25");
  const [provider, setProvider] = useState<AgentProvider>("Zerion");
  const [inputWallet, setInputWallet] = useState("Fh8cBrV6fPbJY2YwZKqVJ5fGW6cXHjGJZJ8nJm5e4tN8");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const task: AgentTask = {
      id: makeId("task_"),
      title,
      description,
      payerWallet: "Connect wallet to create onchain",
      agentName,
      agentWallet,
      provider,
      payoutAmount,
      payoutToken: "SOL",
      settlementMode: "onchain-anchor",
      status: "draft",
      createdAt: new Date().toISOString(),
      inputWallet,
    };
    onCreate(task);
    navigate(`/task/${task.id}`);
  }

  return (
    <div className="page narrow">
      <div className="panel">
        <h1>Create Paid Agent Task</h1>
        <form className="task-form" onSubmit={submit}>
          <label>
            Task title
            <input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} required />
          </label>
          <label>
            Agent name
            <input value={agentName} onChange={(event) => setAgentName(event.target.value)} required />
          </label>
          <label>
            Agent wallet
            <input value={agentWallet} onChange={(event) => setAgentWallet(event.target.value)} required />
          </label>
          <div className="form-grid">
            <label>
              Payout SOL
              <input value={payoutAmount} onChange={(event) => setPayoutAmount(event.target.value)} inputMode="decimal" required />
            </label>
            <label>
              Provider
              <select value={provider} onChange={(event) => setProvider(event.target.value as AgentProvider)}>
                {providers.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Wallet to analyze
            <input value={inputWallet} onChange={(event) => setInputWallet(event.target.value)} required />
          </label>
          <button className="primary-action" type="submit">Create Work Order</button>
        </form>
      </div>
    </div>
  );
}
