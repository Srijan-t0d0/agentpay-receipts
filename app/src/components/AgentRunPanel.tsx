import { CheckCircle2, LoaderCircle } from "lucide-react";
import type { TaskStatus } from "../types";

const steps = ["Fetching provider data", "Scoring wallet risk", "Writing deliverable"];

export function AgentRunPanel({ status }: { status: TaskStatus }) {
  const active = status === "running";
  const complete = ["delivered", "approved", "paid"].includes(status);

  return (
    <div className="panel">
      <div className="panel-heading">
        <h2>Agent Run</h2>
        {active ? <LoaderCircle size={18} /> : <CheckCircle2 size={18} />}
      </div>
      <div className="run-sequence">
        {steps.map((step, index) => (
          <div className={active || complete ? "run-step run-step-active" : "run-step"} key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
