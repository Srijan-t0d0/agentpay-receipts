import type { AgentProvider } from "../types";
import { providers } from "../data/providers";

export type TaskFormValues = {
  title: string;
  description: string;
  agentName: string;
  agentWallet: string;
  payoutAmount: string;
  provider: AgentProvider;
  inputWallet: string;
};

export function TaskForm({
  values,
  onChange,
}: {
  values: TaskFormValues;
  onChange: <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) => void;
}) {
  return (
    <div className="task-form-fields">
      <label>
        Task title
        <input value={values.title} onChange={(event) => onChange("title", event.target.value)} required />
      </label>
      <label>
        Description
        <textarea value={values.description} onChange={(event) => onChange("description", event.target.value)} required />
      </label>
      <label>
        Agent name
        <input value={values.agentName} onChange={(event) => onChange("agentName", event.target.value)} required />
      </label>
      <label>
        Agent wallet
        <input value={values.agentWallet} onChange={(event) => onChange("agentWallet", event.target.value)} required />
      </label>
      <div className="form-grid">
        <label>
          Payout SOL
          <input value={values.payoutAmount} onChange={(event) => onChange("payoutAmount", event.target.value)} inputMode="decimal" required />
        </label>
        <label>
          Provider
          <select value={values.provider} onChange={(event) => onChange("provider", event.target.value as AgentProvider)}>
            {providers.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Wallet to analyze
        <input value={values.inputWallet} onChange={(event) => onChange("inputWallet", event.target.value)} required />
      </label>
    </div>
  );
}
